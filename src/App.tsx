import { useEffect, useState } from "react";
import { useLenis } from "./hooks/useLenis";
import Cursor from "./components/Cursor";
import Atmosphere from "./components/Atmosphere";
import AmbientAudio from "./components/AmbientAudio";
import IntroOverlay from "./components/IntroOverlay";
import Chapter1Beginning from "./chapters/Chapter1Beginning";
import Chapter2Memories from "./chapters/Chapter2Memories";
import Chapter3Laptop from "./chapters/Chapter3Laptop";
import Chapter4Ribbon from "./chapters/Chapter4Ribbon";
import Chapter5Final from "./chapters/Chapter5Final";

export default function App() {
  useLenis();
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    // scroll to top on load
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Cursor />
      <Atmosphere />
      <AmbientAudio />

      {/* Top-left mark */}
      <div className="pointer-events-none fixed left-6 top-6 z-[70] font-sans text-[10px] tracking-[0.4em] text-[color:var(--color-ivory)]/40">
        FOR CHAKKU &nbsp;·&nbsp; A MEMORY
      </div>
      <div
        className="pointer-events-none fixed right-6 top-6 z-[70] font-hand text-[color:var(--color-rose)]/70"
        style={{ fontSize: "1.05rem" }}
      >
        SKY
      </div>

      <IntroOverlay onEnter={() => setEntered(true)} />

      <main className="relative z-[2]">
        {/* Chapter 1 always mounts so bouquet is ready when overlay lifts */}
        <Chapter1Beginning key={entered ? "e" : "u"} />
        <Chapter2Memories />
        <Chapter3Laptop />
        <Chapter4Ribbon />
        <Chapter5Final />
      </main>
    </>
  );
}
