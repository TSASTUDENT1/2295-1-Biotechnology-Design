/**
 * Shared types for CellSight.
 *
 * These types model the *output* of the AI inference pipeline running on the
 * Raspberry Pi 5 + Hailo AI HAT+. The UI is built against this contract, so
 * swapping the mock service for a real WebSocket / HTTP feed from the Python
 * backend (YOLO/MobileNet SSD) is a drop-in change.
 */

export type CellClass = "normal" | "dividing" | "abnormal";

export interface Detection {
  id: string;
  /** Class predicted by the object detection model */
  cls: CellClass;
  /** Confidence in [0, 1] */
  confidence: number;
  /** Bounding box as fractions of the frame (0..1) */
  bbox: { x: number; y: number; w: number; h: number };
}

export interface InferenceFrame {
  /** Monotonically increasing frame index */
  frameId: number;
  /** Epoch ms when frame was captured */
  timestamp: number;
  /** Per-frame detections */
  detections: Detection[];
  /** End-to-end inference latency in ms (camera -> bbox) */
  latencyMs: number;
  /** Frames per second the pipeline is sustaining */
  fps: number;
}

export interface AggregateMetrics {
  total: number;
  normal: number;
  dividing: number;
  abnormal: number;
  /** Average confidence across all current detections (0..1) */
  meanConfidence: number;
  /**
   * Cell Stress Index (per project spec):
   *   CSI = (abnormal / total) * meanConfidence
   * Reported on a 0..100 scale for display.
   */
  csi: number;
  /**
   * Cell Health Score: 100 - CSI, clamped to [0, 100].
   * Higher = healthier sample.
   */
  healthScore: number;
  /** Overall classification driven from CSI thresholds */
  status: "healthy" | "moderate" | "risk";
}

export interface SystemTelemetry {
  /** Battery state of charge (%) */
  battery: number;
  /** Estimated remaining runtime (minutes) */
  runtimeMin: number;
  /** Current system power draw (W) */
  powerW: number;
  /** Hailo accelerator utilization (%) */
  npuUtil: number;
  /** Pi 5 SoC temperature (°C) */
  tempC: number;
}

export interface ModelInfo {
  name: string;
  architecture: string;
  inputSize: string;
  quantization: string;
  accelerator: string;
  classes: CellClass[];
}
