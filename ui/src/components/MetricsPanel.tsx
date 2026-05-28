import { motion } from "framer-motion";
import { Activity, AlertTriangle, Sigma, TrendingUp } from "lucide-react";
import type { AggregateMetrics } from "../types";
import { CLASS_COLOR, CLASS_LABEL } from "../utils/metrics";

interface Props {
  m: AggregateMetrics;
}

/**
 * Right-column summary card cluster:
 *   • Cell count (large)
 *   • Class breakdown bar
 *   • Cell Stress Index (CSI)
 *   • Mean confidence
 */
export function MetricsPanel({ m }: Props) {
  const csiTone =
    m.csi < 10
      ? { c: "#34d399", glow: "shadow-glow-mint", text: "text-bio-mint" }
      : m.csi < 25
      ? { c: "#fbbf24", glow: "shadow-glow-amber", text: "text-bio-amber" }
      : { c: "#fb7185", glow: "shadow-glow-rose", text: "text-bio-rose" };

  return (
    <div className="panel flex h-full flex-col">
      <div className="panel-header">
        <span className="panel-title">Detection Summary</span>
        <span className="chip border border-bio-cyan/30 bg-bio-cyan/10 text-bio-cyan">
          <Activity className="h-3 w-3" />
          REAL-TIME
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 p-3">
        {/* Cell count */}
        <StatBlock
          icon={<Sigma className="h-4 w-4" />}
          label="Cells Detected"
          value={m.total.toString()}
          accent="cyan"
        />
        {/* CSI */}
        <StatBlock
          icon={<AlertTriangle className="h-4 w-4" />}
          label="Cell Stress Index"
          value={m.csi.toFixed(1)}
          suffix="/100"
          accent={m.csi < 10 ? "mint" : m.csi < 25 ? "amber" : "rose"}
          big
        />
      </div>

      {/* Class breakdown stack bar */}
      <div className="px-3 pb-2">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="mono text-[9.5px] tracking-[0.22em] text-slate-500">
            CLASS DISTRIBUTION
          </span>
          <span className="mono text-[9.5px] text-slate-500">{m.total} cells</span>
        </div>
        <StackBar m={m} />
        <div className="mt-2 grid grid-cols-3 gap-2">
          {(["normal", "dividing", "abnormal"] as const).map((k) => (
            <ClassChip
              key={k}
              color={CLASS_COLOR[k]}
              label={CLASS_LABEL[k]}
              count={m[k]}
              pct={m.total ? (m[k] / m.total) * 100 : 0}
            />
          ))}
        </div>
      </div>

      {/* Mean confidence row */}
      <div className="mx-3 mb-3 mt-1 rounded-xl border border-bio-border/70 bg-slate-900/50 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-400">
            <TrendingUp className="h-4 w-4 text-bio-cyan" />
            <span className="mono text-[10px] tracking-[0.22em]">
              MEAN CONFIDENCE
            </span>
          </div>
          <div className="mono text-lg font-semibold text-white">
            {(m.meanConfidence * 100).toFixed(1)}
            <span className="ml-0.5 text-[11px] text-slate-500">%</span>
          </div>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
          <motion.div
            initial={false}
            animate={{ width: `${m.meanConfidence * 100}%` }}
            transition={{ type: "spring", stiffness: 90, damping: 18 }}
            className="h-full rounded-full bg-gradient-to-r from-bio-cyan via-bio-teal to-bio-mint shadow-glow-cyan"
          />
        </div>
      </div>

      {/* CSI bottom callout */}
      <div className="mt-auto m-3 rounded-xl border p-3"
        style={{
          borderColor: `${csiTone.c}40`,
          background: `linear-gradient(180deg, ${csiTone.c}14, transparent)`,
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="mono text-[9.5px] tracking-[0.22em] text-slate-400">
              STATUS
            </div>
            <div className={`text-base font-semibold ${csiTone.text} glow-text`}>
              {m.status === "healthy"
                ? "Sample Healthy"
                : m.status === "moderate"
                ? "Moderate Stress"
                : "Risk Detected"}
            </div>
          </div>
          <div
            className={`h-3 w-3 rounded-full ${csiTone.glow}`}
            style={{ background: csiTone.c }}
          />
        </div>
      </div>
    </div>
  );
}

function StatBlock({
  icon,
  label,
  value,
  suffix,
  accent,
  big,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  suffix?: string;
  accent: "cyan" | "mint" | "amber" | "rose";
  big?: boolean;
}) {
  const tones = {
    cyan: "text-bio-cyan",
    mint: "text-bio-mint",
    amber: "text-bio-amber",
    rose: "text-bio-rose",
  };
  return (
    <div className="rounded-xl border border-bio-border/70 bg-slate-900/50 p-3">
      <div className="mb-1 flex items-center gap-1.5 text-slate-400">
        <span className={tones[accent]}>{icon}</span>
        <span className="mono text-[9.5px] tracking-[0.22em]">{label.toUpperCase()}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <div
          className={`mono ${big ? "text-3xl" : "text-2xl"} font-semibold ${tones[accent]} glow-text`}
        >
          {value}
        </div>
        {suffix && (
          <div className="mono text-[10px] text-slate-500">{suffix}</div>
        )}
      </div>
    </div>
  );
}

function StackBar({ m }: { m: AggregateMetrics }) {
  const total = m.total || 1;
  const segs = [
    { c: CLASS_COLOR.normal, v: m.normal / total },
    { c: CLASS_COLOR.dividing, v: m.dividing / total },
    { c: CLASS_COLOR.abnormal, v: m.abnormal / total },
  ];
  return (
    <div className="flex h-2.5 w-full overflow-hidden rounded-full border border-bio-border bg-slate-900">
      {segs.map((s, i) => (
        <motion.div
          key={i}
          initial={false}
          animate={{ width: `${s.v * 100}%` }}
          transition={{ type: "spring", stiffness: 90, damping: 18 }}
          style={{ background: s.c, boxShadow: `0 0 8px ${s.c}66` }}
        />
      ))}
    </div>
  );
}

function ClassChip({
  color,
  label,
  count,
  pct,
}: {
  color: string;
  label: string;
  count: number;
  pct: number;
}) {
  return (
    <div className="rounded-md border border-bio-border/70 bg-slate-900/40 px-2 py-1.5">
      <div className="flex items-center gap-1.5">
        <span className="inline-block h-2 w-2 rounded-full" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
        <span className="mono text-[9px] tracking-[0.18em] text-slate-400">
          {label.toUpperCase()}
        </span>
      </div>
      <div className="mono mt-0.5 text-sm font-semibold text-white">
        {count}
        <span className="ml-1 text-[10px] text-slate-500">{pct.toFixed(0)}%</span>
      </div>
    </div>
  );
}
