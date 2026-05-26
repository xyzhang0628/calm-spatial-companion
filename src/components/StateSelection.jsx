import { motion, AnimatePresence } from "framer-motion";
import { STATE_COLORS, STATE_DESCRIPTORS } from "../data/routes";
import { useWalk } from "../context/WalkContext";

const DURATIONS = [15, 30, 45, 60];
const states = Object.keys(STATE_COLORS);

export default function StateSelection() {
  const {
    spatialState,
    setSpatialState,
    setWalkPhase,
    timePreference,
    setTimePreference,
  } = useWalk();

  const selectedIndex = Math.max(DURATIONS.indexOf(timePreference), 0);
  const backgroundColor = spatialState ? `${STATE_COLORS[spatialState]}24` : "#f7f5ef";

  return (
    <main className="state-selection" style={{ backgroundColor }}>
      <section className="state-selection__inner">
        <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          How do you want to feel today?
        </motion.h1>
        <div className="state-grid">
          {states.map((state) => {
            const selected = spatialState === state;
            const faded = spatialState && !selected;
            return (
              <motion.button
                type="button"
                key={state}
                className="state-choice"
                style={{ "--state-color": STATE_COLORS[state] }}
                onClick={() => setSpatialState(state)}
                animate={{
                  scale: selected ? 1.04 : 1,
                  opacity: faded ? 0.4 : 1,
                }}
                transition={{ type: "spring", stiffness: 180, damping: 18 }}
              >
                <span>{state}</span>
                <small>{STATE_DESCRIPTORS[state]}</small>
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence>
          {spatialState && (
            <motion.div
              className="time-panel"
              initial={{ opacity: 0, y: 48 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 48 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            >
              <label htmlFor="time-slider">How much time can soften?</label>
              <div className="slider-row">
                <input
                  id="time-slider"
                  type="range"
                  min="0"
                  max={DURATIONS.length - 1}
                  step="1"
                  value={selectedIndex}
                  onChange={(event) =>
                    setTimePreference(DURATIONS[Number(event.target.value)])
                  }
                />
                <span>{timePreference ?? DURATIONS[0]} min</span>
              </div>
              <AnimatePresence>
                {timePreference && (
                  <motion.button
                    type="button"
                    className="primary-action"
                    onClick={() => setWalkPhase("browse")}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                  >
                    Find routes
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </main>
  );
}
