import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function CompanionNote({ note, onDismiss }) {
  useEffect(() => {
    if (!note) return undefined;
    const timer = window.setTimeout(onDismiss, 8000);
    return () => window.clearTimeout(timer);
  }, [note, onDismiss]);

  const words = note?.companion_note.split(" ") ?? [];

  return (
    <AnimatePresence>
      {note && (
        <motion.button
          type="button"
          className="companion-note"
          onClick={onDismiss}
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <span className="companion-note__label">{note.label}</span>
          <span className="companion-note__text">
            {words.map((word, index) => (
              <motion.span
                key={`${word}-${index}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: index * 0.03,
                  duration: 0.3,
                  ease: "easeOut",
                }}
              >
                {word}
                {index < words.length - 1 ? " " : ""}
              </motion.span>
            ))}
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
