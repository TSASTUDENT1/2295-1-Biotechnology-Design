import { AnimatePresence, motion } from "framer-motion";
import { ScrollText } from "lucide-react";
import { CLASS_COLOR, CLASS_LABEL } from "../utils/metrics";
import type { CellClass } from "../types";

export interface LogEntry {
  id: number;
  cls: CellClass;
  confidence: number;
  time: number;
}

interface Props {
  entries: LogEntry[];
}

export function DetectionLog({ entries }: Props) {
  return (
    <div className="panel flex h-full flex-col">
      <div className="panel-header">
        <span className="panel-title flex items-center gap-1.5">
          <ScrollText className="h-3 w-3" />
          Inference Log
        </span>
        <span className="mono text-[9.5px] tracking-[0.22em] text-slate-500">
          tail · {entries.length}
        </span>
      </div>
      <div className="scroll-bio flex-1 overflow-y-auto p-2">
        <AnimatePresence initial={false}>
          {entries.map((e) => (
            <motion.div
              key={e.id}
              initial={{ opacity: 0, x: -10, height: 0 }}
              animate={{ opacity: 1, x: 0, height: "auto" }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="mono flex items-center gap-2 border-b border-bio-border/50 px-1.5 py-1 text-[11px] last:border-b-0"
            >
              <span className="w-[58px] text-slate-500">
                {fmt(e.time)}
              </span>
              <span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{
                  background: CLASS_COLOR[e.cls],
                  boxShadow: `0 0 6px ${CLASS_COLOR[e.cls]}`,
                }}
              />
              <span
                className="font-semibold"
                style={{ color: CLASS_COLOR[e.cls] }}
              >
                {CLASS_LABEL[e.cls]}
              </span>
              <span className="ml-auto text-slate-400">
                {(e.confidence * 100).toFixed(1)}%
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function fmt(t: number) {
  const d = new Date(t);
  return (
    d.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }) + `.${(d.getMilliseconds() / 100).toFixed(0)}`
  );
}
