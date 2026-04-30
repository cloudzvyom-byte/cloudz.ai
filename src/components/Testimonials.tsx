import { motion } from "framer-motion";

const items = [
  {
    quote:
      "Cloud replaced four tools and a Slack channel of dread. Our brand finally feels like one thing.",
    name: "Maya Okafor",
    role: "Head of Brand, Halcyon",
  },
  {
    quote:
      "The first asset platform that creatives actually want to open. It's quiet, fast, and stays out of the way.",
    name: "Theo Lin",
    role: "Creative Director, Lumen",
  },
  {
    quote:
      "We onboarded 60 contractors in a week. Everyone found what they needed without asking once.",
    name: "Priya Raman",
    role: "Producer, Atlas Studio",
  },
  {
    quote:
      "Reviews used to take days. Now they take a coffee. Cloud paid for itself in the first month.",
    name: "Jonas Weber",
    role: "VP Marketing, Northwind",
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="relative py-32 overflow-hidden">
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="mb-20 max-w-3xl">
          <p className="mb-6 text-sm font-bold uppercase tracking-[0.4em] text-white"
             style={{ textShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
            Loved by creative teams
          </p>
          <h2
            className="text-balance text-white font-bold"
            style={{
              fontSize: "clamp(2rem, 5vw, 4rem)",
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              textShadow: "0 10px 40px rgba(0,0,0,0.1)",
            }}
          >
            Creative Intelligence. <br/>
            Words from people who <em className="italic opacity-90">ship</em>.
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {items.map((t, i) => (
            <motion.figure
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: i * 0.12 }}
              className="group relative rounded-[2rem] glass-card p-10 transition-all"
            >
              <svg width="40" height="30" viewBox="0 0 32 24" className="mb-8 text-white/30" fill="currentColor">
                <path d="M0 24V12C0 5.373 5.373 0 12 0v6a6 6 0 0 0-6 6h6v12H0zm18 0V12c0-6.627 5.373-12 12-12v6a6 6 0 0 0-6 6h6v12H18z" />
              </svg>

              <blockquote
                className="text-2xl leading-relaxed text-white font-semibold"
                style={{ letterSpacing: "-0.01em", textShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
              >
                "{t.quote}"
              </blockquote>

              <figcaption className="mt-10 flex items-center gap-5">
                <div className="h-14 w-14 rounded-full sky-gradient border-2 border-white/20 shadow-xl" />
                <div>
                  <div className="text-lg font-bold text-white">{t.name}</div>
                  <div className="text-sm font-medium text-white/60">{t.role}</div>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
