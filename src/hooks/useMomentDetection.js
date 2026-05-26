import { useEffect, useMemo } from "react";
import * as turf from "@turf/turf";

export function useMomentDetection({
  position,
  route,
  triggeredMoments,
  onMoment,
}) {
  const nearbyMoment = useMemo(() => {
    if (!position || !route) return null;
    const userPoint = turf.point(position);

    return route.moments.reduce((closest, moment) => {
      const meters =
        turf.distance(userPoint, turf.point(moment.coordinates), {
          units: "kilometers",
        }) * 1000;
      if (meters > 70) return closest;
      if (!closest || meters < closest.distanceMeters) {
        return { ...moment, distanceMeters: meters };
      }
      return closest;
    }, null);
  }, [position, route]);

  useEffect(() => {
    if (!position || !route) return;
    const userPoint = turf.point(position);

    route.moments.forEach((moment) => {
      if (triggeredMoments.has(moment.id)) return;
      const meters =
        turf.distance(userPoint, turf.point(moment.coordinates), {
          units: "kilometers",
        }) * 1000;
      if (meters <= moment.trigger_radius_m) onMoment(moment);
    });
  }, [onMoment, position, route, triggeredMoments]);

  return nearbyMoment;
}
