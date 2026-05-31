# ExCELLsis — Enclosure Dimensions & Panel Layout

**Owner:** Sangle (CAD / Glowforge fabrication)  
**All dimensions in millimetres (mm).**  
**Diagram scale:** 1 character ≈ 5 mm (layout reference only — not for fabrication)

### How to read placeholders
Any dimension written like `NAME mm` is a placeholder — measure the physical part (or look up the datasheet) and fill it in before sending to Glowforge.

---

## 0. Can You Drill Into the Acrylic / PLA / Fiberglass?

| Material | Drillable? | Notes |
|----------|-----------|-------|
| Cast acrylic (plexiglass) | **Yes** | Brad-point or step-drill bits only. Low RPM (300–500). Back with a scrap wood block. Apply masking tape to both faces before drilling. Use a step-drill for holes ≥ 10 mm. Light, steady pressure; never force. |
| PLA (3D print) | **Yes, easily** | Any standard HSS twist bit. Can tap M3/M4 threads directly into PLA with a hand tap. |
| Fiberglass (FR4 sheet) | **Yes** | HSS or carbide bit, low RPM, light pressure. Wear a mask — fiberglass dust is a lung irritant. Sand cut edges lightly after Glowforge. |
| Recommendation | — | All cutouts should be laser-cut at Glowforge time. Drill only for last-minute post-assembly fixes. |

---

## 1. Overall Enclosure Dimensions

Width and depth are confirmed. Height depends on the optic box — see Section 13.

```
              ←──── 254 mm (10.0") ────→
              ┌─────────────────────────┐  ↑
              │                         │  │  TOTAL_H mm
              │                         │  │  target ≤ 305 mm (12")
              └─────────────────────────┘  ↓
              ←──── 203 mm (8.0") ─────→  (depth)
```

| Dimension | Value | TSA Limit | Status |
|-----------|-------|-----------|--------|
| Width | 254 mm (10.0") | 762 mm | **Fixed** |
| Height | TOTAL_H mm | 1219 mm | Placeholder — see Section 13 |
| Depth | 203 mm (8.0") | 381 mm | **Fixed** |

---

## 2. Material Thicknesses

| Part | Material | Thickness |
|------|----------|-----------|
| Main shell (6 outer panels) | Clear cast acrylic | **3 mm** |
| Optic box ceiling panel | Clear cast acrylic | **3 mm** |
| Optic box back wall panel | Clear cast acrylic | **3 mm** |
| Optic box door | Fiberglass sheet | **3 mm** |
| Control strip overlay | Black cast acrylic | **3 mm** |
| Camera mount, Pi standoff brackets | PLA 3D print | solid |

---

## 3. Depth Breakdown (Front → Back)

```
FRONT                                                    BACK
  │ panel │←────── optic box ──────→│←── large air gap ──→│panel│
  │  3mm  │         80 mm           │      ~114 mm         │ 3mm │
  └───────┴─────────────────────────┴──────────────────────┴─────┘
  ←──────────────────────── 203 mm total ──────────────────────────→
```

| Zone | Depth | Notes |
|------|-------|-------|
| Front panel | 3 mm | Clear cast acrylic |
| Optic box interior | 80 mm | Camera looks down into this |
| Air gap (behind optic box) | ~114 mm | Wiring channel, airflow path |
| Back panel | 3 mm | Clear cast acrylic |
| **Total** | **~203 mm** | |

> **Pi + HAT location:** Pi 5 + Hailo HAT mount on the **rear face of the display module** in the upper interior zone (behind the screen, ~61mm from the front panel inner face). This is a separate zone from the optic box depth breakdown above.

---

## 4. Full Side Cross-Section

Scale 1 char ≈ 5 mm. Left = back face, right = front face.

```
BACK                                                       FRONT
                                                              │ ← front panel (3mm)
┌─────────────────────────────────────────────────────────── ┤
│                                               ░░░░░░░░░░░  │ ← overhang dust lip (~6mm)
│                                    [Pi+HAT]   ┌──────────┐ │ Y= DISP_TOP
│                              [camera body]    │          │ │
│                              [ adapter  ]     │  screen  │ │ ← display module inset
│                              [  tube ↓  ]     │  module  │ │   239mm W × 147mm H × 10.8mm D
│                              [  tube ↓  ]     │  147mm   │ │   cutout ≈ 222mm × 136mm
│                              [  tube ↓  ]     │          │ │
│                                               └──────────┘ │ Y= DISP_BOT
│                                               ░░░░░░░░░░░  │ ← underhang dust lip (~6mm)
│                                               ░ controls ░ │ ← control strip + 3mm overlay
├─────────────────────────────────────────────────────────── ┤ ← optic box ceiling (3mm)
│  large air gap (~111mm)   │  ┌───────────────────────────  ┤ Y= OPT_TOP
│                           │  │                             │
│                           │  │   optic box                 │ ← [fiberglass door]
│                           │  │   objective + illuminator   │   side-hinged right edge
│                           │  │                             │
│                           │  └───────────────────────────  ┤ Y= TOTAL_H − 3mm
└───────────────────────────┴────────────────────────────────┘ ← bottom panel (3mm)

←───── air gap ~111mm ─────→←── optic box 80mm ────────────→
←──────────────────────── 203 mm total ────────────────────→
```

**Key layout rules:**
- Screen module sits behind the front panel. The acrylic border around the cutout (≈6mm on all sides) forms the dust lip. No separate bezel strip needed.
- Pi + Hailo HAT mounts on the **rear face of the display module**, in the upper interior zone. Pi is ~61mm from the front panel inner face (10.8mm display + 50mm Pi+HAT stack).
- Camera + adapter tube is inside the main box, above the optic box ceiling. Tube descends through the ceiling aperture into the optic chamber.
- Large air gap (~111mm behind optic box) is the wiring/airflow channel.

---

## 5. Front Panel  `254 mm W × TOTAL_H mm H × 3 mm thick`

### 5a. Normal View (face-on)

```
  0        50       100      150      200      254 mm
  ├─────────┼─────────┼─────────┼─────────┼─────┤
  ┌──────────────────────────────────────────────────┐ Y=  0
  │    E x C E L L s i s  ·  P O R T A B L E  A I   │   ← branding engrave
  ├──────────────────────────────────────────────────┤ Y= ~15 mm
  │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │  ← overhang dust lip (~6 mm)
  │  ┌──────────────────────────────────────────┐   │ Y= DISP_TOP mm
  │  │                                          │   │
  │  │   screen cutout                          │   │   display module behind:
  │  │   ~222 mm × ~140 mm                      │   │   239 mm W × 147 mm H × 10.8 mm D
  │  │   (active area 217 × 136 + 2mm margin)   │   │   module bezel rests on inner face
  │  │                                          │   │
  │  └──────────────────────────────────────────┘   │ Y= DISP_BOT mm
  │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │  ← underhang dust lip (~6 mm)
  ├──────────────────────────────────────────────────┤ Y= CTRL_TOP mm
  │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│  ← 3 mm black acrylic overlay strip
  │░  ●          ⏻           ◉           ◉        ░│  Y= CTRL_CTR mm ← all button centres
  │░  STATUS   ON/OFF      CHAMBER      MODE       ░│
  │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
  ├──────────────────────────────────────────────────┤ Y= CTRL_BOT mm
  │       ┌──────────────────────────────────┐       │ Y= OPT_TOP mm
  │       │                                  │       │
  │       │   optic box door opening         │       │   OPT_BOX_W mm × 84 mm
  │       │   (fiberglass door sits here)    │       │   centred: X = (254 − OPT_BOX_W) / 2
  │       │                                  │       │
  │       └──────────────────────────────────┘       │ Y= TOTAL_H − 3 mm
  └──────────────────────────────────────────────────┘ Y= TOTAL_H mm
```

### 5b. Front Panel Feature Table

| Feature | Type | X centre | Y | W (mm) | H (mm) | Source |
|---------|------|----------|---|--------|--------|--------|
| Branding engrave | Engrave | 127 | 8 | 234 | ~10 | Design |
| Screen cutout | Through-cut | 127 | DISP_TOP mm | ~222 | ~140 | Verify with display module |
| Status LED hole | Through-cut | ~40 | CTRL_CTR mm | — | LED_DIA mm | LED datasheet |
| ON/OFF button hole | Through-cut | ~98 | CTRL_CTR mm | — | BTN_DIA mm | Button datasheet |
| Chamber light button hole | Through-cut | ~156 | CTRL_CTR mm | — | BTN_DIA mm | Button datasheet |
| Mode cycle button hole | Through-cut | ~214 | CTRL_CTR mm | — | BTN_DIA mm | Button datasheet |
| Optic box door opening | Through-cut | 127 | OPT_TOP mm | OPT_BOX_W mm | 84 mm | Derived — Section 13 |

> **Screen cutout note:** Cutout is ~222mm × ~140mm (active area 217×136mm + ~2.5mm margin each side). This is smaller than the module (239×147mm), so the module bezel rests on the panel inner face — no extra mounting hardware needed on the front face. Confirm final cutout size against the physical display before sending to Glowforge.
>
> **Optic box opening position:** With OPT_BOX_W = 152mm, left edge X = (254−152)/2 = **51 mm** from left panel.
>
> **Control strip overlay:** 3mm black acrylic strip glued to outer front panel face over the control zone. Overlay has clearance holes 3mm larger than each button/LED hole. Width = 234mm (10mm margin each side). Height = CTRL_BOT − CTRL_TOP mm.

---

## 6. Back Panel  `254 mm W × TOTAL_H mm H × 3 mm thick`

### 6a. Normal View

```
  0        50       100      150      200      254 mm
  ┌──────────────────────────────────────────────────┐ Y=  0
  │ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○  │
  │ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○  │  ← vent grille (∅8 mm, 12 mm stagger)
  │ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○  │    covers display zone height only
  ├──────────────────────────────────────────────────┤ Y= VENT_BOT mm  ← = OPT_TOP on front
  │  ▬▬▬▬▬▬  ▬▬▬▬▬▬  ▬▬▬▬▬▬                        │  ← Pi exhaust vent slots
  │                                                  │    (behind air gap / Pi fan zone)
  │  [BAL_W × BAL_H slot]                            │ Y= BAL_Y mm  ← LiPo balance port
  │  [14 × 8 mm slot   ]                             │ Y= USB_Y mm  ← USB-A debug
  └──────────────────────────────────────────────────┘ Y= TOTAL_H mm
```

### 6b. Feature Table

| Feature | Type | X | Y | W (mm) | H (mm) |
|---------|------|---|---|--------|--------|
| Vent grille ∅8 on 12mm stagger | Through-cut array | 20–234 | 20 to VENT_BOT | — | — |
| Pi exhaust vent slots × 3 | Through-cut | centred | VENT_BOT+15 mm | PVENT_W mm | 8 |
| LiPo balance port | Through-cut | 20 | BAL_Y mm | BAL_W mm | BAL_H mm |
| USB-A debug port | Through-cut | 20 | USB_Y mm | 14 | 8 |

> Vent grille top zone (Y=20 to VENT_BOT) exhausts heat from the display + camera area.
> Pi exhaust slots below VENT_BOT sit directly behind the Pi fan — align their Y position with the Pi fan centre after measuring Pi mounting height from the bottom.

---

## 7. Left Side Panel  `203 mm D × TOTAL_H mm H × 3 mm thick`

```
  Z →  0 (front face)                     203 mm (back face)
  ┌──────────────────────────────────────────────────┐ Y=  0
  │                                                  │
  │              no external features                │
  │                                                  │
  └──────────────────────────────────────────────────┘ Y= TOTAL_H mm
```

Internal face carries PLA cable clips. No external cutouts.

> **Optic box side wall tab:** At the lower portion of the internal face, a 3mm acrylic strip runs from Z=3mm to Z=83mm (front panel inner face to optic box back wall outer face), spanning 84 mm in height. This closes the left side of the optic box alcove. Laser-cut as a separate interior tab and glue in.

---

## 8. Right Side Panel  `203 mm D × TOTAL_H mm H × 3 mm thick`

```
  Z →  0 (front face)       METER_Z           203 mm (back face)
  ┌──────────────────────────────────────────────────┐ Y=  0
  │                                                  │
  │    ┌──────────────────┐                          │ Y= METER_Y mm
  │    │  METER_W×METER_H │  ← inline voltage meter  │
  │    └──────────────────┘                          │
  │                                                  │
  └──────────────────────────────────────────────────┘ Y= TOTAL_H mm
```

| Feature | Type | Z from front | Y | W (mm) | H (mm) |
|---------|------|-------------|---|--------|--------|
| Inline voltage / capacity meter | Through-cut | METER_Z mm | METER_Y mm | METER_W mm | METER_H mm |

Same optic box side wall tab note as left panel.

---

## 9. Top Panel  `254 mm W × 203 mm D × 3 mm thick`

```
  Z →  0 (front)                           203 mm (back)
  ┌──────────────────────────────────────────────────┐ X=  0
  │                                                  │
  │              ┌──────────────┐                    │
  │              │  FAN_W×FAN_H │                    │  ← Pi 5 active cooler vent
  │              └──────────────┘                    │    centred X=127, Z=FAN_Z mm
  │                                                  │
  └──────────────────────────────────────────────────┘ X= 254
```

| Feature | Type | X centre | Z from front | W | H |
|---------|------|----------|-------------|---|---|
| Active cooler vent | Through-cut | 127 | FAN_Z mm | FAN_W mm | FAN_H mm |

> Pi is behind the display module at Z ≈ 10.8+50 = ~61mm from front panel inner face (~67mm from front face outer). FAN_Z ≈ 55–65mm. Measure Pi + HAT stack position after assembly to confirm.

---

## 10. Bottom Panel  `254 mm W × 203 mm D × 3 mm thick`

```
  Z →  0 (front)                           203 mm (back)
  ┌──────────────────────────────────────────────────┐ X=  0
  │ ◯                                           ◯    │  ← rubber feet (∅20, 15mm inset)
  │      ▬▬▬▬▬▬▬   ▬▬▬▬▬▬▬   ▬▬▬▬▬▬▬              │  ← optional bottom vent slots
  │ ◯                                           ◯    │
  └──────────────────────────────────────────────────┘ X= 254
```

| Feature | Notes |
|---------|-------|
| Rubber feet × 4 | ∅20mm adhesive pads, 15mm inset from all edges |
| Bottom vent slots × 3 (optional) | Through-cut, 5mm H, centred, Z = 50mm from front edge |

---

## 11. Optic Box Sub-Enclosure

The optic box is an alcove formed at the lower-front of the main box. It shares the main box front panel (door opening) and bottom panel (floor). It is enclosed by four internal panels cut from 3mm clear acrylic.

### 11a. Optic Box Dimensions

| Dimension | Value | Notes |
|-----------|-------|-------|
| Width (OPT_BOX_W) | ~152 mm | 60% of 254mm — centred on front panel |
| Depth | 80 mm | Front panel inner face → optic box back wall outer face |
| Height (84) | 84 mm | **Placeholder — see Section 13** |
| Left edge from left panel | ~51 mm | (254 − 152) / 2 = 51mm |

### 11b. Optic Box Ceiling Panel  `152 mm W × 80 mm D × 3 mm thick`

Horizontal panel at Y = TOTAL_H − 6 (bottom) − 84 from top. Glued to left/right inner side walls of optic box and to the front panel inner face.

```
  Z →  0 (front)         40          80 mm (back wall)
  ┌──────────────────────────────────────────────┐ X=  0 (left edge of optic box)
  │                                              │
  │              ╭──────────╮                   │
  │             ( APERT_DIA  )                  │  ← adapter tube aperture
  │              ╰──────────╯                   │    centred at (76mm, 40mm)
  │                                              │
  └──────────────────────────────────────────────┘ X= 152 mm
```

| Feature | Type | X centre | Z centre | Size |
|---------|------|----------|----------|------|
| Adapter tube aperture | Through-cut circle | 76 | 38 | ∅ APERT_DIA mm |

> APERT_DIA = outer diameter of RMS-to-C-mount adapter tube + 3mm clearance.

### 11c. Optic Box Back Wall  `152 mm W × 84 mm H × 3 mm thick`

Vertical panel at Z = 80mm from front panel inner face. Camera adapter tube passes in front of this wall inside the optic box. No Pi mounting on this panel — Pi is on the display rear face.

---

## 12. Fiberglass Door  `OPT_BOX_W mm W × 84 mm H × 3 mm thick`

Covers the optic box front opening. **Hinge on right edge** (door swings left when viewed from front). Neodymium magnet catch on left edge.

### 12a. Door Normal View

```
  0              OPT_BOX_W/2          OPT_BOX_W mm
  ┌────────────────────────────────────────────┐ Y= 0
  │        O P T I C   C H A M B E R          │  ← engrave
  ├────────────────────────────────────────────┤
  │                                            │
  │                ╭──────╮                    │
  │               ( RING_W )                   │  ← LED ring window
  │                ╰──────╯                    │    ∅ RING_W mm
  │                                            │    centred at (OPT_BOX_W/2, RING_Y mm)
  │                                            │
  │  [magnet]               [hinge]  [hinge]  │
  └────────────────────────────────────────────┘ Y= 84 mm
```

| Feature | Type | X centre | Y | Size |
|---------|------|----------|---|------|
| "OPTIC CHAMBER" | Engrave | OPT_BOX_W/2 | 10 | text |
| LED ring window | Through-cut | OPT_BOX_W/2 | RING_Y mm | ∅ RING_W mm |
| Hinge × 2 | Surface-mount | OPT_BOX_W (right edge) | HINGE_Y1, HINGE_Y2 | **measure hinge** |
| Magnet recess | Pocket | 10 | 42 | MAG_DIA mm |

> **No slide slot.** Open the door to place the slide on the stage, then close. Avoids slot alignment tolerance issues and keeps the optic box sealed when not in use.
>
> **RING_W:** Measure WS2812B ring outer diameter and add ~5mm clearance → RING_W = ring OD + 5mm.

---

## 13. Height Calculation

### 13a. Front Face Zone Heights (top → bottom)

```
TOTAL_H  =   3 mm   (top panel)
           + ~15 mm  (branding strip)
           + ~6 mm   (overhang dust lip above screen)
           + 147 mm  (display module height — confirmed from Waveshare spec)
           + ~6 mm   (underhang dust lip below screen)
           + ~30 mm  (control strip zone including 3mm overlay)
           + 84 mm  (optic box door opening)
           + 3 mm   (bottom panel)
           ─────────────────────────────────
           = 210 mm + 84 mm
```

| TOTAL_H target | Max 84 |
|----------------|---------------|
| 254 mm (10.0") | 44 mm — very tight, only feasible with very short optics |
| 280 mm (11.0") | 70 mm — achievable with compact objective + stage |
| 305 mm (12.0") | 95 mm — comfortable for standard 40× DIN + stage + illuminator |

### 13b. Optical Components to Measure

Fill in these values when parts arrive. They determine 84.

| Variable | What to measure | On which part |
|----------|----------------|---------------|
| OBJ_L | 40× DIN objective barrel length | Objective from BOM |
| OBJ_WD | Working distance (tip → slide surface) | Objective spec / barrel stamp |
| STAGE_H | Slide stage assembly height (base to slide surface) | Stage from BOM |
| ILLUM_H | LED trans-illuminator + diffuser assembly height | Illuminator from BOM |
| ADAP_BELOW | Length of adapter tube below optic box ceiling | Measure assembled column |
| APERT_DIA | Adapter tube outer diameter + 3mm | Adapter from BOM |
| RING_W | WS2812B ring outer diameter + 5mm | Ring from BOM |

### 13c. Minimum 84 Formula

```
84 = ADAP_BELOW + OBJ_L + OBJ_WD + 1mm (slide) + STAGE_H + 5mm (gap) + ILLUM_H + 5mm (margin)
```

Minimise ADAP_BELOW (keep as much of the adapter tube above the ceiling as possible) to reduce 84 and keep TOTAL_H under 305mm.

---

## 14. Screen Mounting Detail

| Property | Value |
|----------|-------|
| Display model | Waveshare 10.1-DSI-TOUCH-B |
| Module outer dimensions | 239.00 mm W × 147.00 mm H |
| Module profile (depth) | 10.8 mm |
| Active area | 217.18 mm W × 135.96 mm H |
| Front panel cutout (recommended) | ~222 mm W × ~140 mm H |
| Overhang each side (W) | (239 − 222) / 2 ≈ **8.5 mm** |
| Overhang top/bottom (H) | (147 − 140) / 2 ≈ **3.5 mm** |

The module sits behind the front panel with its bezel resting on the panel inner face. Secure with M2.5 standoffs through the module PCB mounting holes. The front panel cutout exposes the active area with a clean acrylic border on all sides acting as a dust seal.

---

## 15. Assembly Notes

1. **Slot-and-tab kerf offset:** 0.1 mm outward on all cut paths for Glowforge.
2. **Optic box first:** Build and test the optic box sub-assembly (ceiling + back wall + side walls + door hinge) before assembling the main box around it. Confirm 84 from measured optical column before cutting.
3. **Screen mounting:** Cut front panel. Test-fit display module before gluing anything. Confirm cutout size (~222×140mm) against physical display — adjust by 1–2mm if needed before final cut.
4. **Adapter tube aperture:** Measure adapter tube OD before cutting ceiling panel. APERT_DIA = OD + 3mm.
5. **Door hinge:** Surface-mount hinges on right edge of door and right edge of optic box opening. Two hinges, evenly spaced vertically. Neodymium magnet catch recessed into left edge of door; matching recess in front panel.
6. **Pi + HAT mounting:** PLA standoff brackets printed and screwed to rear face of display module. Pi mounted on standoffs ~5mm behind the display. Fan faces toward back panel. Pi + HAT stack (~50mm deep) sits at Z ≈ 11–61mm from front panel inner face.
7. **Back panel Pi exhaust vents:** Position exhaust vent slots directly behind Pi fan centre. Measure Pi fan Z position after assembly and mark the back panel before drilling / laser-cutting.
8. **Top panel fan vent:** Pi active cooler is at approximately Z=55–65mm from front face (directly behind display module). Place top panel vent directly above it. Measure exact position after Pi is mounted.
9. **Fiberglass door:** Glowforge-cut fiberglass sheet. Wear a mask when handling. Sand all cut edges lightly. Use dedicated Glowforge fiberglass settings — do not use standard acrylic settings.
10. **Drilling if needed:** Step-drill, masking tape both faces, wood backing block, 300–500 RPM. Test on scrap material first.
