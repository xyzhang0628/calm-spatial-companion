import { motion } from 'framer-motion';
import { useEffect } from 'react';

const SCALE_LABELS = {
  xs: 'XS · body',
  s: 'S · path',
  m: 'M · neighborhood',
  l: 'L · landscape',
};

function CompanionNote({ moment, onDismiss }) {
  const words = moment.companion_note.split(' ');
  const scaleLabel = SCALE_LABELS[moment.scale] ?? SCALE_LABELS.xs;

  useEffect(() => {
    const timer = window.setTimeout(onDismiss, 11000);
    return () => window.clearTimeout(timer);
  }, [onDismiss]);

  return (
    <motion.aside
      className="companion-note"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
      onClick={onDismiss}
    >
      <p className="companion-note__label">{scaleLabel}</p>
      <motion.p
        className="companion-note__text"
        variants={{ show: { transition: { staggerChildren: 0.055 } } }}
        initial="hidden"
        animate="show"
      >
        {words.map((word, index) => (
          <motion.span
            key={`${word}-${index}`}
            variants={{
              hidden: { opacity: 0, y: 4 },
              show: { opacity: 1, y: 0, transition: { duration: 0.34 } },
            }}
          >
            {word}{' '}
          </motion.span>
        ))}
      </motion.p>
    </motion.aside>
  );
}

export default CompanionNote;
