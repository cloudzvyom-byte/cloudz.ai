const logos = ["Northwind", "Lumen", "Atlas", "Halcyon", "Verge", "Orbit", "Foundry", "Meridian"];

export function Marquee() {
  return (
    <section className="relative overflow-hidden border-y border-border bg-background py-10">
      <p className="mb-6 text-center text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
        Trusted by teams shipping the work that matters
      </p>
      <div className="flex gap-16 whitespace-nowrap [animation:drift-right_40s_linear_infinite]">
        {[...logos, ...logos, ...logos].map((l, i) => (
          <span
            key={i}
            className="text-2xl font-semibold tracking-tight text-foreground/60"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {l}
          </span>
        ))}
      </div>
    </section>
  );
}
