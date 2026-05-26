import { motion } from 'framer-motion';

function ProgressArc() {
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const simulatedProgress = 0.6;

  return (
    <div className="progress-arc" aria-label="Walk progress, 60 percent">
      <svg viewBox="0 0 120 120" role="img" aria-hidden="true">
        <circle className="progress-arc__track" cx="60" cy="60" r={radius} />
        <motion.circle
          className="progress-arc__meter"
          cx="60"
          cy="60"
          r={radius}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - simulatedProgress) }}
          transition={{ duration: 5, ease: 'easeInOut' }}
        />
      </svg>
      <span>60%</span>
    </div>
  );
}

export default ProgressArc;
