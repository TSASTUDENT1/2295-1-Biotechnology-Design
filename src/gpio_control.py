"""
gpio_control.py — Button inputs.

GPIO 17 — chamber light toggle (momentary, pull-up, active LOW)
GPIO 27 — display mode cycle (momentary, pull-up, active LOW)
"""

import RPi.GPIO as GPIO

CHAMBER_BTN_PIN = 17
MODE_BTN_PIN = 27
DEBOUNCE_MS = 50


class GPIOController:
    def __init__(
        self,
        chamber_pin: int = CHAMBER_BTN_PIN,
        mode_pin: int = MODE_BTN_PIN,
        on_mode_press=None,
    ):
        self._chamber_pin = chamber_pin
        self._mode_pin = mode_pin
        self._on_mode_press = on_mode_press
        self._chamber_light_on = True

        GPIO.setmode(GPIO.BCM)
        GPIO.setwarnings(False)

        for pin in (chamber_pin, mode_pin):
            GPIO.setup(pin, GPIO.IN, pull_up_down=GPIO.PUD_UP)

        GPIO.add_event_detect(
            chamber_pin,
            GPIO.FALLING,
            callback=self._on_chamber_press,
            bouncetime=DEBOUNCE_MS,
        )
        GPIO.add_event_detect(
            mode_pin,
            GPIO.FALLING,
            callback=self._on_mode_btn_press,
            bouncetime=DEBOUNCE_MS,
        )

    def _on_chamber_press(self, channel: int) -> None:
        self._chamber_light_on = not self._chamber_light_on

    def _on_mode_btn_press(self, channel: int) -> None:
        if self._on_mode_press:
            self._on_mode_press()

    def is_chamber_light_on(self) -> bool:
        return self._chamber_light_on

    def cleanup(self) -> None:
        for pin in (self._chamber_pin, self._mode_pin):
            GPIO.remove_event_detect(pin)
        GPIO.cleanup([self._chamber_pin, self._mode_pin])
