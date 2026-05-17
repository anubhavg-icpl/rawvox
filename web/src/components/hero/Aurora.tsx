import { motion } from "framer-motion";

export function Aurora() {
  return (
    <div
      aria-hidden
      className="absolute inset-0 overflow-hidden pointer-events-none"
    >
      {/* Grid */}
      <div className="absolute inset-0 bg-grid opacity-50 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />

      {/* Aurora blobs */}
      <motion.div
        className="absolute -top-32 -left-32 size-[640px] rounded-full blur-[140px] opacity-50"
        style={{
          background:
            "radial-gradient(circle, rgb(220 38 38) 0%, transparent 70%)",
        }}
        animate={{ x: [0, 60, -40, 0], y: [0, 40, -20, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/4 right-0 size-[560px] rounded-full blur-[140px] opacity-40"
        style={{
          background:
            "radial-gradient(circle, rgb(139 92 246) 0%, transparent 70%)",
        }}
        animate={{ x: [0, -50, 30, 0], y: [0, -30, 50, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 left-1/3 size-[480px] rounded-full blur-[140px] opacity-30"
        style={{
          background:
            "radial-gradient(circle, rgb(0 229 255) 0%, transparent 70%)",
        }}
        animate={{ x: [0, 40, -40, 0], y: [0, -20, 30, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-void" />
    </div>
  );
}
