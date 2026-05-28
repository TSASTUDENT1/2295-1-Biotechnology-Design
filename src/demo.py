"""
demo.py — ExCELLsis UI preview with synthetic microscopy data.

Runs the real UI class with generated cell-like frames and oscillating
detection data. No Pi hardware required.

Usage:
    pip install opencv-python numpy
    python src/demo.py

Health score cycles 90 → 30 → 90 over 30 seconds so you can see all
sidebar color states (green / yellow / red) and bbox distribution changes.

Press Q or Escape to quit.
"""

import math
import os
import random
import sys
import time

import cv2
import numpy as np

sys.path.insert(0, os.path.dirname(__file__))
from ui import UI

# Synthetic frame resolution (gets scaled by ui.py to fit the panel)
FRAME_W = 640
FRAME_H = 480

NUM_BLOBS = 18
CYCLE_SECS = 30.0   # full health oscillation period
FPS_TARGET = 15
CLASS_REFRESH_SECS = 2.0  # how often blob classes can change

# BGR cell colors — fluorescence style (bright blobs on dark field)
CELL_COLORS = {
    "normal":   (190, 225, 190),  # greenish white
    "dividing": (150, 220, 220),  # yellowish white
    "abnormal": (140, 140, 225),  # reddish white
}
NUCLEUS_BRIGHTNESS = 0.50


def _make_blobs(seed: int = 42) -> list[dict]:
    """Generate fixed blob positions for the session."""
    rng = random.Random(seed)
    blobs = []
    for _ in range(NUM_BLOBS):
        r = rng.randint(22, 52)
        cx = rng.randint(r + 12, FRAME_W - r - 12)
        cy = rng.randint(r + 12, FRAME_H - r - 12)
        blobs.append({"cx": cx, "cy": cy, "r": r, "cls": "normal"})
    return blobs


def _assign_classes(blobs: list[dict], health_score: float, time_bucket: int) -> None:
    """Assign a class to each blob in-place; deterministic per (health, time_bucket)."""
    rng = random.Random(time_bucket)

    if health_score > 70:
        weights = [0.78, 0.17, 0.05]
    elif health_score >= 40:
        weights = [0.50, 0.30, 0.20]
    else:
        weights = [0.20, 0.20, 0.60]

    classes = ["normal", "dividing", "abnormal"]
    for blob in blobs:
        blob["cls"] = rng.choices(classes, weights=weights)[0]


def _generate_frame(blobs: list[dict]) -> np.ndarray:
    """Synthesize a fluorescence-microscopy-like BGR frame."""
    frame = np.random.randint(2, 13, (FRAME_H, FRAME_W, 3), dtype=np.uint8)

    for blob in blobs:
        cx, cy, r = blob["cx"], blob["cy"], blob["r"]
        color = CELL_COLORS[blob["cls"]]

        # Outer glow (dim, larger radius)
        glow = tuple(int(c * 0.28) for c in color)
        cv2.circle(frame, (cx, cy), int(r * 1.45), glow, -1)

        # Cell body
        cv2.circle(frame, (cx, cy), r, color, -1)

        # Nucleus (dimmer, slightly offset to top-left)
        nuc_r = max(int(r * 0.33), 4)
        nuc_offset = max(r // 6, 3)
        nuc_color = tuple(int(c * NUCLEUS_BRIGHTNESS) for c in color)
        cv2.circle(frame, (cx - nuc_offset, cy - nuc_offset), nuc_r, nuc_color, -1)

    # Soft blur for realism
    return cv2.GaussianBlur(frame, (5, 5), 1.2)


def _build_detections(blobs: list[dict]) -> list[dict]:
    """Convert blobs to detection dicts matching inference.py format."""
    out = []
    for blob in blobs:
        cx, cy, r = blob["cx"], blob["cy"], blob["r"]
        # Small random jitter so confidence values aren't identical
        conf = min(max(random.gauss(0.81, 0.08), 0.38), 0.98)
        out.append({
            "class": blob["cls"],
            "confidence": conf,
            "bbox": [cx - r, cy - r, cx + r, cy + r],
        })
    return out


def _compute_scores(detections: list[dict]) -> tuple[float, int]:
    total = len(detections)
    if total == 0:
        return 0.0, 100
    abnormal = sum(1 for d in detections if d["class"] == "abnormal")
    mean_conf = sum(d["confidence"] for d in detections) / total
    csi = (abnormal / total) * mean_conf * 100
    health_score = max(0, min(100, round(100 - csi * 3)))
    return csi, health_score


def _build_counts(detections: list[dict]) -> dict:
    counts = {"total": len(detections), "normal": 0, "dividing": 0, "abnormal": 0}
    for d in detections:
        counts[d["class"]] += 1
    return counts


def run() -> None:
    blobs = _make_blobs()
    ui = UI()

    start = time.time()
    fps_timer = start
    fps_counter = 0
    fps = 0.0

    print("ExCELLsis demo — Q or Escape to quit")
    print("Health score cycles 90->30->90 over 30 s. Watch the sidebar and LED states.")

    try:
        while True:
            t0 = time.time()
            elapsed = t0 - start

            # Smooth health oscillation: 90 at t=0, 30 at t=15s, 90 at t=30s
            phase = (elapsed % CYCLE_SECS) / CYCLE_SECS
            target_health = 30 + 60 * (0.5 + 0.5 * math.cos(2 * math.pi * phase))

            time_bucket = int(elapsed / CLASS_REFRESH_SECS)
            _assign_classes(blobs, target_health, time_bucket)

            detections = _build_detections(blobs)
            csi, health_score = _compute_scores(detections)
            counts = _build_counts(detections)
            frame = _generate_frame(blobs)

            fps_counter += 1
            now = time.time()
            if now - fps_timer >= 1.0:
                fps = fps_counter / (now - fps_timer)
                fps_counter = 0
                fps_timer = now

            metrics = {
                "latency_ms": (time.time() - t0) * 1000,
                "fps": fps,
                "battery_pct": 87,
            }

            ui.render(frame, detections, health_score, csi, counts, metrics)

            key = cv2.waitKey(1) & 0xFF
            if key in (ord("q"), ord("Q"), 27):
                break

            sleep = (1.0 / FPS_TARGET) - (time.time() - t0)
            if sleep > 0:
                time.sleep(sleep)

    finally:
        ui.close()
        print("Demo closed.")


if __name__ == "__main__":
    run()
