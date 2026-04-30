import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import grass from "@/assets/grass-field.jpg";
import b1 from "@/assets/butterfly-1.png";
import b2 from "@/assets/butterfly-2.png";
import b3 from "@/assets/butterfly-3.png";

type Butterfly = {
  src: string;
  size: number;
  startX: string;
  startY: string;
  endX: string;
  endY: string;
  duration: number;
  delay: number;
  rotate: number;
};

const flock: Butterfly[] = [
  { src: b1, size: 70, startX: "-10vw", startY: "20vh", endX: "110vw", endY: "30vh", duration: 18, delay: 0, rotate: -10 },
  { src: b2, size: 55, startX: "110vw", startY: "55vh", endX: "-10vw", endY: "40vh", duration: 22, delay: 2, rotate: 8 },
  { src: b3, size: 80, startX: "-10vw", startY: "60vh", endX: "110vw", endY: "50vh", duration: 26, delay: 4, rotate: -5 },
  { src: b1, size: 45, startX: "110vw", startY: "25vh", endX: "-10vw", endY: "35vh", duration: 20, delay: 1, rotate: 12 },
  { src: b2, size: 60, startX: "-10vw", startY: "70vh", endX: "110vw", endY: "65vh", duration: 24, delay: 3, rotate: -8 },
  { src: b3, size: 50, startX: "60vw", startY: "85vh", endX: "20vw", endY: "15vh", duration: 28, delay: 5, rotate: 15 },
];

export function GrassScene() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });

  const grassY = useTransform(scrollYProgress, [0, 1], ["10%", "0%"]);

  return (
    <section
      ref={ref}
      id="meadow"
      className="relative h-screen overflow-hidden"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <motion.img
          src={grass}
          alt="Sunny grass meadow under a blue sky"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ y: grassY }}
          loading="lazy"
          width={1920}
          height={1024}
        />

        {/* Sun glow */}
        <div
          className="pointer-events-none absolute -top-20 left-1/2 h-[60vh] w-[60vh] -translate-x-1/2 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(255,240,180,0.55), rgba(255,240,180,0) 60%)",
          }}
        />

        {/* Butterflies flying across */}
        {flock.map((b, i) => (
          <motion.img
            key={i}
            src={b.src}
            alt=""
            aria-hidden
            width={b.size}
            height={b.size}
            loading="lazy"
            className="absolute select-none drop-shadow-[0_8px_12px_rgba(0,40,90,0.18)]"
            style={{ width: b.size, height: b.size, top: 0, left: 0 }}
            initial={{ x: b.startX, y: b.startY, rotate: 0 }}
            animate={{
              x: [b.startX, `calc(${b.startX} + 50vw)`, b.endX],
              y: [b.startY, `calc(${b.startY} - 8vh)`, b.endY],
              rotate: [0, b.rotate, 0],
            }}
            transition={{
              duration: b.duration,
              delay: b.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Wing-flutter via subtle vertical wobble layer (extra delight) */}
        {flock.slice(0, 3).map((b, i) => (
          <motion.div
            key={`flutter-${i}`}
            className="absolute"
            style={{ top: b.startY, left: "30%" }}
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 0.4 + i * 0.05, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}

        {/* Tagline */}
        <div className="absolute inset-x-0 bottom-[14vh] z-10 px-6 text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mx-auto max-w-2xl text-lg text-white drop-shadow-[0_2px_10px_rgba(0,40,90,0.5)] md:text-xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Where ideas take flight, and your team finds room to grow.
          </motion.p>
        </div>

        {/* Foreground grass blades silhouette for depth */}
        <svg
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[18vh] w-full"
          viewBox="0 0 1200 200"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            d="M0,200 L0,140 Q40,80 80,140 Q120,60 160,140 Q210,90 260,140 Q310,70 360,140 Q420,80 480,140 Q540,60 600,140 Q660,90 720,140 Q780,70 840,140 Q900,80 960,140 Q1020,60 1080,140 Q1140,90 1200,140 L1200,200 Z"
            fill="oklch(0.42 0.16 145)"
            opacity="0.85"
          />
        </svg>
      </div>
    </section>
  );
}
