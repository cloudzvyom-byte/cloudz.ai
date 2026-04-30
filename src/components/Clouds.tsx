import cloud1 from "@/assets/cloud-1.png";
import cloud2 from "@/assets/cloud-2.png";
import cloud3 from "@/assets/cloud-3.png";

type Props = { density?: "low" | "med" | "high"; opacity?: number };

export function Clouds({ density = "med", opacity = 0.85 }: Props) {
  // More diverse layers with randomized starting offsets for a truly continuous feel
  const layers = [
    { src: cloud2, top: "5%",  left: "-20%", size: "w-[70vw] max-w-[1000px]", cls: "cloud-drift-slow", o: 0.6, delay: "-20s" },
    { src: cloud1, top: "25%", left: "10%",  size: "w-[45vw] max-w-[700px]",  cls: "cloud-drift-med",  o: 0.8, delay: "-45s" },
    { src: cloud3, top: "50%", left: "60%",  size: "w-[35vw] max-w-[500px]",  cls: "cloud-drift-fast", o: 0.7, delay: "-10s" },
    { src: cloud2, top: "75%", left: "-10%", size: "w-[60vw] max-w-[900px]",  cls: "cloud-drift-slow", o: 0.5, delay: "-80s" },
    { src: cloud1, top: "40%", left: "40%",  size: "w-[30vw] max-w-[450px]",  cls: "cloud-drift-fast", o: 0.6, delay: "-35s" },
    { src: cloud3, top: "15%", left: "-30%", size: "w-[50vw] max-w-[800px]",  cls: "cloud-drift-med",  o: 0.4, delay: "-110s" },
    { src: cloud2, top: "60%", left: "20%",  size: "w-[40vw] max-w-[600px]",  cls: "cloud-drift-slow", o: 0.3, delay: "-10s" },
  ];

  const count = density === "low" ? 3 : density === "high" ? 7 : 5;

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      {layers.slice(0, count).map((l, i) => (
        <div
          key={i}
          className="absolute w-full h-full"
          style={{ top: l.top, left: l.left }}
        >
          <img
            src={l.src}
            alt=""
            className={`${l.size} ${l.cls} float-y select-none pointer-events-none`}
            style={{
              opacity: l.o * opacity,
              animationDelay: l.delay,
              willChange: "transform",
              transform: "translateZ(0)",
              filter: "blur(2px)", // Soften the edges for a more cinematic look
            }}
          />
        </div>
      ))}
    </div>
  );
}
