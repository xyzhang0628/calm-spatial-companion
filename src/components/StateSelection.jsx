import { AnimatePresence, motion } from 'framer-motion';
import { useMemo } from 'react';
import { routes } from '../data/routes.js';
import { useWalk } from '../context/WalkContext.jsx';

const stateOptions = [
  {
    state: 'calm',
    descriptor: 'quiet, shaded, still',
    note: "You're looking for streets that hold you quietly.",
  },
  {
    state: 'grounded',
    descriptor: 'earthy, slow, rooted',
    note: 'You want to feel the city underfoot.',
  },
  {
    state: 'open',
    descriptor: 'wide, bright, spacious',
    note: 'You need room to breathe.',
  },
  {
    state: 'flowing',
    descriptor: 'rhythmic, continuous, easy',
    note: 'Your body wants to keep moving.',
  },
];

const timeOptions = [15, 30, 45, 60];

function StateSelection() {
  const {
    spatialState,
    selectedDuration,
    setSpatialState,
    setActiveRoute,
    setWalkPhase,
    setSelectedDuration,
    resetTriggeredMoments,
  } = useWalk();
  const selectedOption = stateOptions.find((option) => option.state === spatialState);
  const selectedRoute = useMemo(() => {
    const stateRoutes = routes.filter((route) => route.state === spatialState);
    return stateRoutes.sort((a, b) => Math.abs(a.duration_min - selectedDuration) - Math.abs(b.duration_min - selectedDuration))[0];
  }, [selectedDuration, spatialState]);

  function handleStateSelect(state) {
    setSpatialState(state);
    setActiveRoute(routes.find((route) => route.state === state) ?? null);
    resetTriggeredMoments();
  }

  function handleFindRoutes() {
    if (selectedRoute) {
      setActiveRoute(selectedRoute);
      setWalkPhase('browse');
    }
  }

  return (
    <motion.section className={`screen state-selection ${spatialState ? 'has-state' : ''}`}>
      <div className="state-selection__content">
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
                animate={{ opacity: isDimmed ? 0.45 : 1, scale: isDimmed ? 0.98 : 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 22 }}
                onClick={() => handleStateSelect(option.state)}
              >
                <span>
                  <span className="state-card__label">{option.state}</span>
                  <span className="state-card__descriptor">{option.descriptor}</span>
                </span>
                <span className={`state-card__dot state-card__dot--${option.state}`} />
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence>
          {selectedOption && (
            <motion.p
              className="state-companion-line"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              {selectedOption.note}
            </motion.p>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {spatialState && (
            <motion.div className="duration-panel" initial={{ y: 100 }} animate={{ y: 0 }}>
              <div className="duration-pills" aria-label="Choose walk duration">
                {timeOptions.map((time) => (
                  <button
                    key={time}
                    type="button"
                    className={selectedDuration === time ? 'is-selected' : ''}
                    onClick={() => setSelectedDuration(time)}
                  >
                    {time}
                  </button>
                ))}
              </div>

              <AnimatePresence>
                {selectedRoute && (
                  <motion.button
                    type="button"
                    className="primary-action"
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}
                    transition={{ delay: 0.2 }}
                    onClick={handleFindRoutes}
                  >
                    Find routes →
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
