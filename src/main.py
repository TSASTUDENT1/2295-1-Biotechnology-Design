"""
main.py — ExCELLsis entry point.

Boot sequence:
  1. Start WebSocket server (background thread)
  2. Initialize all subsystems (camera, inference, UI, LEDs, GPIO)
  3. Set ring to idle, status LED off
  4. Enter main analysis loop
  5. On KeyboardInterrupt / SIGTERM: graceful cleanup

Main loop per frame:
  capture → inference → compute CSI + health score → update UI → update LEDs

GPIO 17 — chamber light toggle
GPIO 27 — display mode cycle (broadcasts to React UI via WebSocket)
"""

import os
import signal
import time

import websocket_server
from camera import Camera
from inference import Inference
from ui import UI
from leds import LEDController
from gpio_control import GPIOController

HEF_PATH = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "..", "models", "excellsis_yolov5n.hef",
)


def compute_scores(detections: list[dict]) -> tuple[float, int]:
    total = len(detections)
    if total == 0:
        return 0.0, 100
    abnormal = sum(1 for d in detections if d["class"] == "abnormal")
    mean_conf = sum(d["confidence"] for d in detections) / total
    csi = (abnormal / total) * mean_conf * 100
    health_score = max(0, min(100, round(100 - csi * 3)))
    return csi, health_score


def build_counts(detections: list[dict]) -> dict:
    counts = {"total": len(detections), "normal": 0, "dividing": 0, "abnormal": 0}
    for d in detections:
        if d["class"] in counts:
            counts[d["class"]] += 1
    return counts


def run() -> None:
    websocket_server.start()

    def on_mode_press():
        websocket_server.broadcast_sync({"event": "mode_cycle"})

    camera = Camera()
    inference = Inference(HEF_PATH)
    ui = UI()
    leds = LEDController()
    gpio = GPIOController(on_mode_press=on_mode_press)

    leds.set_ring_idle()
    leds.set_status(100)

    _running = True

    def _shutdown(sig, frame):
        nonlocal _running
        _running = False

    signal.signal(signal.SIGTERM, _shutdown)

    try:
        camera.start()
        leds.set_ring_scan()

        fps_counter = 0
        fps_timer = time.time()
        fps = 0.0

        while _running:
            t0 = time.time()

            frame = camera.capture_frame()

            t_inf = time.time()
            detections = inference.run(frame)
            latency_ms = (time.time() - t_inf) * 1000

            csi, health_score = compute_scores(detections)
            counts = build_counts(detections)

            fps_counter += 1
            if time.time() - fps_timer >= 1.0:
                fps = fps_counter / (time.time() - fps_timer)
                fps_counter = 0
                fps_timer = time.time()

            metrics = {
                "latency_ms": latency_ms,
                "fps": fps,
                "battery_pct": 0,  # TODO: wire BMS ADC read
            }

            if gpio.is_chamber_light_on():
                leds.set_ring_scan()
            else:
                leds.set_ring_off()

            leds.set_status(health_score)

            ui.render(frame, detections, health_score, csi, counts, metrics)

    except KeyboardInterrupt:
        pass
    finally:
        leds.set_ring_off()
        leds.cleanup()
        gpio.cleanup()
        camera.stop()
        inference.close()
        ui.close()


if __name__ == "__main__":
    run()
