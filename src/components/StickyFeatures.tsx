import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const features = [
  {
    tag: "01 — Library",
    title: "Every asset, finally findable.",
    body: "Auto-tagged by AI the moment you drop them in. Search by content, color, vibe — even by what's spoken inside a video.",
  },
  {
    tag: "02 — Workflow",
    title: "Reviews that don't live in email.",
    body: "Share a link, collect comments in context, ship the next version. No more 'see attached final_v7_REAL.psd'.",
  },
  {
    tag: "03 — Brand",
    title: "One source of truth for the brand.",
    body: "Fonts, colors, logos, guidelines — locked, versioned, and a click away for everyone you work with.",
  },
];

function Panel({ f, i, total }: { f: (typeof features)[number]; i: number; total: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  
  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.18, 0.82, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.18, 0.82, 1], [0.96, 1, 1, 0.96]);

  return (
    <section
      ref={ref}
      className="sticky top-0 flex h-screen items-center overflow-hidden"
      style={{
        zIndex: 10 + i,
        background: "linear-gradient(135deg, rgba(255, 210, 179, 0.3) 0%, rgba(255, 139, 167, 0.3) 100%)", 
        backdropFilter: "blur(30px)",
      }}
    >
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-12 px-6 md:grid-cols-2 md:items-center">
        <motion.div style={{ y, opacity, scale }} className="text-white">
          <p className="mb-6 text-sm font-semibold uppercase tracking-[0.4em] text-white"
             style={{ textShadow: "0 2px 10px rgba(0,0,0,0.2)" }}>
            {f.tag}
          </p>
          <h2
            className="text-balance"
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "clamp(2.5rem, 6vw, 5.5rem)",
              lineHeight: 1,
              letterSpacing: "-0.03em",
              fontWeight: 800,
              textShadow: "0 10px 30px rgba(0,0,0,0.15), 0 0 10px rgba(0,0,0,0.05)",
            }}
          >
            {f.title}
          </h2>
          <p className="mt-8 max-w-md text-xl text-white leading-relaxed font-medium"
             style={{ textShadow: "0 4px 15px rgba(0,0,0,0.1)" }}>
            {f.body}
          </p>
        </motion.div>

        <motion.div
          style={{ 
            y: useTransform(scrollYProgress, [0, 1], [100, -100]),
            opacity,
            scale 
          }}
          className="relative h-[60vh] w-full"
        >
          <div className="absolute inset-0 rounded-[2.5rem] border border-white/20 bg-white/5 backdrop-blur-2xl shadow-2xl overflow-hidden">
            <div className="flex h-12 items-center gap-2 border-b border-white/10 px-6">
              <span className="h-3 w-3 rounded-full bg-white/30" />
              <span className="h-3 w-3 rounded-full bg-white/20" />
              <span className="h-3 w-3 rounded-full bg-white/10" />
            </div>
            <div className="grid grid-cols-3 gap-4 p-8 h-full content-start">
              {Array.from({ length: 9 }).map((_, k) => (
                <div
                  key={k}
                  className="aspect-square rounded-2xl bg-white/10 border border-white/5 shadow-inner"
                  style={{
                    background: `linear-gradient(${135 + k * 20}deg, rgba(255,255,255,0.15), rgba(255,255,255,0.02))`,
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
      <div className="absolute bottom-8 right-10 text-xs font-bold uppercase tracking-[0.4em] text-white/40">
        {String(i + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </div>
    </section>
  );
}

export function StickyFeatures() {
  return (
    <div id="product" className="relative">
      {features.map((f, i) => (
        <Panel key={i} f={f} i={i} total={features.length} />
      ))}
    </div>
  );
}
