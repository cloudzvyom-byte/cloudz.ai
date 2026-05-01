import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  const scale = useTransform(scrollYProgress, [0, 0.6, 1], [1, 1.08, 1.18]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 0.85, 1], [1, 1, 0.4, 0]);
  const y = useTransform(scrollYProgress, [0, 0.6], ["0px", "-40px"]);

  return (
    <section 
      ref={ref} 
      className="relative h-[130vh] overflow-hidden"
    >
      <div className="sticky top-0 flex h-screen flex-col items-center justify-center overflow-hidden">
        <motion.div
          style={{ scale, opacity, y }}
          className="relative z-10 mx-auto w-full max-w-7xl px-6 text-center"
        >
          {/* Main Slogan */}
          <h1
            className="text-white font-black tracking-tighter"
            style={{
              fontSize: "clamp(3rem, 8vw, 7rem)",
              lineHeight: 0.9,
              letterSpacing: "-0.04em",
              textShadow: "0 20px 50px rgba(0,0,0,0.15)",
            }}
          >
            <span className="block">AI Creativity.</span>
            <span className="block italic opacity-90">Business Scale.</span>
          </h1>
          
          <div className="h-[15vh]" aria-hidden />
        </motion.div>

        {/* Scroll Down for Demo Indicator */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 1.2, ease: "easeOut" }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 text-center"
        >
          <p className="text-sm font-black uppercase tracking-[0.4em] text-white/60 mb-4">
            Scroll down for demo
          </p>
          <motion.div 
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="mx-auto h-12 w-[2px] bg-gradient-to-b from-white/60 to-transparent"
          />
        </motion.div>
      </div>
    </section>
  );
}
