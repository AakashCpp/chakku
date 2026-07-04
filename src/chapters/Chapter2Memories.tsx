import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* ─── Memory Data ─────────────────────────────────────────────── */

type Memory = {
  image: string;
  index: string;
  tone: string;
  title: string;
  body: string;
  quote?: string;
};

const MEMORIES: Memory[] = [
  {
    image: "public/IMG_20221203_141950852_HDR.jpg.jpeg",
    index: "01",
    tone: "THE BEGINNING",
    title: "When we first met in college…",
    body: "We didn’t know each other from birth. We started as random college friends, just another set of faces in a new place. I never thought this would turn into something so meaningful. But slowly, without even realizing it, we became something more — something closer than just friends.",
    quote:
      "Sometimes the most important people don’t enter your life early… they just enter at the right time.",
  },
  {
    image: "public/IMG_20260411_175729.jpg.jpeg",
    index: "02",
    tone: "THE FRIENDSHIP DAYS",
    title: "Before anything else, we were friends.",
    body: "We laughed over random things, survived boring lectures, shared stupid stories, and created our own little college world. Before becoming anything like brother and sister, we became really good friends — the kind who just get each other without trying too hard.",
  },
  {
    image: "public/IMG_20260613_171700.jpg.jpeg",
    index: "03",
    tone: "THE CONNECTION",
    title: "Somewhere along the way, it changed.",
    body: "We saw each other in different moments — happiness, stress, confusion, achievements, failures, and everything in between. And in all of that, something naturally built between us. Not forced. Not planned. Just real. And that’s how we became like brother and sister.",
    quote: "Not by blood, but by bond.",
  },
  {
    image: "public/WhatsApp Image 2026-07-05 at 02.35.00.jpeg",
    index: "04",
    tone: "THE PROMISE",
    title: "A bond that won’t fade with distance.",
    body: "Even if college ends and life takes us in different directions, this bond won’t change. We might not always be physically around each other, but you’ll always have someone who cares, supports, and stands with you. You’re not just a friend anymore — you’re my sister in every way that matters.",
  },
];

/* ─── Chapter Opener ──────────────────────────────────────────── */

function Opener() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      gsap.from(ref.current!.querySelectorAll("[data-reveal]"), {
        opacity: 0,
        y: 24,
        duration: 1.2,
        ease: "power3.out",
        stagger: 0.14,
        scrollTrigger: { trigger: ref.current, start: "top 72%" },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={ref}
      className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-6 text-center"
    >
      <span
        data-reveal
        className="font-sans text-[11px] uppercase tracking-[0.55em] text-[color:var(--color-rose)]/70"
      ></span>
      <h2
        data-reveal
        className="mt-8 font-serif text-[color:var(--color-ivory)]"
        style={{ fontSize: "clamp(2rem, 4.4vw, 3.8rem)", lineHeight: 1.12 }}
      >
        Some things we keep
        <br />
        only in{" "}
        <em className="italic text-[color:var(--color-moon)]">photographs.</em>
      </h2>
      <p
        data-reveal
        className="mt-7 max-w-md font-sans text-[15px] leading-relaxed text-[color:var(--color-ivory)]/45"
      >
        The rest, we carry — quietly, always, everywhere.
      </p>
      <div
        data-reveal
        className="mt-12 h-14 w-px bg-gradient-to-b from-[color:var(--color-ivory)]/40 to-transparent"
      />
    </div>
  );
}

/* ─── Memory Section ──────────────────────────────────────────── */

function MemorySection({
  memory,
  imageLeft,
}: {
  memory: Memory;
  imageLeft: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      const img = ref.current!.querySelector("[data-img]");
      const items = ref.current!.querySelectorAll("[data-text]");

      gsap.from(img, {
        opacity: 0,
        y: 40,
        duration: 1.3,
        ease: "power3.out",
        scrollTrigger: { trigger: ref.current, start: "top 68%" },
      });

      gsap.from(items, {
        opacity: 0,
        y: 22,
        duration: 1.1,
        ease: "power3.out",
        stagger: 0.12,
        scrollTrigger: { trigger: ref.current, start: "top 62%" },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={ref}
      className="mx-auto grid min-h-screen max-w-6xl grid-cols-1 items-center gap-10 px-6 py-24 md:grid-cols-12 md:gap-16 md:px-10"
    >
      {/* Image */}
      <figure
        data-img
        className={`relative md:col-span-6 ${
          imageLeft ? "md:order-1" : "md:order-2"
        }`}
      >
        <div className="relative overflow-hidden rounded-[14px] ring-1 ring-white/8 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.85)]">
          <img
            src={memory.image}
            alt={memory.tone}
            loading="lazy"
            className="aspect-[4/5] w-full object-cover"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
        </div>
        {/* Oversized index numeral */}
        <span
          className={`pointer-events-none absolute -top-10 font-serif text-[color:var(--color-ivory)]/[0.06] ${
            imageLeft ? "-left-4" : "-right-4"
          }`}
          style={{ fontSize: "clamp(6rem, 12vw, 11rem)", lineHeight: 1 }}
        >
          {memory.index}
        </span>
      </figure>

      {/* Text */}
      <div
        className={`md:col-span-6 ${
          imageLeft ? "md:order-2 md:pl-4" : "md:order-1 md:pr-4"
        }`}
      >
        <div
          data-text
          className="flex items-center gap-4 font-sans text-[11px] uppercase tracking-[0.42em] text-[color:var(--color-rose)]/75"
        >
          <span className="h-px w-8 bg-[color:var(--color-rose)]/40" />
          {memory.tone}
        </div>

        <h3
          data-text
          className="mt-6 font-serif text-[color:var(--color-ivory)]"
          style={{ fontSize: "clamp(1.8rem, 3.2vw, 2.9rem)", lineHeight: 1.16 }}
        >
          {memory.title}
        </h3>

        <p
          data-text
          className="mt-7 max-w-lg font-sans text-[color:var(--color-ivory)]/65"
          style={{
            fontSize: "clamp(0.95rem, 1.05vw, 1.1rem)",
            lineHeight: 1.9,
          }}
        >
          {memory.body}
        </p>

        {memory.quote && (
          <blockquote
            data-text
            className="mt-8 border-l border-[color:var(--color-rose)]/45 pl-5 font-serif text-[color:var(--color-moon)]/85 italic"
            style={{ fontSize: "clamp(1rem, 1.2vw, 1.25rem)", lineHeight: 1.6 }}
          >
            {memory.quote}
          </blockquote>
        )}
      </div>
    </div>
  );
}

/* ─── Chapter 2 Main ──────────────────────────────────────────── */

export default function Chapter2Memories() {
  return (
    <section className="relative z-[2]">
      <Opener />
      {MEMORIES.map((memory, i) => (
        <MemorySection
          key={memory.index}
          memory={memory}
          imageLeft={i % 2 === 0}
        />
      ))}
    </section>
  );
}
