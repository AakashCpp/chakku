import { useEffect, useRef } from "react";

/**
 * A canvas atmosphere: slow-drifting dust motes and a handful of
 * fireflies, plus a very soft aurora painted with gradients.
 * Extremely lightweight — designed to feel like the background
 * is *breathing* rather than moving.
 */
export default function Atmosphere() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = canvas.current!;
    const ctx = c.getContext("2d")!;
    let w = (c.width = window.innerWidth * devicePixelRatio);
    let h = (c.height = window.innerHeight * devicePixelRatio);
    let mx = w / 2;
    let my = h / 2;

    const DUST = Array.from({ length: 90 }).map(() => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.4 + 0.2,
      vx: (Math.random() - 0.5) * 0.15,
      vy: -Math.random() * 0.15 - 0.02,
      a: Math.random() * 0.5 + 0.15,
      p: Math.random() * Math.PI * 2,
    }));

    const FIRE = Array.from({ length: 14 }).map(() => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.6 + 1.2,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      p: Math.random() * Math.PI * 2,
      hue: 25 + Math.random() * 25,
    }));

    const onResize = () => {
      w = c.width = window.innerWidth * devicePixelRatio;
      h = c.height = window.innerHeight * devicePixelRatio;
    };
    const onMove = (e: MouseEvent) => {
      mx = e.clientX * devicePixelRatio;
      my = e.clientY * devicePixelRatio;
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", onMove);

    let raf = 0;
    let t = 0;

    const loop = () => {
      t += 0.006;
      ctx.clearRect(0, 0, w, h);

      // Aurora — extremely subtle
      const g1 = ctx.createRadialGradient(
        w * (0.3 + Math.sin(t * 0.4) * 0.05),
        h * (0.35 + Math.cos(t * 0.3) * 0.05),
        0,
        w * 0.5,
        h * 0.5,
        Math.max(w, h) * 0.6
      );
      g1.addColorStop(0, "rgba(60, 55, 90, 0.22)");
      g1.addColorStop(0.5, "rgba(30, 30, 50, 0.06)");
      g1.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, w, h);

      const g2 = ctx.createRadialGradient(
        w * (0.75 + Math.cos(t * 0.25) * 0.05),
        h * (0.7 + Math.sin(t * 0.35) * 0.05),
        0,
        w * 0.75,
        h * 0.7,
        Math.max(w, h) * 0.55
      );
      g2.addColorStop(0, "rgba(120, 70, 60, 0.14)");
      g2.addColorStop(0.5, "rgba(60, 40, 40, 0.05)");
      g2.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, w, h);

      // Dust
      for (const d of DUST) {
        d.x += d.vx;
        d.y += d.vy;
        d.p += 0.02;
        if (d.y < -10) {
          d.y = h + 10;
          d.x = Math.random() * w;
        }
        if (d.x < -10) d.x = w + 10;
        if (d.x > w + 10) d.x = -10;
        const flick = (Math.sin(d.p) + 1) * 0.5;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(242, 237, 228, ${d.a * flick})`;
        ctx.fill();
      }

      // Fireflies (with soft glow + mouse repulsion)
      for (const f of FIRE) {
        const dx = f.x - mx;
        const dy = f.y - my;
        const dist2 = dx * dx + dy * dy;
        const rep = Math.max(0, 1 - dist2 / (250 * 250 * devicePixelRatio * devicePixelRatio));
        f.vx += (dx / (Math.sqrt(dist2) + 0.1)) * rep * 0.4;
        f.vy += (dy / (Math.sqrt(dist2) + 0.1)) * rep * 0.4;
        f.vx *= 0.96;
        f.vy *= 0.96;
        f.vx += (Math.random() - 0.5) * 0.06;
        f.vy += (Math.random() - 0.5) * 0.06;
        f.x += f.vx;
        f.y += f.vy;
        f.p += 0.03;
        if (f.x < 0) f.x = w;
        if (f.x > w) f.x = 0;
        if (f.y < 0) f.y = h;
        if (f.y > h) f.y = 0;
        const flick = 0.5 + Math.sin(f.p) * 0.4;
        const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r * 22);
        g.addColorStop(0, `hsla(${f.hue}, 80%, 78%, ${0.55 * flick})`);
        g.addColorStop(0.4, `hsla(${f.hue}, 60%, 60%, ${0.08 * flick})`);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r * 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${f.hue}, 90%, 90%, ${0.9 * flick})`;
        ctx.fill();
      }

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <canvas
      ref={canvas}
      className="pointer-events-none fixed inset-0 z-[1] h-screen w-screen"
      style={{ mixBlendMode: "screen" }}
    />
  );
}
