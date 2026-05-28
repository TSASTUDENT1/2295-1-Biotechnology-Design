import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Crosshair, Layers } from "lucide-react";
import type { Detection, InferenceFrame } from "../types";
import { CLASS_COLOR, CLASS_LABEL } from "../utils/metrics";

interface Props {
  frame: InferenceFrame | null;
  showBoxes: boolean;
  showHeatmap: boolean;
  modeLabel: string;
  onCycleMode: () => void;
}

/**
 * LiveFeed — the hero panel.
 *
 * Renders:
 *   • A simulated microscope "camera feed" via canvas (cells + ambient drift)
 *   • Overlaid bounding boxes / labels driven by `frame.detections`
 *   • Optional heatmap layer
 *   • A vertical scan line for that lab-instrument feel
 *
 * When the real backend is wired, this component just needs `frame` to be
 * fed by the WebSocket. The MJPEG / RTSP video can either be drawn into the
 * same canvas (or layered as a <video> element behind the overlay <canvas>).
 */
export function LiveFeed({
  frame,
  showBoxes,
  showHeatmap,
  modeLabel,
  onCycleMode,
}: Props) {
  const bgRef = useRef<HTMLCanvasElement>(null);
  const fgRef = useRef<HTMLCanvasElement>(null);
  const heatRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Animate the simulated microscope background (cells & particles)
  useEffect(() => {
    const canvas = bgRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      canvas.width = r.width * devicePixelRatio;
      canvas.height = r.height * devicePixelRatio;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.5 + Math.random() * 1.4,
      vx: (Math.random() - 0.5) * 0.0006,
      vy: (Math.random() - 0.5) * 0.0006,
      hue: 170 + Math.random() * 50,
      a: 0.15 + Math.random() * 0.5,
    }));

    const render = () => {
      const W = canvas.width;
      const H = canvas.height;
      // Dark vignette background like an objective lens
      const g = ctx.createRadialGradient(W / 2, H / 2, W * 0.1, W / 2, H / 2, W * 0.7);
      g.addColorStop(0, "#06121f");
      g.addColorStop(0.6, "#04090f");
      g.addColorStop(1, "#020407");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);

      // Faint hex grid pattern (simulated sensor)
      ctx.strokeStyle = "rgba(34,211,238,0.05)";
      ctx.lineWidth = 1;
      const step = 28 * devicePixelRatio;
      for (let x = 0; x < W; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (let y = 0; y < H; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }

      // Drift particles like fluorescent debris
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > 1) p.vx *= -1;
        if (p.y < 0 || p.y > 1) p.vy *= -1;
        ctx.beginPath();
        ctx.fillStyle = `hsla(${p.hue}, 90%, 65%, ${p.a})`;
        ctx.arc(p.x * W, p.y * H, p.r * devicePixelRatio, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(render);
    };
    render();
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  // Draw the "stained cells" that match the bounding boxes from `frame`.
  // This makes the demo feel like a real microscope feed — when the real
  // camera is wired, this canvas is simply replaced by the MJPEG/video.
  useEffect(() => {
    const canvas = fgRef.current;
    if (!canvas || !frame) return;
    const ctx = canvas.getContext("2d")!;
    const r = canvas.getBoundingClientRect();
    canvas.width = r.width * devicePixelRatio;
    canvas.height = r.height * devicePixelRatio;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const W = canvas.width;
    const H = canvas.height;

    // Render each detection as a softly-glowing fluorescent cell first
    for (const d of frame.detections) {
      const cx = (d.bbox.x + d.bbox.w / 2) * W;
      const cy = (d.bbox.y + d.bbox.h / 2) * H;
      const rad = ((d.bbox.w + d.bbox.h) / 2) * W * 0.5;
      const color = CLASS_COLOR[d.cls];
      const grad = ctx.createRadialGradient(cx, cy, rad * 0.1, cx, cy, rad);
      grad.addColorStop(0, hexA(color, 0.85));
      grad.addColorStop(0.4, hexA(color, 0.35));
      grad.addColorStop(1, hexA(color, 0));
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, rad, 0, Math.PI * 2);
      ctx.fill();

      // Nucleus
      ctx.fillStyle = hexA("#0a1320", 0.85);
      ctx.beginPath();
      ctx.arc(cx, cy, rad * 0.32, 0, Math.PI * 2);
      ctx.fill();

      // Dividing cells render as two lobes
      if (d.cls === "dividing") {
        const off = rad * 0.45;
        ctx.fillStyle = hexA("#0a1320", 0.85);
        ctx.beginPath();
        ctx.arc(cx + off, cy, rad * 0.28, 0, Math.PI * 2);
        ctx.arc(cx - off, cy, rad * 0.28, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }, [frame]);

  // Heatmap overlay — density of abnormal cells
  useEffect(() => {
    const canvas = heatRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const r = canvas.getBoundingClientRect();
    canvas.width = r.width * devicePixelRatio;
    canvas.height = r.height * devicePixelRatio;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!showHeatmap || !frame) return;

    const W = canvas.width;
    const H = canvas.height;
    for (const d of frame.detections) {
      const cx = (d.bbox.x + d.bbox.w / 2) * W;
      const cy = (d.bbox.y + d.bbox.h / 2) * H;
      const rad = ((d.bbox.w + d.bbox.h) / 2) * W * 1.6;
      const tone =
        d.cls === "abnormal" ? "#fb7185" : d.cls === "dividing" ? "#22d3ee" : "#34d399";
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
      grad.addColorStop(0, hexA(tone, 0.55));
      grad.addColorStop(1, hexA(tone, 0));
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, rad, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [frame, showHeatmap]);

  return (
    <div ref={wrapRef} className="panel relative h-full overflow-hidden">
      {/* Panel header */}
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <span className="panel-title">Optical Chamber · Live Feed</span>
          <span className="chip border border-bio-cyan/30 bg-bio-cyan/10 text-bio-cyan">
            <Crosshair className="h-3 w-3" /> FOCUS LOCKED
          </span>
        </div>
        <button
          onClick={onCycleMode}
          title="Cycle display mode (or press M)"
          className="flex items-center gap-1.5 rounded-md border border-bio-cyan/50 bg-bio-cyan/15 px-2 py-1 text-[10px] font-semibold tracking-wider text-bio-cyan shadow-glow-cyan transition-colors hover:bg-bio-cyan/25"
        >
          <Layers className="h-3.5 w-3.5" />
          {modeLabel}
        </button>
      </div>

      <div className="relative h-[calc(100%-44px)] w-full">
        {/* Background camera feed (simulated) */}
        <canvas ref={bgRef} className="absolute inset-0 h-full w-full" />
        {/* Stained cells layer */}
        <canvas ref={fgRef} className="absolute inset-0 h-full w-full mix-blend-screen" />
        {/* Heatmap overlay */}
        <canvas
          ref={heatRef}
          className="absolute inset-0 h-full w-full opacity-80 mix-blend-screen"
          style={{ filter: "blur(8px)" }}
        />

        {/* Vertical scan line */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute inset-x-0 h-[2px] animate-scan bg-gradient-to-r from-transparent via-bio-cyan to-transparent opacity-70 shadow-glow-cyan" />
        </div>

        {/* Corner brackets */}
        <CornerBrackets />

        {/* Bounding boxes */}
        {showBoxes && frame && (
          <div className="pointer-events-none absolute inset-0">
            {frame.detections.map((d) => (
              <BBox key={d.id} d={d} />
            ))}
          </div>
        )}

        {/* HUD bottom-left */}
        <div className="pointer-events-none absolute bottom-3 left-3 flex flex-col gap-1">
          <div className="mono flex items-center gap-2 rounded-md border border-bio-border/70 bg-bio-bg/70 px-2 py-1 text-[10.5px] tracking-[0.18em] text-slate-300">
            <span className="text-bio-cyan">FRAME</span>
            <span>{frame?.frameId.toString().padStart(6, "0")}</span>
          </div>
          <div className="mono flex items-center gap-2 rounded-md border border-bio-border/70 bg-bio-bg/70 px-2 py-1 text-[10.5px] tracking-[0.18em] text-slate-300">
            <span className="text-bio-cyan">SCALE</span>
            <span>40× · 200μm</span>
          </div>
        </div>

        {/* HUD bottom-right */}
        <div className="pointer-events-none absolute bottom-3 right-3">
          <div className="mono flex items-center gap-2 rounded-md border border-bio-border/70 bg-bio-bg/70 px-2 py-1 text-[10.5px] tracking-[0.18em] text-slate-300">
            <span className="text-bio-cyan">REC</span>
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-bio-rose opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-bio-rose" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function BBox({ d }: { d: Detection }) {
  const color = CLASS_COLOR[d.cls];
  return (
    <motion.div
      layout
      initial={false}
      animate={{
        left: `${d.bbox.x * 100}%`,
        top: `${d.bbox.y * 100}%`,
        width: `${d.bbox.w * 100}%`,
        height: `${d.bbox.h * 100}%`,
      }}
      transition={{ type: "spring", stiffness: 140, damping: 22, mass: 0.6 }}
      className="absolute"
    >
      <div
        className="relative h-full w-full rounded-sm border-[1.5px]"
        style={{
          borderColor: color,
          boxShadow: `0 0 12px ${color}66, inset 0 0 8px ${color}22`,
        }}
      >
        {/* Corner ticks */}
        {[
          "top-0 left-0",
          "top-0 right-0",
          "bottom-0 left-0",
          "bottom-0 right-0",
        ].map((pos, i) => (
          <span
            key={i}
            className={`absolute ${pos} h-2 w-2 border-[1.5px]`}
            style={{
              borderColor: color,
              borderTopWidth: pos.includes("top") ? 1.5 : 0,
              borderBottomWidth: pos.includes("bottom") ? 1.5 : 0,
              borderLeftWidth: pos.includes("left") ? 1.5 : 0,
              borderRightWidth: pos.includes("right") ? 1.5 : 0,
            }}
          />
        ))}

        {/* Label */}
        <div
          className="mono absolute -top-5 left-0 whitespace-nowrap rounded-sm px-1.5 py-[1px] text-[9.5px] font-semibold tracking-wider"
          style={{
            background: hexA(color, 0.95),
            color: "#03070d",
          }}
        >
          {CLASS_LABEL[d.cls]} · {(d.confidence * 100).toFixed(0)}%
        </div>
      </div>
    </motion.div>
  );
}

function CornerBrackets() {
  return (
    <div className="pointer-events-none absolute inset-3">
      {(["tl", "tr", "bl", "br"] as const).map((p) => (
        <span
          key={p}
          className="absolute h-4 w-4 border-bio-cyan/50"
          style={{
            top: p.startsWith("t") ? 0 : "auto",
            bottom: p.startsWith("b") ? 0 : "auto",
            left: p.endsWith("l") ? 0 : "auto",
            right: p.endsWith("r") ? 0 : "auto",
            borderTopWidth: p.startsWith("t") ? 2 : 0,
            borderBottomWidth: p.startsWith("b") ? 2 : 0,
            borderLeftWidth: p.endsWith("l") ? 2 : 0,
            borderRightWidth: p.endsWith("r") ? 2 : 0,
          }}
        />
      ))}
    </div>
  );
}


function hexA(hex: string, a: number) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}
