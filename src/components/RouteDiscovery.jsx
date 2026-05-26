import { motion } from 'framer-motion';
import { useEffect, useMemo } from 'react';
import { useWalk } from '../context/WalkContext.jsx';
import { routes } from '../data/routes.js';
import RouteCard from './RouteCard.jsx';

function RouteDiscovery() {
  const {
    spatialState,
    activeRoute,
    setActiveRoute,
    setSpatialState,
    setWalkPhase,
  } = useWalk();

  const visibleRoutes = useMemo(() => {
    const preferredRoute = routes.find((route) => route.state === spatialState) ?? routes[0];
    const supportingRoutes = routes
      .filter((route) => route.id !== preferredRoute.id)
      .slice(0, 2);

    return [preferredRoute, ...supportingRoutes];
  }, [spatialState]);

  useEffect(() => {
    if (!activeRoute && visibleRoutes[0]) {
      setActiveRoute(visibleRoutes[0]);
    }
  }, [activeRoute, setActiveRoute, visibleRoutes]);

  function handleSelect(route) {
    setActiveRoute(route);
    setSpatialState(route.state);
  }

  function handleBegin() {
    if (activeRoute) {
      setWalkPhase('walking');
    }
  }

  return (
    <section className="screen route-discovery">
      <div className="map-placeholder route-discovery__map">
        <span>Map loads here — Phase 2</span>
      </div>

      <motion.div
        className="bottom-sheet"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 140, damping: 22 }}
      >
        <div className="bottom-sheet__handle" aria-hidden="true" />
        <div className="bottom-sheet__intro">
          <p className="eyebrow">Route discovery</p>
          <h1>Choose a texture for the walk.</h1>
        </div>
        <div className="route-list">
          {visibleRoutes.map((route) => (
            <RouteCard
              key={route.id}
              route={route}
              isActive={activeRoute?.id === route.id}
              onSelect={handleSelect}
              onBegin={handleBegin}
            />
          ))}
        </div>
      </motion.div>
    </section>
  );
}

export default RouteDiscovery;
