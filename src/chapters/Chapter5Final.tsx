import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import RevealText from "../components/RevealText";

gsap.registerPlugin(ScrollTrigger);

/**
 * Final chapter: split screen.
 * Left  — an elegant video message player.
 * Right — a luxury greeting card that opens on scroll or click.
 */

function VideoMessage() {
  const ref = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const upd = () => setProgress((v.currentTime / (v.duration || 1)) * 100);
    v.addEventListener("timeupdate", upd);
    return () => v.removeEventListener("timeupdate", upd);
  }, []);

  useEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(
      ref.current,
      { x: -60, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: 1.6,
        ease: "expo.out",
        scrollTrigger: { trigger: ref.current, start: "top 75%", once: true },
      },
    );
  }, []);

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  return (
    <div
      ref={ref}
      className="relative aspect-[4/5] w-full max-w-[520px] mx-auto"
    >
      <div className="absolute inset-0 rounded-[24px] bg-gradient-to-br from-[color:var(--color-ink-2)] to-black p-3 shadow-[0_50px_120px_-30px_rgba(0,0,0,0.7)] ring-1 ring-white/5">
        <div className="relative h-full w-full overflow-hidden rounded-[18px]">
          <video
            ref={videoRef}
            playsInline
            loop
            preload="auto"
            className="h-full w-full object-cover"
            src="VN20260705_035237.mp4"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

          {/* Play overlay */}
          <button
            onClick={toggle}
            className="group absolute inset-0 flex items-center justify-center"
            aria-label={playing ? "pause" : "play"}
          >
            <span
              className={`flex h-20 w-20 items-center justify-center rounded-full border border-white/50 bg-white/10 backdrop-blur-md transition-all duration-500 ${
                playing
                  ? "scale-75 opacity-0"
                  : "scale-100 opacity-100 group-hover:scale-110"
              }`}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M8 5v14l11-7z" fill="#fff" />
              </svg>
            </span>
          </button>

          {/* Progress */}
          <div className="absolute inset-x-6 bottom-6">
            <div className="mb-3 flex items-center justify-between font-sans text-[10px] tracking-[0.35em] text-white/70">
              <span>A MESSAGE, FOR YOU</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-[2px] w-full overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full bg-[color:var(--color-rose)] transition-[width] duration-150"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* subtle glow */}
      <div className="pointer-events-none absolute -inset-6 -z-10 rounded-[40px] bg-[radial-gradient(ellipse_at_center,rgba(217,164,138,0.15),transparent_70%)] blur-2xl" />
    </div>
  );
}

function Card() {
  const wrap = useRef<HTMLDivElement>(null);
  const cover = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!wrap.current) return;
    const st = ScrollTrigger.create({
      trigger: wrap.current,
      start: "top 55%",
      once: true,
      onEnter: () => setOpen(true),
    });
    return () => st.kill();
  }, []);

  useEffect(() => {
    if (!cover.current || !inner.current) return;
    if (open) {
      gsap.to(cover.current, {
        rotateY: -155,
        duration: 2.4,
        ease: "power3.inOut",
        transformOrigin: "left center",
      });
      gsap.fromTo(
        inner.current.querySelectorAll(".card-line"),
        { y: 30, opacity: 0, filter: "blur(8px)" },
        {
          y: 0,
          opacity: 1,
          filter: "blur(0)",
          duration: 1.6,
          ease: "expo.out",
          stagger: 0.15,
          delay: 1.4,
        },
      );
    }
  }, [open]);

  return (
    <div
      ref={wrap}
      className="relative mx-auto aspect-[4/5] w-full max-w-[520px]"
      style={{ perspective: "2000px" }}
    >
      {/* inner (base) */}
      <div
        ref={inner}
        className="paper absolute inset-0 rounded-[10px] px-10 py-14 font-serif"
      >
        <div className="card-line mb-6 font-sans text-[10px] tracking-[0.5em] text-[#7a5b3a]">
          Chaos
        </div>
        <h4
          className="card-line font-serif italic text-[#2a231a]"
          style={{ fontSize: "clamp(1.6rem, 2.8vw, 2.4rem)", lineHeight: 1.15 }}
        >
          Dear Chakku,
        </h4>
        <p className="card-line mt-6 text-[15px] leading-[1.85] text-[#3a2f22]">
          When we first met, I never thought we would become something like this
          today. Not just brother and sister — but honestly, even before that,
          we became really good friends.
        </p>

        <p className="card-line mt-4 text-[15px] leading-[1.85] text-[#3a2f22]">
          Together we’ve seen so many things — happiness, stress, masti, fights,
          and those small moments where we actually got to know each other
          properly. And I can say, those were some of the most beautiful moments
          I’ve ever spent… and you were a part of all of them.
        </p>

        <p className="card-line mt-4 text-[15px] leading-[1.85] text-[#3a2f22]">
          I just want you to know — no matter how far I am, I’ll always be there
          for you. If you make mistakes, I’ll be the one who explains it to you.
          If you achieve something, I’ll be happier than anyone else for you. I
          will always be there for you, no matter what.
        </p>

        <div
          className="card-line mt-8 font-hand text-[#5a3a2a]"
          style={{ fontSize: "1.6rem" }}
        >
          your SKY, always.
        </div>

        {/* wax seal */}
        <div
          className="card-line absolute bottom-8 right-8 flex h-16 w-16 items-center justify-center rounded-full text-[color:var(--color-ivory)] shadow-lg"
          style={{
            background:
              "radial-gradient(circle at 30% 30%, #b0322f, #6b1a1a 70%, #3a0f0f 100%)",
          }}
        >
          <span className="font-serif italic" style={{ fontSize: 22 }}>
            C
          </span>
        </div>
      </div>

      {/* cover (opens) */}
      <div
        ref={cover}
        className="paper absolute inset-0 flex flex-col items-center justify-center rounded-[10px]"
        style={{
          transformStyle: "preserve-3d",
          backfaceVisibility: "hidden",
          background:
            "linear-gradient(160deg, #1a1a20 0%, #0d0d12 55%, #06060a 100%)",
          color: "#f2ede4",
          boxShadow:
            "inset 0 0 80px rgba(0,0,0,0.9), 0 40px 100px -30px rgba(0,0,0,0.8)",
        }}
      >
        <div className="mb-3 font-sans text-[10px] tracking-[0.5em] text-[color:var(--color-rose)]/80">
          A LETTER
        </div>
        <div
          className="font-serif italic text-[color:var(--color-ivory)]"
          style={{ fontSize: "clamp(2.2rem, 4.5vw, 3.6rem)" }}
        >
          For you.
        </div>
        <div
          className="mt-2 font-hand text-[color:var(--color-rose)]"
          style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)" }}
        >
          Chakku
        </div>
        <div className="mt-8 h-px w-24 bg-[color:var(--color-ivory)]/25" />
        <div className="mt-6 max-w-[24ch] text-center font-serif italic text-[color:var(--color-ivory)]/50">
          open me slowly
        </div>

        {/* corner ornaments */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 400 500"
          fill="none"
          preserveAspectRatio="none"
        >
          <path
            d="M 20 20 Q 60 20 60 60"
            stroke="rgba(217,164,138,0.4)"
            strokeWidth="0.8"
          />
          <path
            d="M 380 20 Q 340 20 340 60"
            stroke="rgba(217,164,138,0.4)"
            strokeWidth="0.8"
          />
          <path
            d="M 20 480 Q 60 480 60 440"
            stroke="rgba(217,164,138,0.4)"
            strokeWidth="0.8"
          />
          <path
            d="M 380 480 Q 340 480 340 440"
            stroke="rgba(217,164,138,0.4)"
            strokeWidth="0.8"
          />
        </svg>
      </div>
    </div>
  );
}

export default function Chapter5Final() {
  return (
    <section className="relative z-[2] mx-auto min-h-screen w-full max-w-[1500px] px-6 py-32 md:px-16">
      <div className="mb-4 text-center font-sans text-[10px] tracking-[0.5em] text-[color:var(--color-moon)]/60"></div>
      <RevealText
        text="Everything I couldn't say out loud, I wrote here."
        as="h2"
        className="mx-auto mb-24 max-w-[24ch] text-center font-serif italic text-[color:var(--color-ivory)] text-balance"
      />

      <div className="grid grid-cols-1 items-center gap-20 lg:grid-cols-2">
        <VideoMessage />
        <Card />
      </div>

      {/* Final line */}
      <div className="mt-40 flex flex-col items-center px-6 text-center">
        <div className="line-draw mb-16 h-px w-40" />
        <RevealText
          text={`No matter how much we grow, you'll always be my favorite little chaos.`}
          as="p"
          className="mx-auto max-w-[28ch] font-serif italic text-[color:var(--color-ivory)] text-balance"
        />
        <div
          className="mt-10 font-hand text-[color:var(--color-rose)]"
          style={{ fontSize: "1.6rem" }}
        >
          Hey, I accept that I was never able to be on your priority list. I
          will always regret that, but I will try my best to be on your priority
          list. I always tried not to make you uncomfortable when you were
          around me. I just wanted to tell you this. You are amazing.
        </div>
        <div className="mt-16 font-sans text-[10px] tracking-[0.5em] text-[color:var(--color-ivory)]/30">
          MADE BY HAND · MADE FROM HEART · {new Date().getFullYear()} · Aakash
          Benarjee
        </div>
      </div>
    </section>
  );
}
