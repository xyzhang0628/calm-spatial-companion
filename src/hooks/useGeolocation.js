import { useEffect, useState } from "react";
import * as turf from "@turf/turf";

export function useGeolocation(route, enabled = true) {
  const [position, setPosition] = useState(() =>
    route?.geometry.coordinates[0] ?? null,
  );
  const [error, setError] = useState(null);
  const [isSimulated, setIsSimulated] = useState(false);

  useEffect(() => {
    if (!route) {
      setPosition(null);
      return undefined;
    }
    setPosition(route.geometry.coordinates[0]);
  }, [route]);

  useEffect(() => {
    if (!route || !enabled) return undefined;

    let watchId = null;
    let intervalId = null;
    let cancelled = false;
    const line = turf.lineString(route.geometry.coordinates);
    const totalKm = turf.length(line);

    const startSimulation = () => {
      if (intervalId || cancelled) return;
      setIsSimulated(true);
      let distanceKm = 0;
      const stepKm = Math.max(totalKm / 24, 0.035);
      setPosition(route.geometry.coordinates[0]);
      intervalId = window.setInterval(() => {
        distanceKm = Math.min(distanceKm + stepKm, totalKm);
        const next = turf.along(line, distanceKm);
        setPosition(next.geometry.coordinates);
      }, 3000);
    };

    if (!("geolocation" in navigator)) {
      setError("Geolocation unavailable; simulating the walk.");
      startSimulation();
      return () => {
        cancelled = true;
        if (intervalId) window.clearInterval(intervalId);
      };
    }

    watchId = navigator.geolocation.watchPosition(
      (result) => {
        if (cancelled) return;
        setError(null);
        setIsSimulated(false);
        setPosition([result.coords.longitude, result.coords.latitude]);
      },
      (geoError) => {
        if (cancelled) return;
        setError(geoError.message);
        startSimulation();
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 8000,
      },
    );

    return () => {
      cancelled = true;
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [enabled, route]);

  return { position, error, isSimulated };
}
