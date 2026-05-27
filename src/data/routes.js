export const STATE_COLORS = {
  calm: '#7a9e8a',
  grounded: '#8a7a6a',
  open: '#6a8fa0',
  flowing: '#8a8aaa',
};

export const routes = [
  {
    id: 'the-canopy-corridor',
    name: 'The Canopy Corridor',
    state: 'calm',
    duration_min: 30,
    tagline: 'A shaded Pomona loop through Marston Quad and old campus paths.',
    tags: ['Marston Quad', 'deep shade', 'campus paths'],
    qualities: {
      shade: 0.9,
      quietness: 0.82,
      openness: 0.42,
      rhythm_continuity: 0.7,
      nature_presence: 0.78,
    },
    geometry: {
      type: 'LineString',
      coordinates: [
        [-117.7156, 34.0987],
        [-117.7147, 34.0993],
        [-117.7138, 34.0999],
        [-117.713, 34.1005],
        [-117.712, 34.1002],
        [-117.7115, 34.0994],
        [-117.7119, 34.0986],
        [-117.713, 34.098],
        [-117.7143, 34.0981],
        [-117.7154, 34.0985],
        [-117.7156, 34.0987],
      ],
    },
    moments: [
      {
        id: 'marston-quad-canopy',
        label: 'Marston canopy',
        coordinates: [-117.7138, 34.0999],
        trigger_radius_m: 25,
        companion_note:
          'The tree crowns gather over the quad and break the light into smaller pieces. Sound settles into the grass before it reaches the walkway.',
        type: 'sensory',
      },
      {
        id: 'pomona-arcade-edge',
        label: 'Arcade edge',
        coordinates: [-117.7119, 34.0986],
        trigger_radius_m: 25,
        companion_note:
          'A line of buildings makes a narrow sheltered edge here. The path briefly trades open lawn for shade, wall, and footsteps.',
        type: 'threshold',
      },
      {
        id: 'college-way-return',
        label: 'College Way return',
        coordinates: [-117.7154, 34.0985],
        trigger_radius_m: 25,
        companion_note:
          'The loop returns beside older trees and slow campus crossings. Notice how the canopy makes the street feel narrower than it is.',
        type: 'pause',
      },
    ],
  },
  {
    id: 'the-garden-threshold',
    name: 'The Garden Threshold',
    state: 'grounded',
    duration_min: 30,
    tagline: 'Stone, planting beds, and quiet Scripps courtyards underfoot.',
    tags: ['Scripps gardens', 'stone paths', 'courtyards'],
    qualities: {
      shade: 0.76,
      quietness: 0.88,
      openness: 0.38,
      rhythm_continuity: 0.62,
      nature_presence: 0.86,
    },
    geometry: {
      type: 'LineString',
      coordinates: [
        [-117.7106, 34.103],
        [-117.71, 34.1037],
        [-117.7091, 34.1042],
        [-117.708, 34.1044],
        [-117.7068, 34.104],
        [-117.7064, 34.1032],
        [-117.7069, 34.1025],
        [-117.708, 34.1023],
        [-117.7093, 34.1025],
        [-117.7104, 34.1028],
        [-117.7106, 34.103],
      ],
    },
    moments: [
      {
        id: 'scripps-garden-wall',
        label: 'Garden wall',
        coordinates: [-117.71, 34.1037],
        trigger_radius_m: 25,
        companion_note:
          'Low walls and planted edges hold the path close to the ground. The surface changes from open walk to garden threshold.',
        type: 'threshold',
      },
      {
        id: 'courtyard-stone',
        label: 'Courtyard stone',
        coordinates: [-117.708, 34.1044],
        trigger_radius_m: 25,
        companion_note:
          'Stone, soil, and clipped planting make a compact room outside. Each step has a slightly different texture beneath it.',
        type: 'sensory',
      },
      {
        id: 'scripps-east-garden',
        label: 'East garden turn',
        coordinates: [-117.7069, 34.1025],
        trigger_radius_m: 25,
        companion_note:
          'The turn opens to a smaller garden edge, then closes again near the buildings. The route gathers itself through texture rather than distance.',
        type: 'pause',
      },
    ],
  },
  {
    id: 'the-open-edge',
    name: 'The Open Edge',
    state: 'open',
    duration_min: 30,
    tagline: 'A CMC circuit of open lawns, broader walks, and sky exposure.',
    tags: ['open lawns', 'wide walks', 'sky view'],
    qualities: {
      shade: 0.32,
      quietness: 0.58,
      openness: 0.92,
      rhythm_continuity: 0.72,
      nature_presence: 0.54,
    },
    geometry: {
      type: 'LineString',
      coordinates: [
        [-117.7089, 34.1006],
        [-117.7077, 34.1009],
        [-117.7064, 34.1012],
        [-117.7054, 34.1018],
        [-117.7048, 34.1026],
        [-117.7053, 34.1033],
        [-117.7065, 34.1034],
        [-117.7078, 34.1029],
        [-117.7088, 34.102],
        [-117.7092, 34.1012],
        [-117.7089, 34.1006],
      ],
    },
    moments: [
      {
        id: 'cmc-lawn-margin',
        label: 'Lawn margin',
        coordinates: [-117.7077, 34.1009],
        trigger_radius_m: 25,
        companion_note:
          'The lawn pulls the view outward and leaves more sky above the path. Buildings sit back from the edge instead of pressing in.',
        type: 'view',
      },
      {
        id: 'columbia-open-crossing',
        label: 'Open crossing',
        coordinates: [-117.7054, 34.1018],
        trigger_radius_m: 25,
        companion_note:
          'The walkway meets a wider street rhythm here. Pavement, curb, and low campus edges make a longer horizontal line.',
        type: 'threshold',
      },
      {
        id: 'north-lawn-sky',
        label: 'North lawn sky',
        coordinates: [-117.7065, 34.1034],
        trigger_radius_m: 25,
        companion_note:
          'The northern edge gives the sky more room between rooflines. The path reads as a clear line across open grass.',
        type: 'sensory',
      },
    ],
  },
  {
    id: 'the-flow-line',
    name: 'The Flow Line',
    state: 'flowing',
    duration_min: 30,
    tagline: 'A continuous Harvey Mudd path across north campus edges.',
    tags: ['north campus', 'long paths', 'steady turns'],
    qualities: {
      shade: 0.52,
      quietness: 0.66,
      openness: 0.58,
      rhythm_continuity: 0.9,
      nature_presence: 0.56,
    },
    geometry: {
      type: 'LineString',
      coordinates: [
        [-117.7102, 34.1063],
        [-117.709, 34.1066],
        [-117.7076, 34.1065],
        [-117.7064, 34.106],
        [-117.7057, 34.1052],
        [-117.7061, 34.1044],
        [-117.7074, 34.104],
        [-117.7089, 34.1042],
        [-117.71, 34.1048],
        [-117.7107, 34.1056],
        [-117.7102, 34.1063],
      ],
    },
    moments: [
      {
        id: 'mudd-north-straightaway',
        label: 'North straightaway',
        coordinates: [-117.709, 34.1066],
        trigger_radius_m: 25,
        companion_note:
          'The path runs nearly straight along the north campus edge. Repeating trees and building lines set an even cadence.',
        type: 'sensory',
      },
      {
        id: 'lab-building-gap',
        label: 'Building gap',
        coordinates: [-117.7064, 34.106],
        trigger_radius_m: 25,
        companion_note:
          'A gap between buildings briefly opens the route before it narrows again. The line of travel stays continuous through the change.',
        type: 'threshold',
      },
      {
        id: 'mudd-return-curve',
        label: 'Return curve',
        coordinates: [-117.71, 34.1048],
        trigger_radius_m: 25,
        companion_note:
          'The return curve carries the walkway back without a hard stop. Corners, ramps, and crossings join into one longer motion.',
        type: 'pause',
      },
    ],
  },
];
