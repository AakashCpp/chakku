import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Chapter 3 — Interactive Memory Screen.
 *
 * A single premium frameless display (no laptop body / hardware).
 * Idle state shows an emotional quote over a dark vignette. On hover
 * the screen "powers on" (glow + reflection sweep), the quote fades,
 * and a video plays inside the display only. Playback position is
 * always preserved — pause on mouse-leave, resume on re-enter.
 */

const VIDEO_SRC = "VN20260705_032201.mp4";

export default function Chapter3Laptop() {
  const sectionRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  const quoteRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const sweepRef = useRef<HTMLDivElement>(null);

  const [active, setActive] = useState(false); // powered / playing state

  /* ── Entrance: fade the whole display in once, then keep it still ── */
  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(frameRef.current, {
        opacity: 0,
        y: 40,
        duration: 1.4,
        ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 65%" },
      });
      gsap.from(sectionRef.current!.querySelectorAll("[data-caption]"), {
        opacity: 0,
        y: 20,
        duration: 1.1,
        ease: "power3.out",
        stagger: 0.12,
        scrollTrigger: { trigger: sectionRef.current, start: "top 55%" },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  /* ── Subtle cursor parallax + glass reflection following the pointer ── */
  useEffect(() => {
    const frame = frameRef.current;
    const glare = glareRef.current;
    if (!frame || !glare) return;

    let raf = 0;
    const cur = { rx: 0, ry: 0, tx: 0, ty: 0 };

    const onMove = (e: MouseEvent) => {
      const r = frame.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width; // 0..1
      const py = (e.clientY - r.top) / r.height;
      cur.ty = (px - 0.5) * 6; // rotateY (deg) — very subtle
      cur.tx = -(py - 0.5) * 5; // rotateX
      glare.style.background = `radial-gradient(600px circle at ${px * 100}% ${py * 100}%, rgba(255,255,255,0.10), transparent 55%)`;
    };
    const onLeave = () => {
      cur.tx = 0;
      cur.ty = 0;
      glare.style.background = "transparent";
    };

    const loop = () => {
      cur.rx += (cur.tx - cur.rx) * 0.08;
      cur.ry += (cur.ty - cur.ry) * 0.08;
      frame.style.transform = `perspective(1600px) rotateX(${cur.rx}deg) rotateY(${cur.ry}deg)`;
      raf = requestAnimationFrame(loop);
    };
    loop();

    frame.addEventListener("mousemove", onMove);
    frame.addEventListener("mouseleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      frame.removeEventListener("mousemove", onMove);
      frame.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  /* ── Power-on transition + video play/pause (position preserved) ── */
  const handleEnter = () => {
    setActive(true);
    const v = videoRef.current;

    // Reflection sweep
    if (sweepRef.current) {
      gsap.fromTo(
        sweepRef.current,
        { xPercent: -120, opacity: 0.9 },
        { xPercent: 120, opacity: 0, duration: 0.9, ease: "power2.inOut" },
      );
    }
    // Fade the quote away
    if (quoteRef.current) {
      gsap.to(quoteRef.current, {
        opacity: 0,
        duration: 0.5,
        ease: "power2.out",
      });
    }
    // Brief brightness pulse then play (resume from saved timestamp)
    if (v) {
      gsap.delayedCall(0.35, () => {
        v.play().catch(() => {});
      });
    }
  };

  const handleLeave = () => {
    setActive(false);
    const v = videoRef.current;
    if (v) v.pause(); // keeps currentTime — never resets
    if (quoteRef.current) {
      gsap.to(quoteRef.current, {
        opacity: 1,
        duration: 0.6,
        delay: 0.15,
        ease: "power2.out",
      });
    }
  };

  return (
    <section
      ref={sectionRef}
      className="relative z-[2] flex min-h-screen w-full flex-col items-center justify-center px-6 py-28"
    >
      {/* Caption above */}
      <div className="mb-10 text-center">
        <span
          data-caption
          className="font-sans text-[11px] uppercase tracking-[0.55em] text-[color:var(--color-rose)]/70"
        >
          Chapter Three
        </span>
        <h2
          data-caption
          className="mt-5 font-serif text-[color:var(--color-ivory)]"
          style={{ fontSize: "clamp(1.5rem, 3vw, 2.6rem)", lineHeight: 1.15 }}
        >
          A window into the moments{" "}
          <em className="italic text-[color:var(--color-moon)]">we lived.</em>
        </h2>
      </div>

      {/* ── The Display ── */}
      <div style={{ perspective: 1600 }} className="w-full max-w-4xl">
        <div
          ref={frameRef}
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
          onClick={active ? handleLeave : handleEnter}
          className="group relative aspect-video w-full rounded-[22px] p-[3px] transition-shadow duration-500 will-change-transform cursor-pointer"
          style={{
            background:
              "linear-gradient(155deg, #2a2c33 0%, #14151a 40%, #0a0b0f 100%)",
            boxShadow: active
              ? "0 0 0 1px rgba(255,255,255,0.06), 0 50px 120px -30px rgba(0,0,0,0.9), 0 0 80px -10px rgba(217,164,138,0.35)"
              : "0 0 0 1px rgba(255,255,255,0.05), 0 50px 120px -40px rgba(0,0,0,0.85), 0 0 60px -20px rgba(168,162,196,0.18)",
          }}
        >
          {/* Metallic inner bezel */}
          <div className="relative h-full w-full overflow-hidden rounded-[19px] bg-black">
            {/* Video */}
            <video
              ref={videoRef}
              src={VIDEO_SRC}
              playsInline
              muted
              loop
              preload="auto"
              className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700"
              style={{ opacity: active ? 1 : 0 }}
            />

            {/* Idle dark canvas: vignette + noise + ambient edge glow */}
            <div
              className="absolute inset-0 transition-opacity duration-700"
              style={{ opacity: active ? 0 : 1 }}
            >
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(ellipse at 50% 45%, #16181f 0%, #0a0b0f 55%, #050609 100%)",
                }}
              />
              {/* Ambient edge glow */}
              <div
                className="absolute inset-0"
                style={{
                  boxShadow:
                    "inset 0 0 90px 10px rgba(168,162,196,0.10), inset 0 0 40px rgba(217,164,138,0.08)",
                }}
              />
              {/* Animated subtle noise */}
              <div className="screen-noise absolute inset-0 opacity-[0.05]" />

              {/* Emotional quote */}
              <div
                ref={quoteRef}
                className="absolute inset-0 flex flex-col items-center justify-center px-10 text-center"
              >
                <p
                  className="font-serif italic text-[color:var(--color-ivory)]/90"
                  style={{
                    fontSize: "clamp(1.05rem, 1.9vw, 1.9rem)",
                    lineHeight: 1.5,
                  }}
                >
                  “Some memories were never meant
                  <br className="hidden sm:block" /> to be kept in silence.”
                </p>
                <div className="mt-6 flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 backdrop-blur-sm transition-colors group-hover:border-[color:var(--color-rose)]/40 group-hover:bg-[color:var(--color-rose)]/10">
                  <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--color-rose)] animate-pulse" />
                  <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-[color:var(--color-rose)]/80">
                    Hover or Click to Play Memory
                  </span>
                </div>
              </div>
            </div>

            {/* Reflection sweep on power-on */}
            <div
              ref={sweepRef}
              className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 opacity-0"
              style={{
                background:
                  "linear-gradient(105deg, transparent, rgba(255,255,255,0.22), transparent)",
              }}
            />

            {/* Cursor-following glass reflection */}
            <div
              ref={glareRef}
              className="pointer-events-none absolute inset-0"
            />

            {/* Static top glass sheen */}
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-1/3"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.06), transparent)",
              }}
            />
          </div>
        </div>
      </div>

      {/* Caption below */}
      <p
        data-caption
        className="mt-10 max-w-md text-center font-sans text-[13px] leading-relaxed text-[color:var(--color-ivory)]/40"
      >
        Move your cursor onto the screen — it will pick up exactly where you
        left it.
      </p>

      <style>{`
        @keyframes screenNoise {
          0%, 100% { transform: translate(0, 0); }
          20% { transform: translate(-2%, 1%); }
          40% { transform: translate(1%, -2%); }
          60% { transform: translate(-1%, 2%); }
          80% { transform: translate(2%, -1%); }
        }
        .screen-noise {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 180px 180px;
          animation: screenNoise 1.2s steps(4) infinite;
        }
      `}</style>
    </section>
  );
}
