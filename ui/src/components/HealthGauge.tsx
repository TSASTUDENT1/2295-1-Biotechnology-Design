import { motion } from "framer-motion";

interface Props {
  /** 0..100 */
  value: number;
  status: "healthy" | "moderate" | "risk";
}

/**
 * Analog "Cellular Health Index" gauge.
 * Mirrors the physical servo-driven needle that lives on the prototype's
 * front panel — same value, same scale, identical color zones.
 */
export function HealthGauge({ value, status }: Props) {
  const v = Math.max(0, Math.min(100, value));
  // Needle sweep: -120° (left, danger) → +120° (right, healthy)
  const angle = -120 + (v / 100) * 240;

  const tone =
    status === "healthy"
      ? { ring: "#34d399", glow: "shadow-glow-mint", text: "text-bio-mint" }
      : status === "moderate"
      ? { ring: "#fbbf24", glow: "shadow-glow-amber", text: "text-bio-amber" }
      : { ring: "#fb7185", glow: "shadow-glow-rose", text: "text-bio-rose" };

  // Build ticks
  const ticks = Array.from({ length: 25 }, (_, i) => i);

  return (
    <div className="panel relative flex h-full flex-col">
      <div className="panel-header">
        <span className="panel-title">Cellular Health Index</span>
        <span className={`chip ${tone.text}`}>
          <span
            className={`inline-block h-2 w-2 rounded-full ${tone.glow}`}
            style={{ background: tone.ring }}
          />
          {status.toUpperCase()}
        </span>
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-center px-3 pb-3">
        <svg viewBox="0 0 200 130" className="h-auto w-full max-w-[280px]">
          <defs>
            <linearGradient id="hg-arc" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#fb7185" />
              <stop offset="50%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>
            <filter id="hg-glow">
              <feGaussianBlur stdDeviation="2.5" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Arc background */}
          <path
            d={describeArc(100, 110, 78, -120, 120)}
            fill="none"
            stroke="#1c2c45"
            strokeWidth="10"
            strokeLinecap="round"
          />
          {/* Arc gradient */}
          <path
            d={describeArc(100, 110, 78, -120, 120)}
            fill="none"
            stroke="url(#hg-arc)"
            strokeWidth="4"
            strokeLinecap="round"
            opacity="0.7"
          />

          {/* Ticks */}
          {ticks.map((i) => {
            const a = -120 + (i / 24) * 240;
            const inner = polar(100, 110, 64, a);
            const outer = polar(100, 110, i % 6 === 0 ? 76 : 72, a);
            const major = i % 6 === 0;
            return (
              <line
                key={i}
                x1={inner.x}
                y1={inner.y}
                x2={outer.x}
                y2={outer.y}
                stroke={major ? "#94a3b8" : "#475569"}
                strokeWidth={major ? 1.5 : 1}
              />
            );
          })}

          {/* Major labels */}
          {[
            { v: 0, label: "0" },
            { v: 25, label: "25" },
            { v: 50, label: "50" },
            { v: 75, label: "75" },
            { v: 100, label: "100" },
          ].map(({ v, label }) => {
            const a = -120 + (v / 100) * 240;
            const p = polar(100, 110, 55, a);
            return (
              <text
                key={v}
                x={p.x}
                y={p.y}
                fill="#94a3b8"
                fontSize="7"
                fontFamily="JetBrains Mono"
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {label}
              </text>
            );
          })}

          {/* Needle */}
          <motion.g
            initial={false}
            animate={{ rotate: angle }}
            transition={{ type: "spring", stiffness: 90, damping: 14 }}
            style={{ originX: "100px", originY: "110px" }}
          >
            <line
              x1="100"
              y1="110"
              x2="100"
              y2="40"
              stroke={tone.ring}
              strokeWidth="3"
              strokeLinecap="round"
              filter="url(#hg-glow)"
            />
            <circle cx="100" cy="40" r="3" fill={tone.ring} />
          </motion.g>

          {/* Center cap */}
          <circle cx="100" cy="110" r="7" fill="#0a1320" stroke={tone.ring} strokeWidth="1.5" />
          <circle cx="100" cy="110" r="2.5" fill={tone.ring} />
        </svg>

        {/* Numeric readout */}
        <div className="-mt-1 text-center">
          <div className="mono text-[10px] tracking-[0.28em] text-slate-500">
            HEALTH SCORE
          </div>
          <div
            className={`mono text-[40px] font-semibold leading-none ${tone.text} glow-text`}
          >
            {v.toFixed(1)}
          </div>
          <div className="mono text-[10px] tracking-[0.28em] text-slate-500">
            / 100
          </div>
        </div>
      </div>
    </div>
  );
}

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx: number, cy: number, r: number, start: number, end: number) {
  const s = polar(cx, cy, r, end);
  const e = polar(cx, cy, r, start);
  const large = end - start <= 180 ? 0 : 1;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 0 ${e.x} ${e.y}`;
}
