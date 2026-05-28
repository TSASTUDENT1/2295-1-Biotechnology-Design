import { Cpu, Gauge, Thermometer, Zap } from "lucide-react";
import type { SystemTelemetry } from "../types";

interface Props {
  telemetry: SystemTelemetry;
  fps: number;
  latencyMs: number;
}

/**
 * Compact system / accelerator status block. Mirrors what would be exposed
 * by `/proc` and the Hailo runtime on the Pi.
 */
export function SystemStatus({ telemetry, fps, latencyMs }: Props) {
  return (
    <div className="panel flex h-full flex-col">
      <div className="panel-header">
        <span className="panel-title">Edge Inference Engine</span>
        <span className="chip border border-bio-cyan/30 bg-bio-cyan/10 text-bio-cyan">
          ONLINE
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 p-3">
        <Bar
          icon={<Cpu className="h-3.5 w-3.5" />}
          label="Hailo NPU"
          value={telemetry.npuUtil}
          unit="%"
          color="#22d3ee"
        />
        <Bar
          icon={<Thermometer className="h-3.5 w-3.5" />}
          label="SoC Temp"
          value={telemetry.tempC}
          unit="°C"
          max={85}
          color={telemetry.tempC > 70 ? "#fb7185" : "#34d399"}
        />
        <Bar
          icon={<Zap className="h-3.5 w-3.5" />}
          label="Power Draw"
          value={telemetry.powerW}
          unit="W"
          max={30}
          color="#a78bfa"
        />
        <Bar
          icon={<Gauge className="h-3.5 w-3.5" />}
          label="Throughput"
          value={fps}
          unit="fps"
          max={20}
          color="#34d399"
        />
      </div>
      <div className="mx-3 mb-3 flex items-center justify-between rounded-lg border border-bio-border/70 bg-slate-900/50 px-3 py-2">
        <div className="mono text-[10px] tracking-[0.22em] text-slate-500">
          E2E LATENCY
        </div>
        <div className="mono text-base font-semibold text-bio-cyan glow-text">
          {latencyMs.toFixed(1)}
          <span className="ml-1 text-[10px] text-slate-500">ms</span>
        </div>
      </div>
    </div>
  );
}

function Bar({
  icon,
  label,
  value,
  unit,
  max = 100,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  unit: string;
  max?: number;
  color: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="rounded-lg border border-bio-border/70 bg-slate-900/50 px-2.5 py-2">
      <div className="mb-1 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-slate-400">
          <span style={{ color }}>{icon}</span>
          <span className="mono text-[9.5px] tracking-[0.2em]">{label.toUpperCase()}</span>
        </div>
        <div className="mono text-[11px] font-semibold text-white">
          {value.toFixed(1)}
          <span className="ml-0.5 text-[9px] text-slate-500">{unit}</span>
        </div>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${color}33, ${color})`,
            boxShadow: `0 0 8px ${color}66`,
          }}
        />
      </div>
    </div>
  );
}
