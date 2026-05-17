import { useEffect, useRef } from "react";
import * as THREE from "three";
import { AsciiEffect } from "three/examples/jsm/effects/AsciiEffect.js";

export type AvatarState = "idle" | "listen" | "think" | "speak";

const CHARSET = " .:-+*=%@#";

/**
 * Procedural ASCII 3D head. Pure three.js — no GLB, no blendshapes.
 * The mouth quad scales vertically from `level` (0..1).
 * Eyes blink on a stochastic timer; brow lifts on `think`.
 */
export function AsciiHead({
  state,
  level,
  size = 280,
  color = "#FF1F44",
  bg = "transparent",
}: {
  state: AvatarState;
  level: number; // 0..1
  size?: number;
  color?: string;
  bg?: string;
}) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const stateRef = useRef<AvatarState>(state);
  const levelRef = useRef<number>(level);

  // Keep refs hot — render loop reads them without re-mounting.
  useEffect(() => {
    stateRef.current = state;
  }, [state]);
  useEffect(() => {
    levelRef.current = level;
  }, [level]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0.1, 4.6);
    camera.lookAt(0, 0, 0);

    // === lights ===
    const key = new THREE.DirectionalLight(0xffffff, 1.6);
    key.position.set(-2, 2, 3);
    scene.add(key);
    const fill = new THREE.PointLight(0xff2244, 0.6, 10);
    fill.position.set(2, -1, 3);
    scene.add(fill);
    scene.add(new THREE.AmbientLight(0xffffff, 0.15));

    // === head ===
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(1, 48, 48),
      new THREE.MeshPhongMaterial({ shininess: 12, flatShading: false })
    );
    head.scale.set(0.95, 1.18, 1.0);
    scene.add(head);

    // === hair (cap on top of skull) ===
    const hair = new THREE.Mesh(
      new THREE.SphereGeometry(
        1.02,
        48,
        24,
        0,
        Math.PI * 2,
        0,
        Math.PI / 2.15
      ),
      new THREE.MeshPhongMaterial({ shininess: 4 })
    );
    hair.position.y = 0.05;
    hair.scale.set(0.97, 1.2, 1.02);
    scene.add(hair);

    // === eyes ===
    const eyeGeo = new THREE.SphereGeometry(0.11, 16, 16);
    const eyeMat = new THREE.MeshPhongMaterial({ shininess: 60 });
    const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
    const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
    eyeL.position.set(-0.28, 0.12, 0.82);
    eyeR.position.set(0.28, 0.12, 0.82);
    scene.add(eyeL);
    scene.add(eyeR);

    // === eyelids (planes that slide down to "close") ===
    const lidGeo = new THREE.PlaneGeometry(0.26, 0.22);
    const lidMat = new THREE.MeshPhongMaterial({ side: THREE.DoubleSide });
    const lidL = new THREE.Mesh(lidGeo, lidMat);
    const lidR = new THREE.Mesh(lidGeo, lidMat);
    lidL.position.set(-0.28, 0.5, 0.93);
    lidR.position.set(0.28, 0.5, 0.93);
    scene.add(lidL);
    scene.add(lidR);

    // === brow lines ===
    const browGeo = new THREE.BoxGeometry(0.28, 0.04, 0.04);
    const browMat = new THREE.MeshPhongMaterial();
    const browL = new THREE.Mesh(browGeo, browMat);
    const browR = new THREE.Mesh(browGeo, browMat);
    browL.position.set(-0.28, 0.32, 0.88);
    browR.position.set(0.28, 0.32, 0.88);
    scene.add(browL);
    scene.add(browR);

    // === mouth (the audio-driven one) ===
    const mouthGeo = new THREE.SphereGeometry(0.18, 24, 24);
    const mouthMat = new THREE.MeshPhongMaterial({ shininess: 40 });
    const mouth = new THREE.Mesh(mouthGeo, mouthMat);
    mouth.position.set(0, -0.34, 0.84);
    mouth.scale.set(1, 0.18, 0.6);
    scene.add(mouth);

    // === neck shoulders hint ===
    const neck = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.55, 0.5, 32),
      new THREE.MeshPhongMaterial()
    );
    neck.position.set(0, -1.35, 0);
    scene.add(neck);

    // === implant detail (glowing dot near ear) ===
    const implant = new THREE.Mesh(
      new THREE.SphereGeometry(0.04, 12, 12),
      new THREE.MeshBasicMaterial()
    );
    implant.position.set(-0.92, 0.05, 0.2);
    scene.add(implant);

    // === renderer + AsciiEffect ===
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(size, size);

    const effect = new AsciiEffect(renderer, CHARSET, {
      invert: true,
      resolution: 0.22, // bigger = chunkier chars
      scale: 1,
    });
    effect.setSize(size, size);
    effect.domElement.style.color = color;
    effect.domElement.style.backgroundColor = bg;
    effect.domElement.style.lineHeight = "1";
    effect.domElement.style.letterSpacing = "0";
    effect.domElement.style.fontFamily =
      '"JetBrains Mono", ui-monospace, monospace';
    effect.domElement.style.fontWeight = "500";
    effect.domElement.style.fontSize = "8px";
    effect.domElement.style.userSelect = "none";
    effect.domElement.style.pointerEvents = "none";
    effect.domElement.style.width = "100%";
    effect.domElement.style.height = "100%";

    mount.appendChild(effect.domElement);

    // === animation ===
    let raf = 0;
    let blinkUntil = 0;
    let nextBlink = performance.now() + 1500 + Math.random() * 2500;
    const start = performance.now();
    let mouthVel = 0;
    let mouthCur = 0.18;

    const animate = () => {
      const t = (performance.now() - start) / 1000;
      const s = stateRef.current;
      const rawLevel = levelRef.current;

      // gentle idle breathing
      const breathe = Math.sin(t * 1.3) * 0.012;
      head.position.y = breathe;
      hair.position.y = 0.05 + breathe;

      // head sway depends on state
      const swayX =
        s === "think" ? Math.sin(t * 0.6) * 0.18 : Math.sin(t * 0.3) * 0.05;
      const swayY = Math.sin(t * 0.2) * 0.04;
      head.rotation.y = swayX;
      head.rotation.x = swayY;
      hair.rotation.y = swayX;
      hair.rotation.x = swayY;
      eyeL.position.x = -0.28 + swayX * 0.05;
      eyeR.position.x = 0.28 + swayX * 0.05;

      // blinking
      const now = performance.now();
      if (now > nextBlink && blinkUntil < now) {
        blinkUntil = now + 110;
        nextBlink = now + 2200 + Math.random() * 2800;
      }
      const blinking = now < blinkUntil;

      // eye darting on listen
      const dart =
        s === "listen" ? Math.sin(t * 6) * 0.04 : Math.sin(t * 0.8) * 0.012;
      eyeL.position.z = 0.82 + dart * 0.1;
      eyeR.position.z = 0.82 - dart * 0.1;

      // lid opacity blink trick
      if (blinking) {
        lidL.position.y = 0.12;
        lidR.position.y = 0.12;
      } else {
        lidL.position.y = 0.5;
        lidR.position.y = 0.5;
      }

      // brow lift on think
      const browLift = s === "think" ? 0.06 : 0;
      browL.position.y = 0.32 + browLift;
      browR.position.y = 0.32 + browLift;

      // mouth: target driven by audio level when speaking, else by state
      const target =
        s === "speak"
          ? 0.18 + Math.min(1, rawLevel * 1.3) * 0.95
          : s === "think"
            ? 0.22
            : s === "listen"
              ? 0.18
              : 0.16;

      // damped spring toward target for natural mouth motion
      const k = 22; // stiffness
      const d = 5; // damping
      const dt = 1 / 60;
      const accel = (target - mouthCur) * k - mouthVel * d;
      mouthVel += accel * dt;
      mouthCur += mouthVel * dt;

      const mw = 1 + (s === "speak" ? rawLevel * 0.18 : 0);
      mouth.scale.set(mw, Math.max(0.1, mouthCur), 0.55);

      // implant pulse
      const pulse = 0.6 + Math.sin(t * 4) * 0.4;
      (implant.material as THREE.MeshBasicMaterial).color.setRGB(
        pulse,
        0.05,
        0.1
      );

      effect.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);

    // === resize ===
    const ro = new ResizeObserver(() => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      if (w && h) {
        renderer.setSize(w, h);
        effect.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      }
    });
    ro.observe(mount);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      effect.domElement.remove();
      renderer.dispose();
      head.geometry.dispose();
      hair.geometry.dispose();
      eyeGeo.dispose();
      lidGeo.dispose();
      browGeo.dispose();
      mouthGeo.dispose();
      neck.geometry.dispose();
      implant.geometry.dispose();
    };
    // size/color changes remount — usually fine.
  }, [size, color, bg]);

  return (
    <div
      ref={mountRef}
      className="relative aspect-square w-full max-w-[280px] mx-auto"
      style={{ minHeight: 200 }}
    />
  );
}
