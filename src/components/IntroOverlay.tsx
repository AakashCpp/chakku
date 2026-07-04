import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

/**
 * A soft overlay that greets the user before the memory begins.
 * "For Chakku — press to begin." Clicking it fades away and
 * unlocks the seed's breathing. It sets the emotional tone.
 */
export default function IntroOverlay({ onEnter }: { onEnter: () => void }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // lock scroll while overlay visible
    if (visible) {
      document.documentElement.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = "";
    }
  }, [visible]);

  const enter = () => {
    setVisible(false);
    setTimeout(onEnter, 400);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[80] flex flex-col items-center justify-center bg-[color:var(--color-ink)]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 1.4, ease: "easeInOut" } }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
            className="mb-6 font-sans text-[10px] tracking-[0.6em] text-[color:var(--color-moon)]/60"
          >
            A LETTER, WRITTEN IN LIGHT
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 2.4, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            className="text-center font-serif italic text-[color:var(--color-ivory)]"
            style={{ fontSize: "clamp(2.4rem, 6vw, 4.8rem)", lineHeight: 1.1 }}
          >
            For&nbsp;
            <span className="font-hand text-[color:var(--color-rose)]">Chakku</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 1.8 }}
            className="mt-8 max-w-[38ch] text-center font-serif italic text-[color:var(--color-ivory)]/55"
          >
            The room is quiet. The lights are low. Take a breath before you scroll.
          </motion.p>
          <motion.button
            onClick={enter}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.2, duration: 1.4 }}
            whileHover={{ scale: 1.04 }}
            className="mt-14 rounded-full border border-[color:var(--color-ivory)]/25 px-8 py-3 font-sans text-[11px] tracking-[0.4em] text-[color:var(--color-ivory)]/80 backdrop-blur transition-colors hover:bg-[color:var(--color-ivory)]/5"
          >
            BEGIN
          </motion.button>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.8, duration: 2 }}
            className="mt-16 font-hand text-[color:var(--color-rose)]/70"
            style={{ fontSize: "1.25rem" }}
          >
            press play on the year ahead ♡
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
