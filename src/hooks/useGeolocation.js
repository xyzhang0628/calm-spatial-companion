import { useEffect, useMemo, useState } from 'react';
import { along, length, lineString } from '@turf/turf';

const SIMULATED_WALK_STEPS = 20;
const SIMULATED_WALK_INTERVAL_MS = 1000;

function firstCoordinate(route) {
  return route?.geometry?.coordinates?.[0] ?? null;
}

export function useGeolocation(activeRoute, { enabled = true, useRealLocation = false } = {}) {
  const [position, setPosition] = useState(() => firstCoordinate(activeRoute));
  const [isSimulated, setIsSimulated] = useState(true);
  const routeLine = useMemo(
    () => (activeRoute ? lineString(activeRoute.geometry.coordinates) : null),
    [activeRoute],
  );

  useEffect(() => {
    setPosition(firstCoordinate(activeRoute));
  }, [activeRoute]);

  useEffect(() => {
    if (!enabled || !activeRoute || !routeLine) {
      return undefined;
    }

    if (useRealLocation && navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (event) => {
          setIsSimulated(false);
          setPosition([event.coords.longitude, event.coords.latitude]);
        },
        () => setIsSimulated(true),
        { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 },
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }

    setIsSimulated(true);
    let step = 0;
    const totalKm = length(routeLine, { units: 'kilometers' });
    const tick = () => {
      const ratio = Math.min(step / SIMULATED_WALK_STEPS, 1);
      const nextPoint = along(routeLine, totalKm * ratio, { units: 'kilometers' });
      setPosition(nextPoint.geometry.coordinates);
      step += 1;
    };

    tick();
    const timer = window.setInterval(tick, SIMULATED_WALK_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [activeRoute, enabled, routeLine, useRealLocation]);

  return { position, isSimulated };
}
