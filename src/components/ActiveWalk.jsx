import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { length, nearestPointOnLine, point } from '@turf/turf';
import { useWalk } from '../context/WalkContext.jsx';
import { routes } from '../data/routes.js';
import { useGeolocation } from '../hooks/useGeolocation.js';
import { useMomentDetection } from '../hooks/useMomentDetection.js';
import CompanionNote from './CompanionNote.jsx';
import MapView from './MapView.jsx';
import ProgressArc from './ProgressArc.jsx';

const gentleTransition = {
  duration: 0.78,
  ease: [0.22, 1, 0.36, 1],
};

function ActiveWalk() {
  const { activeRoute, addTriggeredMoment, setWalkPhase, triggeredMoments } = useWalk();
  const route = activeRoute ?? routes[0];
  const [isPaused, setIsPaused] = useState(false);
  const [currentMoment, setCurrentMoment] = useState(null);
  const [progress, setProgress] = useState(0);
  const positionRef = useRef(null);
  const { position } = useGeolocation(route, { enabled: !isPaused });

  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  const handleMoment = useCallback(
    (moment) => {
      addTriggeredMoment(moment.id);
      setCurrentMoment(moment);
    },
    [addTriggeredMoment],
  );

  useMomentDetection({
    activeRoute: route,
    position,
    triggeredMoments,
    onMoment: handleMoment,
    enabled: !isPaused,
  });

  useEffect(() => {
    if (isPaused) {
      return undefined;
    }

    const updateProgress = () => {
      if (!positionRef.current) {
        return;
      }

      const totalKm = length(route.geometry, { units: 'kilometers' });
      const snapped = nearestPointOnLine(route.geometry, point(positionRef.current), {
        units: 'kilometers',
      });
      const nextProgress = totalKm ? snapped.properties.location / totalKm : 0;
      setProgress(Math.min(nextProgress, 1));

      if (nextProgress > 0.95) {
        setWalkPhase('arrival');
      }
    };

    updateProgress();
    const timer = window.setInterval(updateProgress, 10000);
    return () => window.clearInterval(timer);
  }, [isPaused, route, setWalkPhase]);

  return (
    <motion.section className="screen active-walk">
      <MapView routes={[route]} activeRoute={route} mode="walking" position={position} progress={progress} />

      <motion.div
        className="walk-top-bar"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...gentleTransition, delay: 0.18 }}
      >
        <h1>{route.name}</h1>
        <button
          type="button"
          className="pause-button"
          aria-label={isPaused ? 'Resume walk' : 'Pause walk'}
          onClick={() => setIsPaused((paused) => !paused)}
        >
          {isPaused ? '▶' : 'Ⅱ'}
        </button>
      </motion.div>

      <AnimatePresence>
        {isPaused && (
          <motion.div
            className="pause-dim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {currentMoment && (
          <CompanionNote moment={currentMoment} onDismiss={() => setCurrentMoment(null)} />
        )}
      </AnimatePresence>

      <motion.div
        className="walking-card"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...gentleTransition, delay: 0.28 }}
      >
        <p>{currentMoment?.label ?? route.name}</p>
        <ProgressArc progress={progress} />
      </motion.div>
    </motion.section>
  );
}

export default ActiveWalk;
