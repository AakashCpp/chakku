import { useEffect, useRef, useState } from "react";

/**
 * Global ambient audio layer.
 * - Very low volume so video/audio from other sections can be heard clearly.
 * - Starts muted (autoplay policies) – unmuted on first user interaction.
 * - Toggle button in the corner.
 */

export default function AmbientAudio() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const handleFirstInteraction = () => {
      if (!playing && audioRef.current) {
        audioRef.current.volume = 0.15; // very subtle background
        audioRef.current.play().catch(() => {});
        setPlaying(true);
      }
      window.removeEventListener("click", handleFirstInteraction);
      window.removeEventListener("keydown", handleFirstInteraction);
    };
    window.addEventListener("click", handleFirstInteraction);
    window.addEventListener("keydown", handleFirstInteraction);
    return () => {
      window.removeEventListener("click", handleFirstInteraction);
      window.removeEventListener("keydown", handleFirstInteraction);
    };
  }, [playing]);

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.volume = 0.15;
      audioRef.current.play().catch(() => {});
    }
    setPlaying(!playing);
  };

  return (
    <>
      <audio
        ref={audioRef}
        loop
        preload="auto"
        src="love story - indila (clean instrumental)(extended  good part loop).mp3"
      />
      <button
        onClick={toggle}
        aria-label={playing ? "Mute ambient sound" : "Play ambient sound"}
        className="pointer-events-auto fixed bottom-6 right-6 z-[101] flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-[color:var(--color-ivory)] opacity-60 backdrop-blur transition-all hover:opacity-100"
      >
        {playing ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16.5 12c0-1.77-.93-3.36-2.34-4.27l-1.43.83a5.5 5.5 0 0 0 0 4.9v.83l1.43.83A4.5 4.5 0 0 1 16.5 12zM3 9v6h4l5 5V4L7 9H3z" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 9v6h4l5 5V4L7 9H3z" />
            <line x1="14.5" y1="9" x2="20" y2="15" strokeWidth="2" />
            <line x1="20" y1="9" x2="14.5" y2="15" strokeWidth="2" />
          </svg>
        )}
      </button>
    </>
  );
}
