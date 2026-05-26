import { motion } from 'framer-motion';
import { useState } from 'react';
import { useWalk } from '../context/WalkContext.jsx';

const closingLines = {
  calm: 'You found some quiet. Carry a little of it with you.',
  grounded: 'The ground held you the whole way.',
  open: 'You let the sky in.',
  flowing: 'The body remembers how to move.',
};

function Arrival() {
  const {
    activeRoute,
    resetTriggeredMoments,
    spatialState,
    setActiveRoute,
    setSpatialState,
    setWalkPhase,
  } = useWalk();
  const [isSaved, setIsSaved] = useState(false);

  function handleWalkAgain() {
    setSpatialState(null);
    setActiveRoute(null);
    resetTriggeredMoments();
    setWalkPhase('select');
  }

  function handleSaveRoute() {
    if (!activeRoute) {
      return;
    }

    const stored = JSON.parse(localStorage.getItem('saved_routes') ?? '[]');
    const nextRoutes = Array.from(new Set([...stored, activeRoute.id]));
    localStorage.setItem('saved_routes', JSON.stringify(nextRoutes));
    setIsSaved(true);
  }

  return (
    <section className="screen arrival">
      <motion.div
        className="arrival__content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <h1>{closingLines[spatialState ?? activeRoute?.state ?? 'calm']}</h1>
        <div className="arrival__actions">
          <button type="button" className="walk-again-button" onClick={handleWalkAgain}>
            Walk again
          </button>
          <button
            type="button"
            className="save-route-button"
            disabled={isSaved}
            onClick={handleSaveRoute}
          >
            {isSaved ? 'Saved ✓' : 'Save this route'}
          </button>
        </div>
      </motion.div>
    </section>
  );
}

export default Arrival;
