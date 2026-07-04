import { useEffect, useMemo, useRef } from "react";
import { gsap } from "gsap";

function rand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

type Flower = {
  id: string;
  cx: number;
  cy: number;
  radius: number;
  petalCount: number;
  layers: number;
  color: string;
  color2: string;
  coreColor: string;
  shape: "rose" | "peony" | "dahlia" | "anemone" | "tulip" | "poppy";
  bloomDelay: number;
  rotation: number;
};

function genPath(shape: "rose" | "peony" | "dahlia" | "anemone" | "tulip" | "poppy", angle: number, radius: number, width: number) {
  const rad = (angle * Math.PI) / 180;
  const tipX = Math.cos(rad) * radius;
  const tipY = Math.sin(rad) * radius;
  const perpX = -Math.sin(rad);
  const perpY = Math.cos(rad);
  const c1x = Math.cos(rad) * radius * 0.35 + perpX * width;
  const c1y = Math.sin(rad) * radius * 0.35 + perpY * width;
  const c2x = Math.cos(rad) * radius * 0.35 - perpX * width;
  const c2y = Math.sin(rad) * radius * 0.35 - perpY * width;

  if (shape === "peony" || shape === "dahlia") {
    return `M 0 0 Q ${c1x} ${c1y} ${tipX} ${tipY} Q ${c2x} ${c2y} 0 0 Z`;
  }
  if (shape === "poppy" || shape === "anemone") {
    const t1x = tipX + perpX * width * 0.35;
    const t1y = tipY + perpY * width * 0.35;
    const t2x = tipX - perpX * width * 0.35;
    const t2y = tipY - perpY * width * 0.35;
    return `M 0 0 C ${c1x} ${c1y} ${t1x} ${t1y} ${tipX} ${tipY} C ${t2x} ${t2y} ${c2x} ${c2y} 0 0 Z`;
  }
  return `M 0 0 C ${c1x} ${c1y} ${tipX} ${tipY} ${tipX} ${tipY} C ${tipX} ${tipY} ${c2x} ${c2y} 0 0 Z`;
}

function generateFlowers(seed = 88): Flower[] {
  const r = rand(seed);
  const flowers: Flower[] = [];
  const PALETTES = [
    { outer: "#ecc5ca", inner: "#d48d98", core: "#eed18c" },
    { outer: "#f5ebd8", inner: "#deb88e", core: "#c28c58" },
    { outer: "#dbabb0", inner: "#b36873", core: "#6e2e3a" },
    { outer: "#f0dfca", inner: "#d1a880", core: "#8c5a38" },
    { outer: "#e5ccd0", inner: "#bd7a84", core: "#eed18c" },
    { outer: "#e89a94", inner: "#c4625d", core: "#3b2228" },
    { outer: "#f2e4d8", inner: "#dbbda5", core: "#332630" },
    { outer: "#ded8ea", inner: "#ad9ec7", core: "#f7ea9c" },
  ];
  const SHAPES: Flower["shape"][] = ["rose", "peony", "dahlia", "anemone", "tulip", "poppy"];

  // Hand-placed with deterministic jitter: visually random, but the center text stays clear.
  const positions = [
    { cx: 146, cy: 146, radius: 31 },
    { cx: 368, cy: 92, radius: 24 },
    { cx: 706, cy: 118, radius: 34 },
    { cx: 1008, cy: 112, radius: 26 },
    { cx: 242, cy: 238, radius: 38 },
    { cx: 520, cy: 170, radius: 28 },
    { cx: 908, cy: 232, radius: 35 },
    { cx: 84, cy: 342, radius: 23 },
    { cx: 265, cy: 460, radius: 30 },
    { cx: 1036, cy: 354, radius: 31 },
    { cx: 944, cy: 515, radius: 24 },
    { cx: 118, cy: 548, radius: 29 },
    { cx: 290, cy: 680, radius: 23 },
    { cx: 468, cy: 720, radius: 34 },
    { cx: 728, cy: 690, radius: 28 },
    { cx: 984, cy: 694, radius: 32 },
    { cx: 58, cy: 710, radius: 20 },
    { cx: 1110, cy: 602, radius: 22 },
    { cx: 1088, cy: 214, radius: 20 },
    { cx: 620, cy: 62, radius: 20 },
    { cx: 180, cy: 690, radius: 18 },
    { cx: 850, cy: 720, radius: 19 },
  ];

  positions.forEach((pos, i) => {
    const pal = PALETTES[Math.floor(r() * PALETTES.length)];
    const shape = SHAPES[Math.floor(r() * SHAPES.length)];
    const petalCount = 6 + Math.floor(r() * 8);
    const layers = 2 + Math.floor(r() * 2);

    flowers.push({
      id: `flower-${i}`,
      cx: pos.cx,
      cy: pos.cy,
      radius: pos.radius + (r() - 0.5) * 6,
      petalCount,
      layers,
      color: pal.outer,
      color2: pal.inner,
      coreColor: pal.core,
      shape,
      bloomDelay: 0.8 + i * 0.13 + r() * 0.35,
      rotation: r() * 360,
    });
  });

  return flowers;
}

export default function FloralFrame({ onComplete }: { onComplete?: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);

  const flowers = useMemo(() => generateFlowers(88), []);
  const leaves = useMemo(() => {
    const r = rand(55);
    return Array.from({ length: 8 }).map((_, i) => ({
      id: `leaf-${i}`,
      x: 120 + r() * 980,
      y: 140 + r() * 520,
      angle: r() * 360,
      size: 14 + r() * 12,
      speed: 0.3 + r() * 0.5,
    }));
  }, []);

  const cursorPos = useRef({ x: -100, y: -100 });
  const physicsState = useRef(new Map<string, { dx: number; dy: number; rot: number }>());

  // GSAP timeline effect
  useEffect(() => {
    const el = containerRef.current;
    if (!el) {
      return () => {};
    }

    flowers.forEach((f) => {
      physicsState.current.set(f.id, { dx: 0, dy: 0, rot: 0 });
    });

    const tl = gsap.timeline({ delay: 0.4 });

    const titleChars = titleRef.current?.querySelectorAll(".char") ?? [];
    gsap.set(titleChars, { yPercent: 120, opacity: 0, rotate: 8, filter: "blur(10px)" });
    tl.to(titleChars, {
      yPercent: 0, opacity: 1, rotate: 0, filter: "blur(0px)",
      duration: 2.0, ease: "expo.out", stagger: 0.04,
    }, 0.2);

    flowers.forEach((f) => {
      const spawnRadius = f.radius * 2.2;

      for (let i = 0; i < f.petalCount; i++) {
        const angle = (i / f.petalCount) * 360 + f.rotation + (Math.random() - 0.5) * 30;
        const rad = (angle * Math.PI) / 180;
        const startX = f.cx + Math.cos(rad) * spawnRadius;
        const startY = f.cy + Math.sin(rad) * spawnRadius;

        const petalEl = el.querySelector(`[data-petal-id="${f.id}-${i}"]`) as SVGGElement | null;
        if (!petalEl) continue;

        gsap.set(petalEl, {
          x: startX,
          y: startY,
          scale: 0,
          rotation: angle + 180,
          opacity: 0,
        });

        const targetX = f.cx + Math.cos(rad) * f.radius * (0.9 + Math.sin(i * 2) * 0.1);
        const targetY = f.cy + Math.sin(rad) * f.radius * (0.9 + Math.cos(i * 3) * 0.1);

        tl.to(petalEl, {
          x: targetX,
          y: targetY,
          scale: 1,
          rotation: angle,
          opacity: 1,
          duration: 1.8 + Math.random() * 0.6,
          ease: "elastic.out(1, 0.4)",
          delay: f.bloomDelay + i * 0.03,
        }, f.bloomDelay);
      }

      const coreEl = el.querySelector(`[data-core-id="${f.id}"]`);
      if (coreEl) {
        tl.to(coreEl, {
          scale: 1,
          opacity: 1,
          duration: 0.8,
          ease: "back.out(1.8)",
        }, f.bloomDelay + f.petalCount * 0.03 + 0.4);
      }
    });

    // Call onComplete after bloom completes (~5s)
    const onCompleteCallback = () => {
      if (onComplete) onComplete();
    };
    tl.eventCallback("onComplete", onCompleteCallback);

    return () => tl.kill();
  }, [flowers, onComplete]);

  // Cursor proximity physics
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      cursorPos.current = {
        x: ((e.clientX - rect.left) / rect.width) * 1200,
        y: ((e.clientY - rect.top) / rect.height) * 800,
      };
    };
    window.addEventListener("pointermove", handleMove);

    const animate = () => {
      const { x, y } = cursorPos.current;
      const radius = 220;

      flowers.forEach((f) => {
        const dx = f.cx - x;
        const dy = f.cy - y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const state = physicsState.current.get(f.id);
        if (!state) return;

        if (dist < radius) {
          const factor = Math.pow(1 - dist / radius, 2.5);
          state.dx = Math.cos(Math.atan2(dy, dx)) * factor * 25;
          state.dy = Math.sin(Math.atan2(dy, dx)) * factor * 25;
          state.rot = factor * 18;
        } else {
          state.dx *= 0.88;
          state.dy *= 0.88;
          state.rot *= 0.88;
        }

        const gEl = el.querySelector(`[data-flower-id="${f.id}"]`);
        if (gEl) {
          (gEl as SVGGElement).style.transform = `translate3d(${f.cx + state.dx}px, ${f.cy + state.dy}px, 0) rotate(${state.rot}deg)`;
        }
      });

      raf = requestAnimationFrame(animate);
    };
    let raf = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("pointermove", handleMove);
      cancelAnimationFrame(raf);
    };
  }, [flowers]);

  return (
    <div ref={containerRef} className="relative h-full w-full flex items-center justify-center">
      {/* CENTRAL TYPOGRAPHY — HIGHEST Z-INDEX, GUARANTEED LEGIBILITY */}
      <div className="absolute inset-0 z-50 pointer-events-none flex flex-col items-center justify-center px-6 text-center">
        <div
          ref={titleRef}
          className="font-serif text-[color:var(--color-ivory)] drop-shadow-[0_4px_28px_rgba(0,0,0,0.95)]"
          style={{ fontSize: "clamp(2.25rem, 5.4vw, 4.8rem)", lineHeight: 1.08, letterSpacing: "-0.025em" }}
        >
          {[
            "Happy Birthday",
            "Chakku",
            "Mere Jigar Ke Gamle ❤️🌸",
          ].map((line, lineIndex) => (
            <div key={line} className={lineIndex === 0 ? "" : "mt-1"}>
              {line.split(" ").map((word, wordIndex) => (
                <span key={`${line}-${wordIndex}`} className="mr-[0.24em] inline-block overflow-hidden pb-[0.12em] align-baseline">
                  {[...word].map((char, charIndex) => (
                    <span key={`${char}-${charIndex}`} className="char inline-block">
                      {char}
                    </span>
                  ))}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* FLORAL FRAME SVG — Z-10 */}
      <svg viewBox="0 0 1200 800" className="absolute inset-0 h-full w-full z-10 pointer-events-none">
        {flowers.map((f) => (
          <g key={f.id} data-flower-id={f.id}>
            {Array.from({ length: f.petalCount }).map((_, i) => {
              const angle = (i / f.petalCount) * 360 + f.rotation + (Math.random() - 0.5) * 30;
              const layer = Math.floor(i / Math.ceil(f.petalCount / f.layers));
              return (
                <g
                  key={`p-${i}`}
                  data-petal-id={`${f.id}-${i}`}
                  data-layer-idx={layer}
                  transform={`translate(${f.cx}, ${f.cy}) rotate(${angle})`}
                >
                  <path
                    d={genPath(f.shape, 0, f.radius * (0.85 + (Math.random() * 0.3 - 0.15)), f.radius * 0.45)}
                    fill={layer === 0 ? f.color : f.color2}
                    stroke={f.color2}
                    strokeWidth="0.5"
                    opacity="0.92"
                  />
                </g>
              );
            })}

            <circle
              data-core-id={f.id}
              cx={f.cx}
              cy={f.cy}
              r={f.radius * 0.22}
              fill={f.coreColor}
              opacity="0"
            />
          </g>
        ))}

        {/* Floating Leaves */}
        {leaves.map((l) => (
          <g
            key={l.id}
            transform={`translate(${l.x}, ${l.y}) rotate(${l.angle})`}
            style={{ animation: `float ${6 + l.speed * 4}s linear infinite alternate` }}
          >
            <path
              d={`M 0 0 Q ${l.size * 0.5} ${-l.size * 0.35} 0 ${-l.size} Q ${-l.size * 0.5} ${-l.size * 0.35} 0 0 Z`}
              fill="#e8dbc5"
              opacity="0.7"
            />
          </g>
        ))}
      </svg>

      <style>{`
        @keyframes float {
          0% { transform: translate(0, 0) rotate(var(--a, 0deg)); }
          100% { transform: translate(calc(var(--tx, 5px) * 1px), calc(var(--ty, 8px) * 1px)) rotate(calc(var(--a, 0deg) + 5deg)); }
        }
      `}</style>
    </div>
  );
}