import { Brain } from "lucide-react";
import type { ModelInfo as ModelInfoT } from "../types";

interface Props {
  info: ModelInfoT;
}

export function ModelInfo({ info }: Props) {
  return (
    <div className="panel flex h-full flex-col">
      <div className="panel-header">
        <span className="panel-title flex items-center gap-1.5">
          <Brain className="h-3 w-3" />
          AI Model
        </span>
        <span className="chip border border-bio-violet/30 bg-bio-violet/10 text-bio-violet">
          {info.quantization}
        </span>
      </div>
      <div className="space-y-1.5 p-3">
        <Row k="Model" v={info.name} />
        <Row k="Arch" v={info.architecture} />
        <Row k="Input" v={info.inputSize} />
        <Row k="Accel" v={info.accelerator} />
        <Row
          k="Classes"
          v={info.classes
            .map((c) => c[0].toUpperCase() + c.slice(1))
            .join(" · ")}
        />
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-bio-border/40 pb-1 last:border-b-0">
      <span className="mono text-[9.5px] tracking-[0.2em] text-slate-500">
        {k.toUpperCase()}
      </span>
      <span className="mono truncate text-[11px] text-slate-200">{v}</span>
    </div>
  );
}
