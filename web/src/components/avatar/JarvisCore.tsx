import { useEffect, useRef } from "react";
import * as THREE from "three";
import { AsciiEffect } from "three/examples/jsm/effects/AsciiEffect.js";

export type CoreState = "idle" | "listen" | "think" | "speak";

const CHARSET = " .:-+*=%@#";

const STATE_COLOR: Record<CoreState, string> = {
  idle: "#7a1f2f",
  listen: "#00E5FF",
  think: "#8B5CF6",
  speak: "#FF1F44",
};

/**
 * The Jarvis-style core orb. A three.js icosphere whose vertices are
 * displaced each frame from a pseudo-Perlin offset plus the live audio
 * level, then rendered through AsciiEffect so the whole thing reads as
 * pulsing terminal characters.
 */
export function JarvisCore({
  state,
  level,
  size = 360,
}: {
  state: CoreState;
  level: number; // 0..1
  size?: number;
}) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const stateRef = useRef<CoreState>(state);
  const levelRef = useRef<number>(level);

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
    camera.position.set(0, 0, 4.6);
    camera.lookAt(0, 0, 0);

    // === lighting ===
    const key = new THREE.DirectionalLight(0xffffff, 1.8);
    key.position.set(-2, 1.5, 3);
    scene.add(key);
    const rim = new THREE.PointLight(0xff2244, 1.2, 12);
    rim.position.set(2, -1.5, 2);
    scene.add(rim);
    scene.add(new THREE.AmbientLight(0xffffff, 0.15));

    // === orb ===
    const geo = new THREE.IcosahedronGeometry(1.05, 5);
    const basePositions = geo.attributes.position.array.slice() as Float32Array;
    const mat = new THREE.MeshPhongMaterial({
      shininess: 36,
      flatShading: false,
    });
    const orb = new THREE.Mesh(geo, mat);
    scene.add(orb);

    // === inner glow ball ===
    const core = new THREE.Mesh(
      new THREE.SphereGeometry(0.55, 32, 32),
      new THREE.MeshBasicMaterial()
    );
    scene.add(core);

    // === orbital sliver rings (subtle, ASCII brings them out) ===
    const rings: THREE.Mesh[] = [];
    for (let i = 0; i < 3; i++) {
      const r = 1.35 + i * 0.25;
      const torus = new THREE.Mesh(
        new THREE.TorusGeometry(r, 0.015, 8, 96),
        new THREE.MeshPhongMaterial({ shininess: 80 })
      );
      torus.rotation.x = Math.PI / 2 + (i - 1) * 0.3;
      torus.rotation.y = i * 0.5;
      scene.add(torus);
      rings.push(torus);
    }

    // === renderer + AsciiEffect ===
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(size, size);

    const effect = new AsciiEffect(renderer, CHARSET, {
      invert: true,
      resolution: 0.2,
      scale: 1,
    });
    effect.setSize(size, size);
    const ed = effect.domElement;
    ed.style.color = STATE_COLOR.idle;
    ed.style.backgroundColor = "transparent";
    ed.style.lineHeight = "1";
    ed.style.letterSpacing = "0";
    ed.style.fontFamily = '"JetBrains Mono", ui-monospace, monospace';
    ed.style.fontWeight = "500";
    ed.style.fontSize = "8px";
    ed.style.userSelect = "none";
    ed.style.pointerEvents = "none";
    ed.style.width = "100%";
    ed.style.height = "100%";
    mount.appendChild(ed);

    // === noise (cheap pseudo-Perlin via stacked sines) ===
    const noise = (x: number, y: number, z: number, t: number) => {
      return (
        Math.sin(x * 2.1 + t * 0.7) * 0.5 +
        Math.sin(y * 2.3 + t * 0.9) * 0.5 +
        Math.sin(z * 1.7 + t * 0.5) * 0.5 +
        Math.sin((x + y) * 1.3 + t * 1.1) * 0.3
      );
    };

    let raf = 0;
    const t0 = performance.now();

    const animate = () => {
      const t = (performance.now() - t0) / 1000;
      const s = stateRef.current;
      const rawLevel = levelRef.current;

      // === recolor on state ===
      const color = STATE_COLOR[s];
      ed.style.color = color;

      // === displace verts ===
      const pos = geo.attributes.position.array as Float32Array;
      const amp = (s === "speak"
        ? 0.18 + rawLevel * 0.35
        : s === "think"
          ? 0.10 + Math.sin(t * 2) * 0.05
          : s === "listen"
            ? 0.08 + rawLevel * 0.18
            : 0.05) * 1.0;

      for (let i = 0; i < pos.length; i += 3) {
        const bx = basePositions[i];
        const by = basePositions[i + 1];
        const bz = basePositions[i + 2];
        const len = Math.sqrt(bx * bx + by * by + bz * bz);
        const nx = bx / len;
        const ny = by / len;
        const nz = bz / len;
        const n = noise(bx, by, bz, t) * amp;
        pos[i] = bx + nx * n;
        pos[i + 1] = by + ny * n;
        pos[i + 2] = bz + nz * n;
      }
      geo.attributes.position.needsUpdate = true;
      geo.computeVertexNormals();

      // === overall pulse ===
      const breathe =
        s === "speak"
          ? 1 + rawLevel * 0.12
          : 1 + Math.sin(t * (s === "think" ? 2.4 : 1.1)) * 0.025;
      orb.scale.set(breathe, breathe, breathe);

      // === rotation ===
      const baseSpin = s === "think" ? 0.6 : 0.18;
      orb.rotation.y = t * baseSpin;
      orb.rotation.x = Math.sin(t * 0.3) * 0.4;

      rings.forEach((r, i) => {
        const sign = i % 2 === 0 ? 1 : -1;
        const speed = 0.4 + i * 0.25 + (s === "speak" ? rawLevel * 1.5 : 0);
        r.rotation.z = t * speed * sign;
        r.rotation.x = Math.PI / 2 + (i - 1) * 0.3 + Math.sin(t * 0.4) * 0.1;
      });

      // === core color/pulse ===
      const c = new THREE.Color(color);
      (core.material as THREE.MeshBasicMaterial).color = c;
      const corePulse =
        s === "speak" ? 0.55 + rawLevel * 0.35 : 0.5 + Math.sin(t * 2) * 0.08;
      core.scale.set(corePulse, corePulse, corePulse);

      // === rim light follows state ===
      rim.color = c;
      rim.intensity = s === "speak" ? 1.2 + rawLevel * 1.8 : 0.9;

      effect.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);

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
      ed.remove();
      renderer.dispose();
      geo.dispose();
      core.geometry.dispose();
      rings.forEach((r) => r.geometry.dispose());
    };
  }, [size]);

  return (
    <div
      ref={mountRef}
      className="relative aspect-square w-full"
      style={{ minHeight: 200 }}
    />
  );
}
