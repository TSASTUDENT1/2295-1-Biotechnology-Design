"""
camera.py — IMX477 HQ Camera capture via picamera2 (CSI).

Outputs BGR numpy arrays compatible with OpenCV.
"""

import numpy as np
from picamera2 import Picamera2


class Camera:
    def __init__(self, width: int = 1920, height: int = 1080, framerate: int = 30):
        self._width = width
        self._height = height
        self._framerate = framerate
        self._cam = Picamera2()

        config = self._cam.create_preview_configuration(
            main={"size": (width, height), "format": "BGR888"},
            controls={"FrameRate": framerate},
        )
        self._cam.configure(config)

    def start(self) -> None:
        self._cam.start()

    def capture_frame(self) -> np.ndarray:
        return self._cam.capture_array("main")

    def stop(self) -> None:
        self._cam.stop()
        self._cam.close()
