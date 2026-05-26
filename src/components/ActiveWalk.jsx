import { useCallback, useEffect, useMemo, useState } from "react";
import * as turf from "@turf/turf";
import CompanionNote from "./CompanionNote";
import MapView from "./MapView";
import ProgressArc from "./ProgressArc";
import { STATE_COLORS } from "../data/routes";
import { useWalk } from "../context/WalkContext";
import { useGeolocation } from "../hooks/useGeolocation";
import { useMomentDetection } from "../hooks/useMomentDetection";

function getRouteProgress(route, position) {
  if (!route || !position) return 0;
  const line = turf.lineString(route.geometry.coordinates);
  const nearest = turf.nearestPointOnLine(line, turf.point(position), {
    units: "kilometers",
  });
  const total = turf.length(line, { units: "kilometers" });
  return total ? nearest.properties.location / total : 0;
}

export default function ActiveWalk() {
  const {
    activeRoute,
    setWalkPhase,
    triggeredMoments,
    triggerMoment,
  } = useWalk();
  const [paused, setPaused] = useState(false);
  const [note, setNote] = useState(null);
  const [progress, setProgress] = useState(0);
  const { position } = useGeolocation(activeRoute, !paused);
  const color = activeRoute ? STATE_COLORS[activeRoute.state] : "#7a9e8a";

  const handleMoment = useCallback(
    (moment) => {
      triggerMoment(moment.id);
      setNote(moment);
    },
    [triggerMoment],
  );

  const nearbyMoment = useMomentDetection({
    position,
    route: activeRoute,
    triggeredMoments,
    onMoment: handleMoment,
  });

  const displayLabel = useMemo(() => {
    return nearbyMoment?.label ?? activeRoute?.name ?? "";
  }, [activeRoute, nearbyMoment]);

  useEffect(() => {
    if (!activeRoute) {
      setWalkPhase("browse");
      return undefined;
    }
    const update = () => {
      const next = getRouteProgress(activeRoute, position);
      setProgress(next);
      if (next > 0.95) setWalkPhase("arrival");
    };
    update();
    const interval = window.setInterval(update, 10000);
    return () => window.clearInterval(interval);
  }, [activeRoute, position, setWalkPhase]);

  if (!activeRoute) return null;

  return (
    <main className={`map-screen active-walk ${paused ? "is-paused" : ""}`}>
      <MapView
        routes={[activeRoute]}
        activeRoute={activeRoute}
        userPosition={position}
        walking
      />
      <button
        type="button"
        className="pause-button"
        onClick={() => setPaused((current) => !current)}
      >
        {paused ? "Resume" : "Pause"}
      </button>
      {paused && <div className="pause-veil" aria-hidden="true" />}
      <section className="walk-card" style={{ "--state-color": color }}>
        <ProgressArc progress={progress} color={color} />
        <div>
          <p className="eyebrow">Current attention</p>
          <h1>{displayLabel}</h1>
        </div>
      </section>
      <CompanionNote note={note} onDismiss={() => setNote(null)} />
    </main>
  );
}
