import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MockAIService } from "./services/mockAI";
import { WSClient } from "./services/wsClient";
import type {
  AggregateMetrics,
  InferenceFrame,
  SystemTelemetry,
} from "./types";
import { aggregate } from "./utils/metrics";
import { BootScreen } from "./components/BootScreen";
import { Header } from "./components/Header";
import { LiveFeed } from "./components/LiveFeed";
import { MetricsPanel } from "./components/MetricsPanel";
import { HealthGauge } from "./components/HealthGauge";
import { StatusRing } from "./components/StatusRing";
import { TrendChart, type TrendPoint } from "./components/TrendChart";
import { DetectionLog, type LogEntry } from "./components/DetectionLog";
import { SystemStatus } from "./components/SystemStatus";
import { ModelInfo } from "./components/ModelInfo";
import { ControlBar } from "./components/ControlBar";

/**
 * CellSight — Portable AI Bioanalysis System
 *
 * The UI is built against a small `AIService` contract (see services/mockAI.ts).
 * To wire the real Raspberry Pi 5 + Hailo AI HAT+ pipeline, implement that
 * interface against your WebSocket / HTTP stream and swap the import below.
 */
export default function App() {
  const [booted, setBooted] = useState(false);

  const ai = useMemo(() => new MockAIService(), []);
  const ws = useMemo(() => new WSClient(), []);

  const [frame, setFrame] = useState<InferenceFrame | null>(null);
  const [telemetry, setTelemetry] = useState<SystemTelemetry>({
    battery: 87,
    runtimeMin: 720,
    powerW: 19,
    npuUtil: 58,
    tempC: 48,
  });
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [log, setLog] = useState<LogEntry[]>([]);
  const MODES = [
    { boxes: true,  heatmap: false, label: "DETECTION"  },
    { boxes: true,  heatmap: true,  label: "HEATMAP"    },
    { boxes: false, heatmap: true,  label: "DENSITY MAP" },
    { boxes: false, heatmap: false, label: "RAW FEED"   },
  ] as const;
  const [modeIdx, setModeIdx] = useState(0);
  const cycleMode = () => setModeIdx((i) => (i + 1) % MODES.length);
  const showBoxes   = MODES[modeIdx].boxes;
  const showHeatmap = MODES[modeIdx].heatmap;
  const modeLabel   = MODES[modeIdx].label;
  const [soundOn, setSoundOn] = useState(false);
  const [scanActive, setScanActive] = useState(false);

  // GPIO 27 button via WebSocket + 'M' key during dev
  useEffect(() => {
    const offWs = ws.subscribe((msg) => {
      if (msg.event === "mode_cycle") cycleMode();
    });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "m" || e.key === "M") cycleMode();
    };
    window.addEventListener("keydown", onKey);
    return () => { offWs(); window.removeEventListener("keydown", onKey); };
  }, [ws]);

  useEffect(() => () => ws.dispose(), [ws]);

  const lastLogIdsRef = useRef<Set<string>>(new Set());
  const lastBeepRef = useRef<number>(0);
  const logCounterRef = useRef<number>(0);

  useEffect(() => {
    const off1 = ai.subscribeFrames(setFrame);
    const off2 = ai.subscribeTelemetry(setTelemetry);
    return () => {
      off1();
      off2();
    };
  }, [ai]);

  const metrics: AggregateMetrics = useMemo(
    () => aggregate(frame?.detections ?? []),
    [frame]
  );

  useEffect(() => {
    if (!frame) return;
    setTrend((prev) => {
      const next: TrendPoint = {
        t: frame.timestamp,
        csi: metrics.csi,
        health: metrics.healthScore,
      };
      return [...prev, next].slice(-120);
    });
  }, [frame, metrics.csi, metrics.healthScore]);

  useEffect(() => {
    if (!frame) return;
    const seen = lastLogIdsRef.current;
    const fresh: LogEntry[] = [];
    for (const d of frame.detections) {
      if (!seen.has(d.id)) {
        seen.add(d.id);
        fresh.push({
          id: logCounterRef.current++,
          cls: d.cls,
          confidence: d.confidence,
          time: frame.timestamp,
        });
      }
    }
    if (fresh.length) {
      setLog((prev) => [...fresh.reverse(), ...prev].slice(0, 60));
    }
  }, [frame]);

  useEffect(() => {
    if (!soundOn) return;
    if (metrics.status !== "risk") return;
    const now = Date.now();
    if (now - lastBeepRef.current < 3000) return;
    lastBeepRef.current = now;
    try {
      const ctx = new (window.AudioContext ||
        // @ts-expect-error legacy
        window.webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = 880;
      g.gain.value = 0.05;
      o.connect(g);
      g.connect(ctx.destination);
      o.start();
      o.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.18);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.22);
      o.stop(ctx.currentTime + 0.23);
    } catch {
      /* audio unavailable */
    }
  }, [metrics.status, soundOn]);

  const handleScan = () => {
    ai.triggerScan();
    setScanActive(true);
    window.setTimeout(() => setScanActive(false), 2200);
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-bio-bg text-slate-100">
      <div className="grid-bg pointer-events-none absolute inset-0 opacity-30" />
      <div className="radial-glow pointer-events-none absolute inset-0" />

      <AnimatePresence>
        {!booted && <BootScreen onDone={() => setBooted(true)} />}
      </AnimatePresence>

      {booted && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="relative flex h-full w-full flex-col"
        >
          <Header
            telemetry={telemetry}
            fps={frame?.fps ?? 0}
            latencyMs={frame?.latencyMs ?? 0}
          />

          {/* Main 3-column working area */}
          <main className="flex min-h-0 flex-1 gap-3 p-3">
            {/* LEFT: detection summary + log */}
            <div className="flex w-[22%] min-w-[260px] flex-col gap-3">
              <div className="flex-[3] min-h-0">
                <MetricsPanel m={metrics} />
              </div>
              <div className="flex-[2] min-h-0">
                <DetectionLog entries={log} />
              </div>
            </div>

            {/* CENTER: hero live feed + trend chart */}
            <div className="flex flex-1 flex-col gap-3">
              <div className="flex-[5] min-h-0">
                <LiveFeed
                  frame={frame}
                  showBoxes={showBoxes}
                  showHeatmap={showHeatmap}
                  modeLabel={modeLabel}
                  onCycleMode={cycleMode}
                />
              </div>
              <div className="h-[150px] min-h-0">
                <TrendChart data={trend} />
              </div>
            </div>

            {/* RIGHT: gauge, ring, model, system */}
            <div className="flex w-[24%] min-w-[300px] flex-col gap-3">
              <div className="flex-[4] min-h-0">
                <HealthGauge value={metrics.healthScore} status={metrics.status} />
              </div>
              <div className="flex-[3] min-h-0 grid grid-cols-2 gap-3">
                <div className="min-h-0">
                  <StatusRing status={metrics.status} />
                </div>
                <div className="min-h-0">
                  <ModelInfo info={ai.getModelInfo()} />
                </div>
              </div>
              <div className="flex-[3] min-h-0">
                <SystemStatus
                  telemetry={telemetry}
                  fps={frame?.fps ?? 0}
                  latencyMs={frame?.latencyMs ?? 0}
                />
              </div>
            </div>
          </main>

          {/* Bottom control bar */}
          <div className="px-3 pb-3">
            <ControlBar
              onScan={handleScan}
              scanActive={scanActive}
              soundOn={soundOn}
              onToggleSound={() => setSoundOn((v) => !v)}
              heatmap={showHeatmap}
              onToggleHeatmap={cycleMode}
              status={metrics.status}
            />
          </div>
        </motion.div>
      )}
    </div>
  );
}
