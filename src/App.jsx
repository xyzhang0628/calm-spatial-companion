import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import ActiveWalk from './components/ActiveWalk.jsx';
import Arrival from './components/Arrival.jsx';
import RouteDiscovery from './components/RouteDiscovery.jsx';
import StateSelection from './components/StateSelection.jsx';
import { useWalk } from './context/WalkContext.jsx';
import { STATE_COLORS } from './data/routes.js';

const transitions = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

function App() {
  const { spatialState, walkPhase } = useWalk();

  useEffect(() => {
    const color = STATE_COLORS[spatialState] ?? STATE_COLORS.calm;
    document.documentElement.style.setProperty('--state-color', color);
  }, [spatialState]);

  const screens = {
    select: <StateSelection />,
    browse: <RouteDiscovery />,
    walking: <ActiveWalk />,
    arrival: <Arrival />,
  };

  return (
    <main className="app-shell" aria-live="polite">
      <AnimatePresence mode="wait">
        <motion.div
          key={walkPhase}
          className="screen-frame"
          variants={transitions}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          {screens[walkPhase]}
        </motion.div>
      </AnimatePresence>
    </main>
  );
}

export default App;
