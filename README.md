# ExCELLsis

Portable edge-AI cellular bioanalysis device — TSA Biotechnology Design, nationals level.

Runs fully offline on a Raspberry Pi 5 + Hailo-10H NPU. Detects and classifies cells in real time via a custom YOLOv5n model, displaying live results on a 1280×800 touchscreen with LED health feedback.

---

## Hardware

| Component | Spec |
|-----------|------|
| SBC | Raspberry Pi 5 (16GB) |
| NPU | Hailo-10H AI HAT+ 2 (40 TOPS INT4) via PCIe |
| Camera | Arducam 12.3MP IMX477 HQ (CSI) |
| Display | Waveshare 10.1-DSI-TOUCH-A 1280×800 IPS (22-pin DSI) |
| LED ring | WS2812B 40-LED RGB (GPIO 18) |
| Status LED | RGB LED (GPIO 23=R, 24=G, 25=B) |
| Button | Momentary chamber light toggle (GPIO 17) |
| Power | 4× OVONIC 3S 8000mAh LiPo → BMS → XL4016 → 5V |

---

## Software Stack

- **Python 3.11+** on Raspberry Pi OS Bookworm (64-bit)
- **picamera2** — IMX477 capture
- **HailoRT / hailo-platform** — Hailo-10H inference (system-wide SDK install)
- **OpenCV** — frame processing and UI rendering
- **rpi-ws281x** — WS2812B ring control
- **RPi.GPIO** — status LED + button

---

## Setup

### 1. Clone the repo
```bash
git clone https://github.com/TSASTUDENT1/2295-1-Biotechnology-Design.git excellsis
cd excellsis
```

### 2. Install Hailo SDK (system-wide, done once)
Follow [Hailo RPi5 setup guide](https://github.com/hailo-ai/hailo-rpi5-examples).

### 3. Install Python dependencies
```bash
pip install -r requirements.txt
```

### 4. Copy the compiled model
```bash
cp /path/to/excellsis_yolov5n.hef models/
```
The `.hef` must be compiled for **Hailo-10H** (not Hailo-8).

### 5. Enable boot autostart
```bash
sudo cp systemd/excellsis.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable excellsis
sudo systemctl start excellsis
```

### 6. Run manually
```bash
python3 src/main.py
```

---

## Formulas

```
CSI               = (abnormal_count / total_count) × mean_confidence × 100
Cell Health Score = max(0, min(100, round(100 − CSI × 3)))
```

---

## LED States

### WS2812B Ring (40-LED, GPIO 18)
| State | Color | Trigger |
|-------|-------|---------|
| Analysis/scan | Full white | Running inference |
| Standby | Dim blue | Idle |
| Off | Off | Chamber button toggled off |

### RGB Status LED (GPIO 23/24/25)
| Health Score | Color |
|-------------|-------|
| > 70 | Green |
| 40–70 | Yellow |
| < 40 | Red |

---

## Repository Structure

```
excellsis/
├── src/
│   ├── main.py           # Entry point
│   ├── camera.py         # IMX477 capture
│   ├── inference.py      # Hailo-10H YOLOv5n inference
│   ├── ui.py             # 1280×800 display
│   ├── leds.py           # LED ring + status LED
│   └── gpio_control.py   # Button input
├── models/               # Place excellsis_yolov5n.hef here (not committed)
├── assets/fonts/         # UI fonts
├── systemd/
│   └── excellsis.service
├── docs/                 # reference docs
├── ExCELLsis_Master_Document.docx  # full BOM, schedule, portfolio
├── DIMENSIONS.md         # enclosure panel dimensions + cutout coords
├── requirements.txt
└── README.md
```

---

## Enclosure

| Property | Value |
|----------|-------|
| Outer dimensions | 254 mm W × 300 mm H × 203 mm D |
| Shell material | 3 mm clear cast acrylic (Glowforge laser cut) |
| Accents | 3 mm black cast acrylic |
| Optic box | 152 mm W × 84 mm H × 80 mm D, lower-front alcove |
| Optic box door | 3 mm fiberglass (FR4), side-hinged, magnet catch |
| Optical column | 40× RMS objective → 160 mm tube → Arducam (12 mm OD tube, 3D printed) |
| Display mount | Inset behind front panel cutout (222 × 136 mm), Pi + HAT on display rear face |
| Battery compartment | Left panel, 133 × 67 mm door, 2×2 OVONIC 3S 8000 mAh packs |

See `DIMENSIONS.md` for full panel coordinates, cutout positions, and joint specs.

---

## Detection Classes

| Class | Bbox Color |
|-------|-----------|
| normal | Green |
| dividing | Yellow |
| abnormal | Red |

Confidence threshold: 0.35 (configurable in `src/inference.py`).
