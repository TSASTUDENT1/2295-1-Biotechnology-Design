import { motion } from "framer-motion";
import { Layers, Power, ScanLine, Volume2, VolumeX } from "lucide-react";

interface Props {
  onScan: () => void;
  scanActive: boolean;
  soundOn: boolean;
  onToggleSound: () => void;
  heatmap: boolean;
  onToggleHeatmap: () => void;
  status: "healthy" | "moderate" | "risk";
}

export function ControlBar({
  onScan,
  scanActive,
  soundOn,
  onToggleSound,
  heatmap,
  onToggleHeatmap,
  status,
}: Props) {
  return (
    <div className="panel flex items-center justify-between gap-3 px-3 py-2">
      <div className="flex items-center gap-2">
        <StatusPill status={status} />
        <Btn onClick={onToggleHeatmap} active={heatmap}>
          <Layers className="h-4 w-4" /> Heatmap
        </Btn>
        <Btn onClick={onToggleSound} active={soundOn}>
          {soundOn ? (
            <Volume2 className="h-4 w-4" />
          ) : (
            <VolumeX className="h-4 w-4" />
          )}
          Alerts
        </Btn>
      </div>

      <motion.button
        onClick={onScan}
        whileTap={{ scale: 0.96 }}
        className={`group relative flex items-center gap-2 overflow-hidden rounded-xl border px-5 py-2.5 text-sm font-semibold tracking-wider transition-colors ${
          scanActive
            ? "border-bio-cyan/60 bg-bio-cyan/15 text-bio-cyan shadow-glow-cyan"
            : "border-bio-border bg-slate-900/70 text-slate-200 hover:border-bio-cyan/50 hover:text-bio-cyan"
        }`}
      >
        <ScanLine className="h-4 w-4" />
        <span>{scanActive ? "SCANNING…" : "SCAN SAMPLE"}</span>
        {scanActive && (
          <span
            className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-bio-cyan/30 to-transparent animate-shimmer"
            style={{ backgroundSize: "200% 100%" }}
          />
        )}
      </motion.button>

      <div className="flex items-center gap-2">
        <Btn>
          <Power className="h-4 w-4" /> Standby
        </Btn>
      </div>
    </div>
  );
}

function Btn({
  children,
  onClick,
  active,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[12px] font-semibold tracking-wider transition-colors ${
        active
          ? "border-bio-cyan/50 bg-bio-cyan/15 text-bio-cyan shadow-glow-cyan"
          : "border-bio-border bg-slate-900/60 text-slate-300 hover:border-bio-cyan/40 hover:text-bio-cyan"
      }`}
    >
      {children}
    </button>
  );
}

function StatusPill({ status }: { status: "healthy" | "moderate" | "risk" }) {
  const tone =
    status === "healthy"
      ? { c: "#34d399", label: "SAMPLE HEALTHY", glow: "shadow-glow-mint" }
      : status === "moderate"
      ? { c: "#fbbf24", label: "MODERATE STRESS", glow: "shadow-glow-amber" }
      : { c: "#fb7185", label: "RISK DETECTED", glow: "shadow-glow-rose" };
  return (
    <div
      className="flex items-center gap-2 rounded-full border px-3 py-1.5 mono text-[11px] font-semibold tracking-[0.18em]"
      style={{
        color: tone.c,
        borderColor: `${tone.c}55`,
        background: `${tone.c}12`,
      }}
    >
      <span className="relative flex h-2.5 w-2.5">
        <span
          className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
          style={{ background: tone.c }}
        />
        <span
          className={`relative inline-flex h-2.5 w-2.5 rounded-full ${tone.glow}`}
          style={{ background: tone.c }}
        />
      </span>
      {tone.label}
    </div>
  );
}
