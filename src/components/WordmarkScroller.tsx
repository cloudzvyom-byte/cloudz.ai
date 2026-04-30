import { motion, useScroll, useTransform, useSpring } from "framer-motion";

/**
 * Global, fixed "Clouds" wordmark in glassmorphism style.
 * Starts huge in the middle, shrinks into the header.
 */
export function WordmarkScroller() {
  const { scrollYProgress } = useScroll();
  const p = useSpring(scrollYProgress, { stiffness: 100, damping: 30, mass: 0.5 });

  const fontSize = useTransform(
    p,
    [0, 0.1, 1],
    ["clamp(8rem, min(35vw, 50vh), 45rem)", "1.8rem", "1.8rem"]
  );
  
  const top = useTransform(p, [0, 0.15, 1], ["45%", "1.2rem", "1.2rem"]);
  const y = useTransform(p, [0, 0.15], ["-50%", "0%"]);
  
  const padX = useTransform(p, [0, 0.1, 1], ["2rem", "1.25rem", "1.25rem"]);
  const padY = useTransform(p, [0, 0.1, 1], ["1rem", "0.4rem", "0.4rem"]);
  const radius = useTransform(p, [0, 0.15, 1], ["3rem", "999px", "999px"]);
  const opacity = useTransform(p, [0, 0.05, 1], [1, 1, 1]);
  const blur = useTransform(p, [0, 0.15, 1], ["blur(25px)", "blur(0px)", "blur(0px)"]);
  
  const bg = useTransform(
    p,
    [0, 0.1, 1],
    [
      "rgba(255,255,255,0.15)",
      "rgba(255,255,255,0)",
      "rgba(255,255,255,0)",
    ]
  );
  const border = useTransform(
    p,
    [0, 0.15, 1],
    [
      "1px solid rgba(255,255,255,0.3)",
      "1px solid rgba(255,255,255,0)",
      "1px solid rgba(255,255,255,0)",
    ]
  );
  const boxShadow = useTransform(
    p,
    [0, 0.15, 1],
    [
      "0 25px 80px rgba(0, 0, 0, 0.15), inset 0 0 20px rgba(255,255,255,0.2)",
      "0 0px 0px rgba(0, 0, 0, 0)",
      "0 0px 0px rgba(0, 0, 0, 0)",
    ]
  );

  // REMOVE HIGHLIGHTS FOR HEADER
  const textShadow = useTransform(
    p,
    [0, 0.1, 0.15],
    [
      "0 0 2px rgba(255,255,255,1), 0 4px 10px rgba(0,0,0,0.1), -2px -2px 0px rgba(255,255,255,0.5), 2px 2px 0px rgba(255,255,255,0.2), 0 0 30px rgba(255,255,255,0.4)",
      "0 0 2px rgba(255,255,255,1), 0 4px 10px rgba(0,0,0,0.1)",
      "none"
    ]
  );
  const filter = useTransform(
    p,
    [0, 0.1],
    ["drop-shadow(0 4px 15px rgba(255,255,255,0.3))", "none"]
  );

  const pointerEvents = useTransform(p, [0, 0.1], ["none", "auto"] as any);

  return (
    <motion.div
      aria-hidden
      className="fixed z-[60] select-none"
      style={{
        top,
        left: "50%",
        x: "-50%",
        y,
        opacity,
        pointerEvents: pointerEvents as any,
      }}
    >
      {/* Floating Glass Sphere */}
      <motion.div 
        className="absolute -top-24 left-[42%] h-28 w-28 rounded-full border border-white/40 shadow-2xl"
        style={{ 
          opacity: useTransform(p, [0, 0.1], [1, 0]),
          scale: useTransform(p, [0, 0.1], [1, 0.5]),
          background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.6), rgba(255,255,255,0.05))",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
      />

      <motion.div
        style={{
          paddingLeft: padX,
          paddingRight: padX,
          paddingTop: padY,
          paddingBottom: padY,
          borderRadius: radius,
          background: bg,
          border,
          backdropFilter: blur,
          WebkitBackdropFilter: blur,
          boxShadow,
        }}
        className="flex items-center justify-center"
      >
        <motion.span
          className="block leading-none cursor-pointer pr-10"
          style={{
            fontFamily: "'Pacifico', cursive",
            fontSize,
            letterSpacing: "-0.01em",
            overflow: "visible",
            color: "rgba(255,255,255,1)",
            textShadow,
            filter,
            WebkitTextStroke: useTransform(p, [0, 0.1], ["1px rgba(255,255,255,0.3)", "0px rgba(255,255,255,0)"]),
          }}
        >
          Clouds
        </motion.span>
      </motion.div>
    </motion.div>
  );
}
