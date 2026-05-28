import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Props {
  onDone: () => void;
}

const STEPS = [
  "INIT  ▸ Power management bus … OK",
  "INIT  ▸ Pi 5 SoC clocks @ 2.4 GHz … OK",
  "LOAD  ▸ Hailo-10 firmware … OK",
  "LOAD  ▸ CellSight-Det v1 (INT8) … OK",
  "WARM  ▸ NPU graph compile … OK",
  "OPT   ▸ Camera ISP / white-balance … OK",
  "READY ▸ Edge inference pipeline online",
];

export function BootScreen({ onDone }: Props) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (step >= STEPS.length) {
      const t = window.setTimeout(onDone, 450);
      return () => clearTimeout(t);
    }
    const t = window.setTimeout(() => setStep((s) => s + 1), 221);
    return () => clearTimeout(t);
  }, [step, onDone]);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-bio-bg">
      <div className="grid-bg absolute inset-0 opacity-40" />
      <div className="radial-glow absolute inset-0" />
      <div className="relative flex flex-col items-center gap-8 px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex items-center gap-4"
        >
          <Logo size={56} />
          <div>
            <div className="font-display text-3xl font-semibold tracking-tight text-white">
              CellSight<span className="text-bio-cyan">.</span>
            </div>
            <div className="mono text-[11px] tracking-[0.32em] text-slate-400">
              PORTABLE&nbsp;·&nbsp;AI&nbsp;·&nbsp;BIOANALYSIS
            </div>
          </div>
        </motion.div>

        <div className="w-[480px] max-w-[90vw] rounded-2xl border border-bio-border bg-bio-panel/80 p-5 backdrop-blur-sm">
          <div className="mono space-y-1 text-[12px] leading-relaxed">
            {STEPS.slice(0, step).map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                className={
                  i === step - 1
                    ? "text-bio-cyan"
                    : "text-slate-400"
                }
              >
                {s}
              </motion.div>
            ))}
            {step < STEPS.length && (
              <div className="flex items-center gap-2 text-slate-500">
                <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-bio-cyan" />
                <span>loading …</span>
              </div>
            )}
          </div>

          <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-slate-800/80">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-bio-cyan via-bio-teal to-bio-mint"
              initial={{ width: "0%" }}
              animate={{
                width: `${(Math.min(step, STEPS.length) / STEPS.length) * 100}%`,
              }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </div>
        </div>

        <div className="mono text-[10px] tracking-[0.3em] text-slate-500">
          PI 5 · 16GB · HAILO-10 · v0.1.0
        </div>
      </div>
    </div>
  );
}

export function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className="drop-shadow-[0_0_12px_rgba(34,211,238,0.55)]">
      <defs>
        <radialGradient id="cs-g" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#22d3ee" />
        </radialGradient>
        <linearGradient id="cs-ring" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#a78bfa" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="28" fill="url(#cs-g)" opacity="0.18" />
      <circle cx="32" cy="32" r="22" fill="none" stroke="url(#cs-ring)" strokeWidth="2" />
      <circle cx="32" cy="32" r="9" fill="url(#cs-g)" />
      <circle cx="32" cy="32" r="3.5" fill="#03070d" />
      <circle cx="14" cy="32" r="2.4" fill="#22d3ee" />
      <circle cx="50" cy="32" r="2.4" fill="#22d3ee" />
      <circle cx="32" cy="14" r="2.4" fill="#22d3ee" />
      <circle cx="32" cy="50" r="2.4" fill="#22d3ee" />
    </svg>
  );
}
