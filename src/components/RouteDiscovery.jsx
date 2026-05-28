import { motion } from 'framer-motion';
import { useEffect, useMemo, useRef } from 'react';
import { useWalk } from '../context/WalkContext.jsx';
import { getRoutesForState } from '../data/routeLogic.js';
import MapView from './MapView.jsx';
import RouteCard from './RouteCard.jsx';

const sheetTransition = {
  duration: 0.9,
  ease: [0.22, 1, 0.36, 1],
};

function RouteDiscovery() {
  const {
    spatialState,
    activeRoute,
    selectedDuration,
    setActiveRoute,
    setWalkPhase,
  } = useWalk();
  const listRef = useRef(null);

  const visibleRoutes = useMemo(() => {
    const state = spatialState ?? activeRoute?.state ?? 'calm';
    return getRoutesForState(state, selectedDuration);
  }, [activeRoute?.state, selectedDuration, spatialState]);

  useEffect(() => {
    const missingActiveRoute =
      !activeRoute || !visibleRoutes.some((route) => route.id === activeRoute.id);

    if (missingActiveRoute && visibleRoutes[0]) {
      setActiveRoute(visibleRoutes[0]);
    }
  }, [activeRoute, setActiveRoute, visibleRoutes]);

  function handleBegin() {
    if (activeRoute) {
      setWalkPhase('walking');
    }
  }

  function handleScroll() {
    const list = listRef.current;
    if (!list) {
      return;
    }

    const step = window.innerWidth - 52;
    const route = visibleRoutes[Math.round(list.scrollLeft / step)];
    if (route && route.id !== activeRoute?.id) {
      setActiveRoute(route);
    }
  }

  return (
    <section className="screen route-discovery">
      <MapView routes={visibleRoutes} activeRoute={activeRoute} mode="browse" />

      <motion.div
        className="bottom-sheet"
        drag="y"
        dragConstraints={{ top: 0, bottom: 160 }}
        dragElastic={0.1}
        initial={{ y: '100%', opacity: 0.96 }}
        animate={{ y: 160, opacity: 1 }}
        exit={{ y: 220, opacity: 0 }}
        transition={sheetTransition}
      >
        <div className="bottom-sheet__handle" aria-hidden="true" />
        <div className="route-list" ref={listRef} onScroll={handleScroll}>
          {visibleRoutes.map((route) => (
            <RouteCard
              key={route.id}
              route={route}
              isActive={activeRoute?.id === route.id}
              onSelect={setActiveRoute}
              onBegin={handleBegin}
            />
          ))}
        </div>
      </motion.div>
    </section>
  );
}

export default RouteDiscovery;
