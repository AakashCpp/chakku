import { useRef, useState } from "react";
import FloralFrame from "../components/FloralFrame";

export default function Chapter1Beginning() {
  const root = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  return (
    <section
      ref={root}
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden"
    >
      {/* Soft volumetric glow — lets the shared site atmosphere (fireflies, aurora, dust) show through */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(65,45,40,0.18),transparent_65%)]" />

      {/* Atmospheric fog layers */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-35 mix-blend-screen"
        style={{
          background:
            "radial-gradient(ellipse at 25% 25%, rgba(168, 162, 196, 0.08), transparent 45%), radial-gradient(ellipse at 75% 75%, rgba(217, 164, 138, 0.08), transparent 45%)",
        }}
      />

      {/* Floral Frame & Central Typography Composition Stage */}
      <div className="relative z-10 mx-auto flex h-[92vh] w-full max-w-[1280px] items-center justify-center px-4">
        <FloralFrame onComplete={() => setReady(true)} />
      </div>

      {/* Subtle Scroll Hint */}
      <div className="pointer-events-none absolute bottom-6 left-1/2 z-30 -translate-x-1/2 text-center">
        <div
          className="font-sans text-[10px] tracking-[0.45em] text-[color:var(--color-ivory)]/45 transition-opacity duration-[2000ms] ease-out"
          style={{ opacity: ready ? 1 : 0 }}
        >
          SCROLL &nbsp; GENTLY
        </div>
        <div
          className="mx-auto mt-2 h-8 w-px bg-gradient-to-b from-[color:var(--color-ivory)]/40 to-transparent transition-opacity duration-[2000ms] ease-out"
          style={{ opacity: ready ? 1 : 0 }}
        ></div>
      </div>
    </section>
  );
}
