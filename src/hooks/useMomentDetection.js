import { useEffect } from 'react';
import { distance, point } from '@turf/turf';

export function useMomentDetection({
  activeRoute,
  position,
  triggeredMoments,
  onMoment,
  enabled = true,
}) {
  useEffect(() => {
    if (!enabled || !activeRoute || !position) {
      return;
    }

    activeRoute.moments.forEach((moment) => {
      if (triggeredMoments.has(moment.id)) {
        return;
      }

      const metersAway = distance(point(position), point(moment.coordinates), {
        units: 'meters',
      });

      if (metersAway < moment.trigger_radius_m) {
        onMoment(moment);
      }
    });
  }, [activeRoute, enabled, onMoment, position, triggeredMoments]);

  return triggeredMoments;
}
