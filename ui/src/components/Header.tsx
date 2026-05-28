import { useEffect, useState } from "react";
import { BatteryFull, Cpu, Thermometer, Zap, Wifi } from "lucide-react";
import type { SystemTelemetry } from "../types";
import { Logo } from "./BootScreen";

interface Props {
  telemetry: SystemTelemetry;
  fps: number;
  latencyMs: number;
}

export function Header({ telemetry, fps, latencyMs }: Props) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const time = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const date = now.toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "2-digit",
  });

  return (
    <header className="relative z-10 flex items-center justify-between gap-4 border-b border-bio-border/70 bg-bio-panel/60 px-5 py-2.5 backdrop-blur">
      <div className="flex items-center gap-3">
        <Logo size={34} />
        <div className="leading-tight">
          <div className="font-display text-[17px] font-semibold tracking-tight text-white">
            CellSight<span className="text-bio-cyan">.</span>
          </div>
          <div className="mono text-[9.5px] tracking-[0.28em] text-slate-500">
            PORTABLE&nbsp;AI&nbsp;BIOANALYSIS&nbsp;·&nbsp;v0.1.0
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <StatusBadge tone="mint">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-bio-mint opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-bio-mint" />
          </span>
          LIVE INFERENCE
        </StatusBadge>
        <StatusBadge tone="cyan">
          <Cpu className="h-3 w-3" />
          HAILO-10
        </StatusBadge>
      </div>

      <div className="flex items-center gap-4">
        <Metric icon={<Zap className="h-3.5 w-3.5" />} label="FPS" value={fps.toFixed(1)} />
        <Metric
          icon={<Cpu className="h-3.5 w-3.5" />}
          label="LATENCY"
          value={`${latencyMs.toFixed(0)}ms`}
        />
        <Metric
          icon={<Thermometer className="h-3.5 w-3.5" />}
          label="SoC"
          value={`${telemetry.tempC.toFixed(0)}°C`}
        />
        <Battery battery={telemetry.battery} runtimeMin={telemetry.runtimeMin} />
        <Wifi className="h-4 w-4 text-bio-cyan" />
        <div className="mono text-right leading-tight">
          <div className="text-sm text-white">{time}</div>
          <div className="text-[10px] tracking-[0.2em] text-slate-500">{date}</div>
        </div>
      </div>
    </header>
  );
}

function StatusBadge({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "mint" | "cyan" | "amber" | "rose";
}) {
  const map = {
    mint: "bg-bio-mint/10 text-bio-mint border-bio-mint/30",
    cyan: "bg-bio-cyan/10 text-bio-cyan border-bio-cyan/30",
    amber: "bg-bio-amber/10 text-bio-amber border-bio-amber/30",
    rose: "bg-bio-rose/10 text-bio-rose border-bio-rose/30",
  };
  return (
    <span className={`chip border ${map[tone]}`}>
      {children}
    </span>
  );
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-1.5 rounded-lg border border-bio-border/70 bg-slate-900/60 px-2.5 py-1">
      <span className="text-bio-cyan">{icon}</span>
      <div className="leading-tight">
        <div className="mono text-[13px] font-semibold text-white">{value}</div>
        <div className="mono text-[8.5px] tracking-[0.22em] text-slate-500">{label}</div>
      </div>
    </div>
  );
}

function Battery({ battery, runtimeMin }: { battery: number; runtimeMin: number }) {
  const color =
    battery > 60 ? "text-bio-mint" : battery > 25 ? "text-bio-amber" : "text-bio-rose";
  const h = Math.round((runtimeMin / 60) * 10) / 10;
  return (
    <div className="flex items-center gap-2 rounded-lg border border-bio-border/70 bg-slate-900/60 px-2.5 py-1">
      <BatteryFull className={`h-4 w-4 ${color}`} />
      <div className="leading-tight">
        <div className={`mono text-[13px] font-semibold ${color}`}>
          {battery.toFixed(0)}%
        </div>
        <div className="mono text-[8.5px] tracking-[0.22em] text-slate-500">
          ~{h}h
        </div>
      </div>
    </div>
  );
}
