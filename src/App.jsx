import { AnimatePresence, motion } from 'framer-motion';
import { Component, lazy, Suspense, useEffect } from 'react';
import Arrival from './components/Arrival.jsx';
import StateSelection from './components/StateSelection.jsx';
import { useWalk } from './context/WalkContext.jsx';
import { STATE_COLORS } from './data/routes.js';

const ActiveWalk = lazy(() => import('./components/ActiveWalk.jsx'));
const RouteDiscovery = lazy(() => import('./components/RouteDiscovery.jsx'));

const transitions = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
};

const screenTransition = {
  duration: 0.72,
  ease: [0.22, 1, 0.36, 1],
};

function MapFallback() {
  return (
    <section className="screen map-fallback">
      <p>Map view is unavailable right now. Please check the Mapbox token and refresh.</p>
    </section>
  );
}

class ScreenErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidUpdate(previousProps) {
    if (previousProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return <MapFallback />;
    }

    return this.props.children;
  }
}

function App() {
  const { spatialState, walkPhase } = useWalk();

  useEffect(() => {
    const color = STATE_COLORS[spatialState] ?? STATE_COLORS.calm;
    document.documentElement.style.setProperty('--state-color', color);
  }, [spatialState]);

  const screens = {
    select: <StateSelection />,
    browse: (
      <Suspense fallback={<MapFallback />}>
        <RouteDiscovery />
      </Suspense>
    ),
    walking: (
      <Suspense fallback={<MapFallback />}>
        <ActiveWalk />
      </Suspense>
    ),
    arrival: <Arrival />,
  };

  return (
    <main className="app-shell" aria-live="polite">
      <AnimatePresence mode="wait">
        <motion.div
          key={walkPhase}
          className="screen-frame"
          variants={transitions}
          initial={false}
          animate="animate"
          exit="exit"
          transition={screenTransition}
        >
          <ScreenErrorBoundary resetKey={walkPhase}>{screens[walkPhase]}</ScreenErrorBoundary>
        </motion.div>
      </AnimatePresence>
    </main>
  );
}

export default App;
