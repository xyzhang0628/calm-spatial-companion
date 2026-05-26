import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import MapView from "./MapView";
import RouteCard from "./RouteCard";
import { routes } from "../data/routes";
import { useWalk } from "../context/WalkContext";

export default function RouteDiscovery() {
  const {
    spatialState,
    activeRoute,
    setActiveRoute,
    setWalkPhase,
    timePreference,
  } = useWalk();

  const visibleRoutes = useMemo(() => {
    return routes
      .filter((route) => route.state === spatialState)
      .sort(
        (a, b) =>
          Math.abs(a.duration_min - timePreference) -
          Math.abs(b.duration_min - timePreference),
      );
  }, [spatialState, timePreference]);

  useEffect(() => {
    if (!spatialState) setWalkPhase("select");
    if (activeRoute && activeRoute.state !== spatialState) setActiveRoute(null);
  }, [activeRoute, setActiveRoute, setWalkPhase, spatialState]);

  return (
    <main className="map-screen">
      <MapView
        routes={visibleRoutes}
        activeRoute={activeRoute}
        showMoments={Boolean(activeRoute)}
      />
      <motion.section
        className="bottom-sheet route-sheet"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        <p className="eyebrow">Routes for feeling {spatialState}</p>
        <div className="route-list">
          {visibleRoutes.map((route) => (
            <RouteCard
              key={route.id}
              route={route}
              isActive={activeRoute?.id === route.id}
              onSelect={() => setActiveRoute(route)}
              onBegin={() => setWalkPhase("walking")}
            />
          ))}
        </div>
      </motion.section>
    </main>
  );
}
