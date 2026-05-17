import { motion } from "framer-motion";

// Existing AVIFs (handcurated subset, most striking)
const tiles = [
  "woman_emerging_from_cables.avif",
  "command_center_with_holographic.avif",
  "woman_face_cybernetic_implant.avif",
  "crimson_soundwave_morphs_into_lips.avif",
  "woman_holding_glowing_microphone.avif",
  "lips_speaking_into_microphone_wa.avif",
  "woman_in_data_storm.avif",
  "eye_reflecting_scrolling_termina.avif",
  "rawvox_logo_formed_cables.avif",
  "monolith_with_glowing_red_text.avif",
  "woman_manipulating_holographic_data.avif",
  "woman_face_reflected_shattered.avif",
];

export function Gallery() {
  return (
    <section className="relative py-32 border-t border-border-subtle overflow-hidden">
      <div className="mx-auto max-w-[1280px] px-6">
        <div className="flex items-center gap-3 mb-5">
          <span className="font-mono text-xs text-raw">·</span>
          <span className="h-px flex-1 bg-border-subtle max-w-12" />
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
            gallery
          </span>
        </div>
        <h2 className="font-display text-4xl md:text-5xl font-semibold mb-12 max-w-2xl">
          A voice that knows
          <br />
          <span className="text-gradient-raw">what you don't say.</span>
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {tiles.map((file, i) => (
            <motion.div
              key={file}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: (i % 4) * 0.05 }}
              className="group relative aspect-square rounded-lg overflow-hidden border border-border-subtle bg-elev-1"
            >
              <img
                src={`/assets/${file}`}
                alt=""
                loading="lazy"
                className="size-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-void/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
