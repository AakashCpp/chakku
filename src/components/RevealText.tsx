import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type Props = {
  text: string;
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
  delay?: number;
  stagger?: number;
  trigger?: boolean; // if true, wait for scroll into view
  y?: number;
  duration?: number;
};

/**
 * Letter-by-letter reveal. Every character enters with a
 * subtle rotation and blur — like breath condensing into a word.
 */
export default function RevealText({
  text,
  as: Tag = "h2",
  className = "",
  delay = 0,
  stagger = 0.028,
  trigger = true,
  y = 40,
  duration = 1.1,
}: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const chars = ref.current.querySelectorAll<HTMLElement>(".char");
    gsap.set(chars, { yPercent: 120, opacity: 0, rotate: 6, filter: "blur(8px)" });

    const play = () =>
      gsap.to(chars, {
        yPercent: 0,
        opacity: 1,
        rotate: 0,
        filter: "blur(0px)",
        duration,
        ease: "expo.out",
        stagger,
        delay,
        y,
      });

    let st: ScrollTrigger | null = null;
    if (trigger) {
      st = ScrollTrigger.create({
        trigger: ref.current,
        start: "top 82%",
        once: true,
        onEnter: () => play(),
      });
    } else {
      play();
    }
    return () => {
      st?.kill();
    };
  }, [delay, stagger, duration, y, trigger]);

  const words = text.split(" ");
  return (
    // @ts-expect-error dynamic tag
    <Tag ref={ref} className={className}>
      {words.map((w, wi) => (
        <span key={wi} className="inline-block overflow-hidden pb-[0.12em] pr-[0.28em] align-baseline">
          {[...w].map((c, i) => (
            <span key={i} className="char">
              {c}
            </span>
          ))}
        </span>
      ))}
    </Tag>
  );
}
