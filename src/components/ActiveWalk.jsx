import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useWalk } from '../context/WalkContext.jsx';
import { routes } from '../data/routes.js';
import CompanionNote from './CompanionNote.jsx';
import ProgressArc from './ProgressArc.jsx';

function ActiveWalk() {
  const { activeRoute, setWalkPhase } = useWalk();
  const route = activeRoute ?? routes[0];
  const companionMoment = route.moments[0];
  const [isPaused, setIsPaused] = useState(false);
  const [showNote, setShowNote] = useState(false);

  useEffect(() => {
    const showTimer = window.setTimeout(() => setShowNote(true), 4000);
    const dismissTimer = window.setTimeout(() => setShowNote(false), 12000);

    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(dismissTimer);
    };
  }, []);

  return (
    <motion.section
      className="screen active-walk"
      animate={{ opacity: isPaused ? 0.6 : 1 }}
      transition={{ duration: 0.3 }}
    >
      <button
        type="button"
        className={`pause-button ${isPaused ? 'is-paused' : ''}`}
        onClick={() => setIsPaused((paused) => !paused)}
      >
        {isPaused ? 'Resume' : 'Pause'}
      </button>

      <div className="map-placeholder active-walk__map">
        <span>Live map loads here — Phase 2</span>
      </div>

      <AnimatePresence>
        {showNote && (
          <CompanionNote>
            {companionMoment.note}
          </CompanionNote>
        )}
      </AnimatePresence>

      <motion.div
        className="walking-card"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 140, damping: 20 }}
      >
        <div>
          <p className="eyebrow">Now walking</p>
          <h1>{route.name}</h1>
          <p>{route.tagline}</p>
          <p className="walking-card__moment">
            First moment: {companionMoment.title} · {companionMoment.feature}
          </p>
        </div>
        <ProgressArc />
        <button
          type="button"
          className="secondary-action"
          onClick={() => setWalkPhase('arrival')}
        >
          I've arrived
        </button>
      </motion.div>
    </motion.section>
  );
}

export default ActiveWalk;
