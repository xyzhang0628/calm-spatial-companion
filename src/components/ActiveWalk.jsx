import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { length, nearestPointOnLine, point } from '@turf/turf';
import { useWalk } from '../context/WalkContext.jsx';
import { routes } from '../data/routes.js';
import { SPATIAL_LAYERS, XL_QUESTIONS } from '../data/spatialLayers.js';
import { useGeolocation } from '../hooks/useGeolocation.js';
import { useMomentDetection } from '../hooks/useMomentDetection.js';
import CompanionNote from './CompanionNote.jsx';
import MapView from './MapView.jsx';
import ProgressArc from './ProgressArc.jsx';

const gentleTransition = {
  duration: 0.78,
  ease: [0.22, 1, 0.36, 1],
};
const NOTE_EMERGE_DELAY_MS = 2200;
const PROGRESS_UPDATE_INTERVAL_MS = 1000;

function ActiveWalk() {
  const { activeRoute, addTriggeredMoment, setWalkPhase, triggeredMoments } = useWalk();
  const route = activeRoute ?? routes[0];
  const layer = SPATIAL_LAYERS[route.id];
  const scaleItems = layer
    ? [
        ['XS', 'body'],
        ['S', layer.s.pathCharacter],
        ['M', layer.m.neighborhoodRhythm],
        ['L', layer.l.landscapeTransition],
        ['XL', XL_QUESTIONS[route.state]],
      ]
    : [];
  const [isPaused, setIsPaused] = useState(false);
  const [currentMoment, setCurrentMoment] = useState(null);
  const [progress, setProgress] = useState(0);
  const positionRef = useRef(null);
  const noteTimerRef = useRef(null);
  const {
    position,
    isSimulated,
    progress: simulatedProgress,
  } = useGeolocation(route, { enabled: !isPaused });

  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  const handleMoment = useCallback(
    (moment) => {
      const layer = SPATIAL_LAYERS[route.id];
      const xsPrompt = layer?.xs.find((item) => item.momentId === moment.id);
      const companionMoment = {
        ...moment,
        companion_note: xsPrompt?.prompt ?? moment.companion_note,
        scale: xsPrompt?.scale ?? 'xs',
      };

      addTriggeredMoment(moment.id);
      window.clearTimeout(noteTimerRef.current);
      noteTimerRef.current = window.setTimeout(() => {
        setCurrentMoment(companionMoment);
      }, NOTE_EMERGE_DELAY_MS);
    },
    [addTriggeredMoment, route.id],
  );

  useEffect(
    () => () => window.clearTimeout(noteTimerRef.current),
    [route.id],
  );

  useEffect(() => {
    if (isPaused) {
      window.clearTimeout(noteTimerRef.current);
    }
  }, [isPaused]);

  useMomentDetection({
    activeRoute: route,
    position,
    triggeredMoments,
    onMoment: handleMoment,
    enabled: !isPaused,
  });

  useEffect(() => {
    if (!isSimulated || isPaused) {
      return;
    }

    const nextProgress = Math.min(simulatedProgress, 1);
    setProgress(nextProgress);

    if (nextProgress >= 0.98) {
      setWalkPhase('arrival');
    }
  }, [isPaused, isSimulated, setWalkPhase, simulatedProgress]);

  useEffect(() => {
    if (isPaused || isSimulated) {
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
    const timer = window.setInterval(updateProgress, PROGRESS_UPDATE_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [isPaused, isSimulated, route, setWalkPhase]);

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
        <div className="walk-scale-strip" aria-label="Spatial awareness scales">
          {scaleItems.map(([scale, label]) => (
            <span
              key={scale}
              className={`walk-scale-chip ${scale === 'XL' ? 'walk-scale-chip--xl' : ''}`}
            >
              <strong>{scale}</strong>
              {label}
            </span>
          ))}
        </div>
        <p>{currentMoment?.label ?? route.name}</p>
        <ProgressArc progress={progress} />
      </motion.div>
    </motion.section>
  );
}

export default ActiveWalk;
