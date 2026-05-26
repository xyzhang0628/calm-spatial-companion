import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { routes } from '../data/routes.js';
import { useWalk } from '../context/WalkContext.jsx';

const stateOptions = [
  {
    state: 'calm',
    label: 'calm',
    descriptor: 'quiet, shaded, still',
  },
  {
    state: 'grounded',
    label: 'grounded',
    descriptor: 'earthy, slow, rooted',
  },
  {
    state: 'open',
    label: 'open',
    descriptor: 'wide, bright, spacious',
  },
  {
    state: 'flowing',
    label: 'flowing',
    descriptor: 'rhythmic, continuous, easy',
  },
];

const timeOptions = [15, 30, 45, 60];

const stateColors = {
  calm: '#7a9e8a',
  grounded: '#8a7a6a',
  open: '#6a8fa0',
  flowing: '#8a8aaa',
};

function StateSelection() {
  const {
    spatialState,
    setSpatialState,
    setActiveRoute,
    setWalkPhase,
  } = useWalk();
  const [duration, setDuration] = useState(30);
  const [sliderTouched, setSliderTouched] = useState(false);
  const selectedRoute = routes.find((route) => route.state === spatialState);

  function handleStateSelect(state) {
    setSpatialState(state);
    setActiveRoute(routes.find((route) => route.state === state) ?? null);
    setSliderTouched(false);
  }

  function handleFindRoutes() {
    if (!selectedRoute) {
      return;
    }

    setActiveRoute(selectedRoute);
    setWalkPhase('browse');
  }

  return (
    <motion.section
      className="screen state-selection"
      animate={{
        backgroundColor: spatialState ? stateColors[spatialState] : '#f6f1e8',
      }}
      transition={{ duration: 4, ease: 'easeInOut' }}
    >
      <div className="state-selection__content">
        <p className="eyebrow">A Calm Spatial Companion</p>
        <h1>How do you want to feel today?</h1>

        <div className="state-grid" aria-label="Choose a desired spatial state">
          {stateOptions.map((option) => {
            const isSelected = spatialState === option.state;
            const isDimmed = spatialState && !isSelected;

            return (
              <motion.button
                layout
                key={option.state}
                type="button"
                className={`state-card ${isSelected ? 'is-selected' : ''}`}
                style={{ '--state-color': `var(--${option.state})` }}
                animate={{
                  opacity: isDimmed ? 0.4 : 1,
                  scale: isSelected ? 1.04 : 1,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 180,
                  damping: 20,
                }}
                onClick={() => handleStateSelect(option.state)}
              >
                <span className="state-card__label">{option.label}</span>
                <span className="state-card__descriptor">{option.descriptor}</span>
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence>
          {spatialState && (
            <motion.div
              className="time-panel"
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ type: 'spring', stiffness: 180, damping: 22 }}
            >
              <div className="time-panel__header">
                <span>Walk length</span>
                <strong>{duration} min</strong>
              </div>
              <input
                aria-label="Walk length in minutes"
                className="time-slider"
                type="range"
                min={timeOptions[0]}
                max={timeOptions[timeOptions.length - 1]}
                step="15"
                value={duration}
                onChange={(event) => {
                  setDuration(Number(event.target.value));
                  setSliderTouched(true);
                }}
              />
              <div className="time-ticks" aria-hidden="true">
                {timeOptions.map((time) => (
                  <span key={time}>{time}</span>
                ))}
              </div>

              <AnimatePresence>
                {sliderTouched && (
                  <motion.button
                    type="button"
                    className="primary-action"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 16 }}
                    onClick={handleFindRoutes}
                  >
                    Find routes
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}

export default StateSelection;
