"""
leds.py — WS2812B 40-LED ring (GPIO 18) and RGB status LED (GPIO 23/24/25).

Ring states:
  scan  → full white (analysis mode)
  idle  → dim blue (standby)
  off   → all off (button toggled off)

Status LED states (driven by Cell Health Score):
  score > 70  → green  (GPIO 24 on)
  score 40-70 → yellow (GPIO 23 + GPIO 24 on)
  score < 40  → red    (GPIO 23 on)
"""

import RPi.GPIO as GPIO
from rpi_ws281x import PixelStrip, Color

# WS2812B ring
RING_PIN = 18
RING_COUNT = 40
RING_FREQ = 800_000
RING_DMA = 10
RING_BRIGHTNESS = 255
RING_INVERT = False
RING_CHANNEL = 0

# RGB status LED pins (BCM)
LED_R = 23
LED_G = 24
LED_B = 25

# Ring colors
WHITE = Color(255, 255, 255)
DIM_BLUE = Color(0, 0, 40)
OFF = Color(0, 0, 0)


class LEDController:
    def __init__(self):
        self._strip = PixelStrip(
            RING_COUNT, RING_PIN, RING_FREQ, RING_DMA,
            RING_INVERT, RING_BRIGHTNESS, RING_CHANNEL,
        )
        self._strip.begin()

        GPIO.setmode(GPIO.BCM)
        GPIO.setwarnings(False)
        for pin in (LED_R, LED_G, LED_B):
            GPIO.setup(pin, GPIO.OUT)
            GPIO.output(pin, GPIO.LOW)

    # --- Ring ---

    def set_ring_scan(self) -> None:
        self._fill_ring(WHITE)

    def set_ring_idle(self) -> None:
        self._fill_ring(DIM_BLUE)

    def set_ring_off(self) -> None:
        self._fill_ring(OFF)

    def _fill_ring(self, color: Color) -> None:
        for i in range(self._strip.numPixels()):
            self._strip.setPixelColor(i, color)
        self._strip.show()

    # --- Status LED ---

    def set_status(self, health_score: int) -> None:
        r = health_score < 40 or (40 <= health_score <= 70)
        g = health_score > 70 or (40 <= health_score <= 70)
        GPIO.output(LED_R, GPIO.HIGH if r else GPIO.LOW)
        GPIO.output(LED_G, GPIO.HIGH if g else GPIO.LOW)
        GPIO.output(LED_B, GPIO.LOW)

    # --- Cleanup ---

    def cleanup(self) -> None:
        self._fill_ring(OFF)
        for pin in (LED_R, LED_G, LED_B):
            GPIO.output(pin, GPIO.LOW)
        GPIO.cleanup([LED_R, LED_G, LED_B])
