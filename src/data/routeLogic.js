import { routes } from './routes.js';

export const SPATIAL_PROFILES = {
  calm: {
    preferredQualities: ['shade', 'quietness', 'enclosure'],
    avoidQualities: ['openness', 'high_traffic'],
    geometryType: 'loop',
    pacingRhythm: 'slow-even',
    momentFocus: ['sensory', 'pause'],
    elevationProfile: 'flat',
    enclosurePreference: 'high',
  },
  grounded: {
    preferredQualities: ['texture', 'nature_presence', 'earthiness'],
    avoidQualities: ['smooth_surface', 'commercial'],
    geometryType: 'linear',
    pacingRhythm: 'rhythmic',
    momentFocus: ['sensory', 'threshold'],
    elevationProfile: 'gentle-climb',
    enclosurePreference: 'mixed',
  },
  open: {
    preferredQualities: ['openness', 'sky_visibility', 'long_sightlines'],
    avoidQualities: ['shade', 'enclosure'],
    geometryType: 'out-back',
    pacingRhythm: 'expansive',
    momentFocus: ['view', 'threshold'],
    elevationProfile: 'variable',
    enclosurePreference: 'low',
  },
  flowing: {
    preferredQualities: ['rhythm_continuity', 'even_grade', 'no_stops'],
    avoidQualities: ['steep_grade', 'forced_pause'],
    geometryType: 'loop',
    pacingRhythm: 'continuous',
    momentFocus: ['sensory', 'threshold'],
    elevationProfile: 'flat',
    enclosurePreference: 'mixed',
  },
};

export function scoreRoute(route, spatialState) {
  const profile = SPATIAL_PROFILES[spatialState];
  if (!profile) {
    return 0;
  }

  const total = profile.preferredQualities.reduce(
    (sum, quality) => sum + (route.qualities[quality] ?? 0),
    0,
  );

  return total / profile.preferredQualities.length;
}

export function getRoutesForState(state, duration_min) {
  const scoredRoutes = routes
    .filter((route) => route.state === state)
    .map((route) => ({ ...route, score: scoreRoute(route, state) }))
    .sort((a, b) => b.score - a.score);

  return scoredRoutes
    .filter((route) => Math.abs(route.duration_min - duration_min) <= 10)
    .slice(0, 2);
}
