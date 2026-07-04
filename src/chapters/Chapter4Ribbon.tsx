import { useEffect, useRef } from "react";
import { gsap } from "gsap";

/**
 * An infinite marquee of wishes. Two rows drift in opposite
 * directions at slightly different speeds — enough that the
 * eye keeps discovering new phrases without ever feeling loud.
 */

const WISHES_A = [
  "may your year be soft",
  "may your coffee always be warm",
  "may the world be gentle with you",
  "may you laugh until you cry, often",
  "may your dreams outgrow your fears",
  "may you never lose your wonder",
  "may every ordinary day feel a little magical",
];

const WISHES_B = [
  "keep being impossibly, stubbornly you",
  "the world is bigger than any room you're in",
  "your kindness is not weakness — it is power",
  "cry when you need to, dance when you can",
  "there is no one on earth i am prouder of",
  "carry me with you, i'll always be walking beside you",
];

function Row({
  items,
  direction = 1,
  speed = 90,
}: {
  items: string[];
  direction?: 1 | -1;
  speed?: number;
}) {
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const width = el.scrollWidth / 2;
    const duration = width / speed;
    const tween = gsap.to(el, {
      x: direction === 1 ? -width : width,
      duration,
      ease: "none",
      repeat: -1,
      modifiers: {
        x: (x) => {
          const v = parseFloat(x);
          return `${gsap.utils.wrap(direction === 1 ? -width : 0, direction === 1 ? 0 : width, v)}px`;
        },
      },
    });
    return () => {
      tween.kill();
    };
  }, [direction, speed]);

  const loop = [...items, ...items];

  return (
    <div className="relative overflow-hidden py-4">
      <div ref={track} className="flex whitespace-nowrap will-change-transform">
        {loop.map((w, i) => (
          <span key={i} className="mx-10 flex items-center gap-10 font-serif italic">
            <span
              className="text-[color:var(--color-ivory)]/85"
              style={{ fontSize: "clamp(1.6rem, 4.6vw, 4.4rem)" }}
            >
              {w}
            </span>
            <span
              className="text-[color:var(--color-rose)]/70"
              style={{ fontSize: "clamp(1.2rem, 3.4vw, 3rem)" }}
            >
              ✦
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Chapter4Ribbon() {
  return (
    <section className="relative z-[2] overflow-hidden py-40">
      <div className="mx-auto mb-16 max-w-[900px] px-6 text-center">
        <div className="mb-4 font-sans text-[10px] tracking-[0.5em] text-[color:var(--color-moon)]/60">
          IV  ·  A RIBBON OF WISHES
        </div>
        <h3 className="font-serif italic text-[color:var(--color-ivory)]" style={{ fontSize: "clamp(1.6rem, 3.4vw, 3rem)" }}>
          I couldn't fit everything I wish for you into one sentence, so I wrote a ribbon.
        </h3>
      </div>

      <div
        className="relative"
        style={{
          maskImage:
            "linear-gradient(90deg, transparent 0%, black 12%, black 88%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(90deg, transparent 0%, black 12%, black 88%, transparent 100%)",
        }}
      >
        <Row items={WISHES_A} direction={1} speed={70} />
        <div className="line-draw my-4" />
        <Row items={WISHES_B} direction={-1} speed={55} />
      </div>
    </section>
  );
}
