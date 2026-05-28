import type {
  Detection,
  InferenceFrame,
  ModelInfo,
  SystemTelemetry,
} from "../types";

/**
 * MockAIService — drop-in stand-in for the real edge-AI pipeline.
 *
 * On the production device the Raspberry Pi 5 + Hailo AI HAT+ will stream
 * inference results (YOLO / MobileNet SSD output) over a WebSocket. The UI
 * only needs an object that emits `InferenceFrame`s and `SystemTelemetry`.
 *
 * To wire up the real backend, implement the `AIService` interface below
 * against your WebSocket / fetch client and swap the import in `App.tsx`.
 */
export interface AIService {
  subscribeFrames(cb: (f: InferenceFrame) => void): () => void;
  subscribeTelemetry(cb: (t: SystemTelemetry) => void): () => void;
  triggerScan(): void;
  getModelInfo(): ModelInfo;
}

const MODEL_INFO: ModelInfo = {
  name: "CellSight-Det v1",
  architecture: "YOLOv5n (Hailo-compiled)",
  inputSize: "640 × 640",
  quantization: "INT8",
  accelerator: "Hailo-10 @ ~26 TOPS",
  classes: ["normal", "dividing", "abnormal"],
};

/* ----------------------------- helpers ----------------------------- */

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function clamp(v: number, a: number, b: number) {
  return Math.min(b, Math.max(a, v));
}

/**
 * Spawn a small population of "cells" that drift slowly around the frame.
 * We keep their identities stable across frames so detections look real.
 */
interface Cell {
  id: string;
  cls: Detection["cls"];
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  baseConf: number;
}

function pickClass(): Detection["cls"] {
  const r = Math.random();
  if (r < 0.7) return "normal";
  if (r < 0.92) return "dividing";
  return "abnormal";
}

function spawnPopulation(n: number, existing: Cell[] = []): Cell[] {
  const cells: Cell[] = [];
  let attempts = 0;
  while (cells.length < n && attempts < n * 30) {
    attempts++;
    const w = rand(0.055, 0.09);
    const h = w * rand(0.88, 1.12);
    const x = rand(0.03, 0.97 - w);
    const y = rand(0.03, 0.97 - h);
    const cx = x + w / 2, cy = y + h / 2, r = (w + h) / 4;
    const overlaps = [...existing, ...cells].some((c) => {
      const ocx = c.x + c.w / 2, ocy = c.y + c.h / 2, or2 = (c.w + c.h) / 4;
      const dx = cx - ocx, dy = cy - ocy;
      return Math.sqrt(dx * dx + dy * dy) < r + or2 + 0.005;
    });
    if (!overlaps) {
      cells.push({
        id: `c${cells.length}-${Math.random().toString(36).slice(2, 7)}`,
        cls: pickClass(),
        x, y,
        vx: rand(-0.00008, 0.00008),
        vy: rand(-0.00008, 0.00008),
        w, h,
        baseConf: rand(0.72, 0.97),
      });
    }
  }
  return cells;
}

/* ----------------------------- service ----------------------------- */

export class MockAIService implements AIService {
  private cells: Cell[];
  private frameId = 0;
  private frameCbs = new Set<(f: InferenceFrame) => void>();
  private teleCbs = new Set<(t: SystemTelemetry) => void>();
  private frameTimer: number | null = null;
  private teleTimer: number | null = null;
  private battery = 87;
  private temp = 48;
  private scanBoost = 0;

  constructor(cellCount = 30) {
    this.cells = spawnPopulation(cellCount);
    this.start();
  }

  private start() {
    // ~12 fps simulation — comfortably inside the Hailo budget
    this.frameTimer = window.setInterval(() => this.tick(), 85);
    this.teleTimer = window.setInterval(() => this.telemetryTick(), 1000);
  }

  private tick() {
    this.frameId++;
    if (this.scanBoost > 0) this.scanBoost--;

    // Drift the population
    for (const c of this.cells) {
      c.x = clamp(c.x + c.vx, 0.02, 0.97 - c.w);
      c.y = clamp(c.y + c.vy, 0.02, 0.97 - c.h);
      if (Math.random() < 0.005) c.vx = rand(-0.00008, 0.00008);
      if (Math.random() < 0.005) c.vy = rand(-0.00008, 0.00008);
      if (Math.random() < 0.004) c.cls = pickClass();
    }

    // Separation — push overlapping cell bodies apart
    for (let i = 0; i < this.cells.length; i++) {
      for (let j = i + 1; j < this.cells.length; j++) {
        const a = this.cells[i], b = this.cells[j];
        const ax = a.x + a.w / 2, ay = a.y + a.h / 2, ar = (a.w + a.h) / 4;
        const bx = b.x + b.w / 2, by = b.y + b.h / 2, br = (b.w + b.h) / 4;
        const dx = bx - ax, dy = by - ay;
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.0001;
        const minDist = ar + br + 0.004;
        if (dist < minDist) {
          const push = (minDist - dist) / 2;
          const nx = dx / dist, ny = dy / dist;
          a.x -= nx * push; a.y -= ny * push;
          b.x += nx * push; b.y += ny * push;
        }
      }
    }

    // Occasionally a new cell appears / one leaves the frame
    if (this.cells.length < 38 && Math.random() < 0.02) {
      this.cells.push(...spawnPopulation(1, this.cells));
    } else if (this.cells.length > 22 && Math.random() < 0.01) {
      this.cells.pop();
    }

    const detections: Detection[] = this.cells.map((c) => ({
      id: c.id,
      cls: c.cls,
      confidence: clamp(
        c.baseConf + rand(-0.03, 0.03) + (this.scanBoost > 0 ? 0.04 : 0),
        0,
        0.999
      ),
      bbox: { x: c.x, y: c.y, w: c.w, h: c.h },
    }));

    const frame: InferenceFrame = {
      frameId: this.frameId,
      timestamp: Date.now(),
      detections,
      latencyMs: rand(11, 18),
      fps: rand(11.5, 12.4),
    };
    this.frameCbs.forEach((cb) => cb(frame));
  }

  private telemetryTick() {
    // Slow drain, gentle thermal wobble
    this.battery = clamp(this.battery - rand(0, 0.04), 0, 100);
    this.temp = clamp(this.temp + rand(-0.3, 0.3), 42, 62);
    const powerW = rand(17, 22);
    const t: SystemTelemetry = {
      battery: +this.battery.toFixed(1),
      runtimeMin: Math.round((this.battery / 100) * 14 * 60),
      powerW: +powerW.toFixed(1),
      npuUtil: clamp(58 + rand(-8, 10) + (this.scanBoost > 0 ? 18 : 0), 0, 100),
      tempC: +this.temp.toFixed(1),
    };
    this.teleCbs.forEach((cb) => cb(t));
  }

  subscribeFrames(cb: (f: InferenceFrame) => void) {
    this.frameCbs.add(cb);
    return () => {
      this.frameCbs.delete(cb);
    };
  }

  subscribeTelemetry(cb: (t: SystemTelemetry) => void) {
    this.teleCbs.add(cb);
    return () => {
      this.teleCbs.delete(cb);
    };
  }

  triggerScan() {
    // Briefly boost confidence + NPU util so the UI reacts visibly
    this.scanBoost = 24;
  }

  getModelInfo(): ModelInfo {
    return MODEL_INFO;
  }

  dispose() {
    if (this.frameTimer) clearInterval(this.frameTimer);
    if (this.teleTimer) clearInterval(this.teleTimer);
  }
}
