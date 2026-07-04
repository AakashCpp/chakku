import { useEffect, useRef } from "react";

/**
 * Premium Custom Cursor with a short-lived sparkle trail (~150ms).
 *
 * — Lead cursor: crisp dot (instant) + trailing moonlight ring (eased).
 * — Sparkle trail: tiny glowing motes rendered on a canvas, each with a real
 *   timestamp so it fades and dies reliably. Varying size, hue and brightness.
 */

type Sparkle = {
  x: number;
  y: number;
  born: number;
  size: number;
  hue: number;
  life: number; // ms
};

export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const canvas = canvasRef.current;
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!canvas || !dot || !ring) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const sparkles: Sparkle[] = [];
    const pos = { x: -100, y: -100, tx: -100, ty: -100 };
    let lastX = -100;
    let lastY = -100;
    let visible = false;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      pos.tx = e.clientX;
      pos.ty = e.clientY;
      // instant dot
      dot.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      if (!visible) {
        visible = true;
        dot.style.opacity = "1";
        ring.style.opacity = "1";
      }
      // spawn sparkles based on movement distance
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      if (dx * dx + dy * dy > 26) {
        sparkles.push({
          x: e.clientX + (Math.random() - 0.5) * 8,
          y: e.clientY + (Math.random() - 0.5) * 8,
          born: performance.now(),
          size: 1 + Math.random() * 2.2,
          hue: 28 + Math.random() * 34, // warm gold → soft peach
          life: 140 + Math.random() * 80,
        });
        lastX = e.clientX;
        lastY = e.clientY;
      }
    };

    const onLeave = () => {
      visible = false;
      dot.style.opacity = "0";
      ring.style.opacity = "0";
    };
    const onDown = () => ring.classList.add("scale-75");
    const onUp = () => ring.classList.remove("scale-75");

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    document.addEventListener("mouseleave", onLeave);

    const loop = () => {
      // ease ring toward target
      pos.x += (pos.tx - pos.x) * 0.2;
      pos.y += (pos.ty - pos.y) * 0.2;
      ring.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;

      const now = performance.now();
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      for (let i = sparkles.length - 1; i >= 0; i--) {
        const s = sparkles[i];
        const age = now - s.born;
        if (age >= s.life) {
          sparkles.splice(i, 1);
          continue;
        }
        const t = 1 - age / s.life; // 1 → 0
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * (0.6 + t * 0.6), 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${s.hue}, 85%, 78%, ${t})`;
        ctx.shadowColor = `hsla(${s.hue}, 85%, 82%, ${t})`;
        ctx.shadowBlur = 8 * t;
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <>
      {/* Sparkle trail canvas */}
      <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-[98]" />

      {/* Moonlight ring */}
      <div
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0 z-[99] -ml-5 -mt-5 h-10 w-10 rounded-full border border-[color:var(--color-ivory)]/30 opacity-0 transition-[transform,opacity] duration-150 ease-out"
        style={{ boxShadow: "0 0 20px 2px rgba(217,164,138,0.18)" }}
      />

      {/* Center dot */}
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[100] -ml-[3px] -mt-[3px] h-1.5 w-1.5 rounded-full bg-[color:var(--color-ivory)] opacity-0"
        style={{ boxShadow: "0 0 10px 2px rgba(242,237,228,0.8)" }}
      />
    </>
  );
}
