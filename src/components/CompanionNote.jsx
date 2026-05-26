import { motion } from 'framer-motion';
import { useEffect } from 'react';

function CompanionNote({ moment, onDismiss }) {
  const words = moment.companion_note.split(' ');

  useEffect(() => {
    const timer = window.setTimeout(onDismiss, 8000);
    return () => window.clearTimeout(timer);
  }, [onDismiss]);

  return (
    <motion.aside
      className="companion-note"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      onClick={onDismiss}
    >
      <p className="companion-note__label">{moment.type} moment</p>
      <motion.p
        className="companion-note__text"
        variants={{ show: { transition: { staggerChildren: 0.03 } } }}
        initial="hidden"
        animate="show"
      >
        {words.map((word, index) => (
          <motion.span
            key={`${word}-${index}`}
            variants={{
              hidden: { opacity: 0, y: 4 },
              show: { opacity: 1, y: 0, transition: { duration: 0.2 } },
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
