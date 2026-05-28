interface Props {
  status: "healthy" | "moderate" | "risk";
}

/**
 * LED status ring — mirrors the addressable LED ring around the optical
 * chamber on the physical prototype.
 */
export function StatusRing({ status }: Props) {
  const tone =
    status === "healthy"
      ? { c: "#34d399", label: "Healthy", glow: "shadow-glow-mint" }
      : status === "moderate"
      ? { c: "#fbbf24", label: "Moderate", glow: "shadow-glow-amber" }
      : { c: "#fb7185", label: "Risk", glow: "shadow-glow-rose" };

  const N = 18;
  return (
    <div className="panel flex h-full flex-col">
      <div className="panel-header">
        <span className="panel-title">LED Indicator Ring</span>
        <span className="mono text-[9.5px] tracking-[0.22em] text-slate-500">
          GPIO 18 · WS2812
        </span>
      </div>
      <div className="relative flex flex-1 items-center justify-center p-4">
        <div className="relative h-32 w-32">
          {Array.from({ length: N }, (_, i) => {
            const a = (i / N) * Math.PI * 2;
            const x = 50 + 44 * Math.cos(a);
            const y = 50 + 44 * Math.sin(a);
            return (
              <span
                key={i}
                className={`absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full ${tone.glow} animate-pulse-glow`}
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  background: tone.c,
                  animationDelay: `${(i / N) * 1.2}s`,
                }}
              />
            );
          })}
          <div
            className="absolute inset-3 rounded-full border"
            style={{
              borderColor: `${tone.c}40`,
              background: `radial-gradient(circle, ${tone.c}22, transparent 70%)`,
            }}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="mono text-[9px] tracking-[0.28em] text-slate-500">STATUS</div>
            <div
              className="mono text-base font-semibold glow-text"
              style={{ color: tone.c }}
            >
              {tone.label.toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
