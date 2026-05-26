import { motion } from 'framer-motion';

function CompanionNote({ children }) {
  return (
    <motion.aside
      className="companion-note"
      initial={{ opacity: 0, y: 18, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.98 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    >
      {children}
    </motion.aside>
  );
}

export default CompanionNote;
