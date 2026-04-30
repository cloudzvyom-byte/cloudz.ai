import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export function BigType() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 1.1]);
  const opacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0, 1, 1, 0]);

  return (
    <section ref={ref} id="solutions" className="relative h-[120vh]">
      {/* Background is now global fixed on body */}
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden px-6">
        <motion.h2
          style={{ scale, opacity }}
          className="relative z-10 text-center text-white"
        >
          <span
            className="block font-black uppercase tracking-tighter"
            style={{
              fontFamily: "Inter, system-ui, sans-serif",
              fontSize: "clamp(3rem, 12vw, 12rem)",
              lineHeight: 0.85,
              letterSpacing: "-0.05em",
              textShadow: "0 10px 80px rgba(0, 0, 0, 0.15)",
            }}
          >
            Make it once.
          </span>
          <span
            className="mt-6 block font-black uppercase tracking-tighter"
            style={{
              fontFamily: "Inter, system-ui, sans-serif",
              fontSize: "clamp(3rem, 12vw, 12rem)",
              lineHeight: 0.85,
              letterSpacing: "-0.05em",
              textShadow: "0 10px 80px rgba(0, 0, 0, 0.15)",
            }}
          >
            Run it everywhere.
          </span>
        </motion.h2>
      </div>
    </section>
  );
}
