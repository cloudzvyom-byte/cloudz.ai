import { motion } from "framer-motion";

export function Unblocks() {
  return (
    <section className="relative overflow-hidden py-32">
      {/* Background is now global fixed on body */}
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="max-w-3xl text-left"
        >
          <h2
            className="text-balance text-white font-bold"
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "clamp(2.25rem, 6vw, 5rem)",
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
            }}
          >
            Cloud unblocks creativity <em className="italic font-serif opacity-80">at scale</em>.
          </h2>
          <p className="mt-6 max-w-xl text-lg text-white/70 md:text-xl leading-relaxed font-light">
            Organize your work, approve what matters, and multiply it across
            every channel. All in one place.
          </p>
        </motion.div>

        <div className="mt-20 grid grid-cols-1 gap-6 md:grid-cols-2">
          {[
            {
              title: "Canvas",
              body: "Make it once. Run it everywhere. Take any approved asset and multiply it. Resize, reformat, adapt for any channel, directly in Cloud.",
            },
            {
              title: "Conversational Search",
              body: "Find anything. Even if you don't know what it's called. Search by color, object, face, or however you remember it.",
            },
          ].map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="rounded-3xl border border-white/20 bg-white/10 p-10 backdrop-blur-xl shadow-lg hover:bg-white/15 transition-all"
            >
              <h3
                className="text-white font-bold"
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
                  letterSpacing: "-0.01em",
                }}
              >
                {c.title}
              </h3>
              <p className="mt-4 text-base text-white/70 md:text-lg leading-relaxed font-light">{c.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
