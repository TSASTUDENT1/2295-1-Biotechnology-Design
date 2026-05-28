# CellSight — Portable AI Bioanalysis System

Front-end dashboard for the TSA Biotechnology project **“CellSight”**:
an edge-AI cellular analysis device running on **Raspberry Pi 5 (16 GB)** +
**Raspberry Pi AI HAT+ (Hailo-10)**, driving a 7" touchscreen on a portable,
battery-powered enclosure.

The UI is designed to look and feel like a real biotech / medical device —
museum-grade, demo-ready, and built so the same screens can run on the Pi
during judging.

---

## What the UI shows (matches the design doc, page 14 area)

The screen is laid out as a single full-screen dashboard:

- **Header** — product brand, live-inference badge, Hailo-10 chip, FPS, latency, SoC temperature, battery state-of-charge with runtime estimate, real-time clock.
- **Live Feed (hero)** — simulated microscope feed with real-time bounding boxes around each detected cell, labeled by class and confidence. Includes a scan line, corner brackets, optional heatmap overlay, and HUD elements (frame ID, scale).
- **Detection Summary** — large readouts for cell count and **Cell Stress Index (CSI)**, class distribution stack bar (Normal / Mitosis / Abnormal), mean confidence, and an overall status callout.
- **Cellular Health Index gauge** — analog dial driven by `100 − CSI`, mirroring the physical servo-driven gauge on the prototype's front panel.
- **LED Indicator Ring** — green / amber / red ring matching the WS2812 ring around the optical chamber.
- **AI Model card** — model name, architecture (YOLOv5n Hailo-compiled), input size, quantization, accelerator, and the classes the model predicts.
- **Edge Inference Engine** — Hailo NPU utilization, SoC temperature, system power draw, throughput, end-to-end latency.
- **Cell Stress Index trend chart** — rolling 60-second window of CSI vs. Health.
- **Inference Log** — most recent unique detections with timestamps and confidence.
- **Control Bar** — overall status pill, heatmap toggle, audible-alert toggle, **Scan Sample** action (live boost), standby.
- **Boot sequence** — short power-on animation showing the inference stack coming up, exactly like a real lab instrument.

### Math (per the design doc)

> CSI = (abnormal / total) × meanConfidence
> Health Score = 100 − CSI
> Status thresholds: `csi < 10` healthy, `csi < 25` moderate, otherwise risk.

These are implemented in `src/utils/metrics.ts`.

---

## Stack

- React 18 + TypeScript + Vite
- Tailwind CSS (custom `bio-*` palette + glow shadows)
- Framer Motion (boot, scan, bounding-box animation)
- Recharts (CSI trend chart)
- Lucide icons
- Self-contained: no backend required to run the demo.

---

## Running locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (default `http://localhost:5173`).

### Running on the Raspberry Pi 5 7" touchscreen

The layout targets the Pi 7" panel (1024 × 600) but is fluid up to 1920 × 1080.
On the Pi you can serve the built bundle with anything (nginx, `npm run preview`, etc.)
and open Chromium in kiosk mode:

```bash
npm run build
npm run preview -- --host
chromium-browser --kiosk --noerrdialogs --disable-infobars http://localhost:4173
```

---

## Wiring up the real backend later

The entire UI is driven by a tiny service interface in
[`src/services/mockAI.ts`](src/services/mockAI.ts):

```ts
export interface AIService {
  subscribeFrames(cb: (f: InferenceFrame) => void): () => void;
  subscribeTelemetry(cb: (t: SystemTelemetry) => void): () => void;
  triggerScan(): void;
  getModelInfo(): ModelInfo;
}
```

To wire the real Pi pipeline:

1. Train your YOLOv5n / MobileNet-SSD model on cell-stage data (Normal / Mitosis / Abnormal).
2. Compile it for Hailo (HEF format) using the Hailo Dataflow Compiler.
3. On the Pi, run a small Python service (FastAPI + WebSocket is recommended) that:
   - Pulls frames from the Pi Camera.
   - Runs inference on the Hailo HAT.
   - Emits `InferenceFrame` JSON messages matching `src/types/index.ts` over WebSocket.
   - Emits `SystemTelemetry` from `/sys/class/power_supply/`, `vcgencmd measure_temp`, and the Hailo runtime.
4. Implement an `AIService` that subscribes to that WebSocket and replace
   `new MockAIService()` in `src/App.tsx` with it.

That's the only change required — every component already speaks the
contract.

### `InferenceFrame` shape

```ts
{
  frameId: 1234,
  timestamp: 1700000000000,
  fps: 12.1,
  latencyMs: 14.3,
  detections: [
    {
      id: "cell-001",
      cls: "normal" | "dividing" | "abnormal",
      confidence: 0.93,        // 0..1
      bbox: { x: 0.41, y: 0.22, w: 0.08, h: 0.09 }  // fractions of frame
    }
  ]
}
```

### `SystemTelemetry` shape

```ts
{
  battery: 87.2,      // %
  runtimeMin: 720,    // estimated minutes remaining
  powerW: 19.3,       // current draw
  npuUtil: 64,        // Hailo accelerator utilization %
  tempC: 51.4         // Pi SoC temperature
}
```

---

## Project layout

```
src/
├── App.tsx                  # Top-level layout + state wiring
├── main.tsx
├── index.css                # Tailwind + custom panel/HUD styles
├── types/index.ts           # Shared inference + telemetry contracts
├── services/mockAI.ts       # Replace with real WS-backed AIService
├── utils/metrics.ts         # CSI, health score, class colors
└── components/
    ├── BootScreen.tsx       # Power-on animation + logo
    ├── Header.tsx           # Brand + live status + telemetry chips
    ├── LiveFeed.tsx         # Simulated camera + bbox overlays + heatmap
    ├── MetricsPanel.tsx     # Cell count, CSI, class breakdown
    ├── HealthGauge.tsx      # Analog "Cellular Health Index" dial
    ├── StatusRing.tsx       # LED ring mirror
    ├── ModelInfo.tsx        # AI model spec card
    ├── SystemStatus.tsx     # NPU / temp / power / FPS / latency
    ├── TrendChart.tsx       # CSI vs. health rolling chart
    ├── DetectionLog.tsx     # Streaming inference log
    └── ControlBar.tsx       # Scan / heatmap / sound / standby
```

---

## How this maps to the trifold

- **Left panel (“The Problem”)** — manual cellular analysis is slow and subjective.
- **Center panel (“Your Solution”)** — this UI *is* the live demo: the system diagram is literally what's running. Reference the live FPS, latency, and CSI on-screen during your pitch.
- **Right panel (“Results & Impact”)** — pull screenshots of the trend chart and detection summary as your “accuracy / detection / health” evidence.

Plug the device in, hand the judges the trifold, point at the screen. That's the win.
