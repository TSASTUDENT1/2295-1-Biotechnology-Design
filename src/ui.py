"""
ui.py — 1280x800 OpenCV display for ExCELLsis.

Layout (1280x800):
  Top bar   (40px)   : branding, model, live dot, elapsed time
  Main area (720px)  : left 853px = dual camera panels | right 427px = sidebar
  Bottom bar (40px)  : latency, FPS, abnormal count, status chips, battery

Camera panel split:
  Left  half (427px wide): raw camera feed
  Right half (426px wide): detection overlay with colored bboxes

Sidebar metrics:
  Cell Health Score (large), CSI bar, per-class counts

Color scheme:
  Background   #0a0c0e  →  BGR (14, 12, 10)
  Accent blue  #4da6ff  →  BGR (255, 166, 77)
  Normal bbox  green    →  BGR (0, 200, 0)
  Dividing box yellow   →  BGR (0, 200, 200)
  Abnormal box red      →  BGR (0, 0, 220)
"""

import time
import cv2
import numpy as np

DISPLAY_W = 1280
DISPLAY_H = 800

BAR_H = 40
MAIN_H = DISPLAY_H - 2 * BAR_H          # 720
SIDEBAR_W = 427
PANEL_W = DISPLAY_W - SIDEBAR_W          # 853
HALF_PANEL_W = PANEL_W // 2             # 426 / 427

BG = (14, 12, 10)
ACCENT = (255, 166, 77)
WHITE = (255, 255, 255)
GRAY = (120, 120, 120)
GREEN = (0, 200, 0)
YELLOW = (0, 200, 200)
RED = (0, 0, 220)
DARK_CARD = (28, 30, 34)

BBOX_COLORS = {"normal": GREEN, "dividing": YELLOW, "abnormal": RED}

FONT = cv2.FONT_HERSHEY_SIMPLEX
FONT_MONO = cv2.FONT_HERSHEY_DUPLEX


class UI:
    def __init__(self, width: int = DISPLAY_W, height: int = DISPLAY_H):
        self._w = width
        self._h = height
        self._start_time = time.time()
        cv2.namedWindow("ExCELLsis", cv2.WINDOW_NORMAL)
        cv2.resizeWindow("ExCELLsis", self._w, self._h)
        # --- Pi deployment: replace the two lines above with these ---
        # cv2.namedWindow("ExCELLsis", cv2.WINDOW_NORMAL)
        # cv2.setWindowProperty("ExCELLsis", cv2.WND_PROP_FULLSCREEN, cv2.WINDOW_FULLSCREEN)

    def render(
        self,
        raw_frame: np.ndarray,
        detections: list[dict],
        health_score: int,
        csi: float,
        counts: dict,          # {"total": int, "normal": int, "dividing": int, "abnormal": int}
        metrics: dict,         # {"latency_ms": float, "fps": float, "battery_pct": int}
    ) -> None:
        canvas = np.full((self._h, self._w, 3), BG, dtype=np.uint8)

        self._draw_top_bar(canvas, metrics)
        self._draw_panels(canvas, raw_frame, detections)
        self._draw_sidebar(canvas, health_score, csi, counts)
        self._draw_bottom_bar(canvas, metrics, counts["abnormal"])

        cv2.imshow("ExCELLsis", canvas)
        cv2.waitKey(1)

    # --- Top bar ---

    def _draw_top_bar(self, canvas: np.ndarray, metrics: dict) -> None:
        elapsed = time.time() - self._start_time
        elapsed_str = f"{int(elapsed // 60):02d}:{int(elapsed % 60):02d}"

        cv2.rectangle(canvas, (0, 0), (self._w, BAR_H), DARK_CARD, -1)
        cv2.putText(canvas, "ExCELLsis", (12, 28), FONT_MONO, 0.75, ACCENT, 2)
        cv2.putText(canvas, "YOLOv5n-Hailo10H", (180, 26), FONT, 0.45, GRAY, 1)

        # Live dot
        cv2.circle(canvas, (420, 20), 6, GREEN, -1)
        cv2.putText(canvas, "LIVE", (432, 26), FONT, 0.45, GREEN, 1)

        # Elapsed
        cv2.putText(canvas, elapsed_str, (self._w - 90, 26), FONT_MONO, 0.55, WHITE, 1)

    # --- Camera panels ---

    def _draw_panels(
        self, canvas: np.ndarray, raw_frame: np.ndarray, detections: list[dict]
    ) -> None:
        top = BAR_H
        panel_h = MAIN_H

        raw_resized = cv2.resize(raw_frame, (HALF_PANEL_W, panel_h))
        canvas[top:top + panel_h, 0:HALF_PANEL_W] = raw_resized

        det_frame = raw_resized.copy()
        scale_x = HALF_PANEL_W / raw_frame.shape[1]
        scale_y = panel_h / raw_frame.shape[0]

        for d in detections:
            x1, y1, x2, y2 = d["bbox"]
            color = BBOX_COLORS.get(d["class"], WHITE)
            px1 = int(x1 * scale_x)
            py1 = int(y1 * scale_y)
            px2 = int(x2 * scale_x)
            py2 = int(y2 * scale_y)
            cv2.rectangle(det_frame, (px1, py1), (px2, py2), color, 2)
            label = f"{d['class']} {d['confidence']:.2f}"
            cv2.putText(det_frame, label, (px1, max(py1 - 6, 10)), FONT, 0.38, color, 1)

        canvas[top:top + panel_h, HALF_PANEL_W:HALF_PANEL_W * 2] = det_frame

        # Divider line
        cv2.line(canvas, (HALF_PANEL_W, top), (HALF_PANEL_W, top + panel_h), ACCENT, 1)
        cv2.line(canvas, (PANEL_W, top), (PANEL_W, top + panel_h), ACCENT, 1)

    # --- Sidebar ---

    def _draw_sidebar(
        self, canvas: np.ndarray, health_score: int, csi: float, counts: dict
    ) -> None:
        x0 = PANEL_W + 10
        y = BAR_H + 20

        # Health score
        score_color = GREEN if health_score > 70 else (YELLOW if health_score >= 40 else RED)
        cv2.putText(canvas, "Cell Health Score", (x0, y + 16), FONT, 0.5, GRAY, 1)
        y += 30
        cv2.putText(canvas, str(health_score), (x0, y + 48), FONT_MONO, 2.2, score_color, 3)
        y += 60
        cv2.putText(canvas, "/ 100", (x0 + 110, y), FONT, 0.5, GRAY, 1)
        y += 30

        # CSI bar
        cv2.putText(canvas, f"CSI  {csi:.1f}", (x0, y + 14), FONT, 0.48, GRAY, 1)
        y += 22
        bar_w = SIDEBAR_W - 20
        fill = int(min(csi / 100, 1.0) * bar_w)
        cv2.rectangle(canvas, (x0, y), (x0 + bar_w, y + 10), (50, 50, 50), -1)
        csi_color = GREEN if csi < 15 else (YELLOW if csi < 40 else RED)
        cv2.rectangle(canvas, (x0, y), (x0 + fill, y + 10), csi_color, -1)
        y += 30

        # Counts
        for label, key, color in [
            ("Total", "total", WHITE),
            ("Normal", "normal", GREEN),
            ("Dividing", "dividing", YELLOW),
            ("Abnormal", "abnormal", RED),
        ]:
            cv2.putText(canvas, f"{label}:", (x0, y + 14), FONT, 0.5, GRAY, 1)
            cv2.putText(canvas, str(counts[key]), (x0 + 130, y + 14), FONT_MONO, 0.6, color, 1)
            y += 28

    # --- Bottom bar ---

    def _draw_bottom_bar(
        self, canvas: np.ndarray, metrics: dict, abnormal_count: int
    ) -> None:
        y0 = self._h - BAR_H
        cv2.rectangle(canvas, (0, y0), (self._w, self._h), DARK_CARD, -1)

        lat = metrics.get("latency_ms", 0)
        fps = metrics.get("fps", 0)
        bat = metrics.get("battery_pct", 0)

        items = [
            f"Lat: {lat:.0f}ms",
            f"FPS: {fps:.1f}",
            f"Abn: {abnormal_count}",
            "Hailo: OK",
            "Pi: OK",
            f"BAT: {bat}%",
        ]
        x = 12
        for item in items:
            cv2.putText(canvas, item, (x, y0 + 26), FONT, 0.42, GRAY, 1)
            x += len(item) * 9 + 20

    def close(self) -> None:
        cv2.destroyAllWindows()
