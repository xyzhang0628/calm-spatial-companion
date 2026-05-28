export const SPATIAL_LAYERS = {
  'blaisdell-canopy-lollipop': {
    routeId: 'blaisdell-canopy-lollipop',
    xs: [
      {
        momentId: 'blaisdell-canopy-close',
        prompt: 'The shade arrives before the intersection; footsteps soften under the Blaisdell trees.',
        scale: 'xs',
      },
      {
        momentId: 'scripps-wall-cool',
        prompt: 'Cooler air gathers along the Mills edge where tree shade and wall shade overlap.',
        scale: 'xs',
      },
      {
        momentId: 'narrow-campus-connector',
        prompt: 'The straightaway holds a steady pace; leaf sound sits close to the street.',
        scale: 'xs',
      },
      {
        momentId: 'blaisdell-return-shade',
        prompt: 'The same canopy returns overhead, and the surface feels even underfoot.',
        scale: 'xs',
      },
    ],
    s: {
      pathCharacter: 'tree corridor',
      pathDescriptor: 'A tree-walled corridor that keeps the walk close to shade and residential quiet.',
    },
    m: {
      neighborhoodRhythm: 'quiet residential',
      rhythmNote: 'The rhythm here is set by tree-lined blocks and college edges, not through traffic.',
    },
    l: {
      landscapeTransition: 'campus edge to residential canopy',
      transitionNote:
        'You moved along the seam where the colleges soften into the residential canopy north of campus.',
    },
  },
  'scripps-walled-garden-loop': {
    routeId: 'scripps-walled-garden-loop',
    xs: [
      {
        momentId: 'scripps-garden-threshold',
        prompt: 'The path tucks behind Scripps walls; sound becomes smaller at the garden edge.',
        scale: 'xs',
      },
      {
        momentId: 'walled-path-coolness',
        prompt: 'Stone and planting hold a cooler strip of air beside the walkway.',
        scale: 'xs',
      },
      {
        momentId: 'scripps-court-narrowing',
        prompt: 'The path narrows near East 9th, and each footfall lands closer to the building face.',
        scale: 'xs',
      },
      {
        momentId: 'quiet-scripps-return',
        prompt: 'The return line stays sheltered; the garden edge keeps street noise at a distance.',
        scale: 'xs',
      },
    ],
    s: {
      pathCharacter: 'walled garden loop',
      pathDescriptor: 'A walled campus loop where paths fold between garden edges and quiet service lanes.',
    },
    m: {
      neighborhoodRhythm: 'garden transition',
      rhythmNote: 'The pace here is set by students, gardeners, and shaded thresholds between colleges.',
    },
    l: {
      landscapeTransition: 'institutional fabric',
      transitionNote:
        'This route held you inside the college garden fabric, moving from walls to paths to shaded campus edges.',
    },
  },
  'lower-wilderness-root-line': {
    routeId: 'lower-wilderness-root-line',
    xs: [
      {
        momentId: 'wilderness-pavement-ends',
        prompt: 'The hard edge of the city gives way to rougher ground at the lower Wilderness approach.',
        scale: 'xs',
      },
      {
        momentId: 'roots-lift-path',
        prompt: 'The surface rises in small breaks; the feet meet edges instead of a smooth plane.',
        scale: 'xs',
      },
      {
        momentId: 'lower-trail-grade',
        prompt: 'The grade is mild but present, showing up first in the calves.',
        scale: 'xs',
      },
      {
        momentId: 'chaparral-edge-return',
        prompt: 'Dry chaparral air sits near the trail edge, sharper than the campus blocks below.',
        scale: 'xs',
      },
    ],
    s: {
      pathCharacter: 'lower trail line',
      pathDescriptor: 'A soil-edged line where the built city starts to loosen into foothill trail.',
    },
    m: {
      neighborhoodRhythm: 'trail approach',
      rhythmNote: 'Up here, the rhythm is set by the trail edge and foothill grade, not other people.',
    },
    l: {
      landscapeTransition: 'city to mountain edge',
      transitionNote:
        'You walked the seam between Claremont streets and the mountain wilderness most people only approach by car.',
    },
  },
  'padua-hills-aggregate-arc': {
    routeId: 'padua-hills-aggregate-arc',
    xs: [
      {
        momentId: 'padua-aggregate-start',
        prompt: 'Aggregate texture comes through the shoes as the Foothill edge begins.',
        scale: 'xs',
      },
      {
        momentId: 'padua-climb-arc',
        prompt: 'The Airport Drive rise changes the pace without breaking it.',
        scale: 'xs',
      },
      {
        momentId: 'padua-chaparral-edge',
        prompt: 'Dry planting and open soil make the air feel rougher on this side.',
        scale: 'xs',
      },
      {
        momentId: 'padua-flat-return',
        prompt: 'The return flattens out, and the surface steadies beneath each step.',
        scale: 'xs',
      },
    ],
    s: {
      pathCharacter: 'textured climb arc',
      pathDescriptor: 'A Foothill-to-Airport arc where pavement texture and a small rise shape the walk.',
    },
    m: {
      neighborhoodRhythm: 'foothill margin',
      rhythmNote: 'This edge moves at service-road pace: sparse, practical, and close to dry planting.',
    },
    l: {
      landscapeTransition: 'urban road to foothill margin',
      transitionNote:
        'You moved from Foothill’s broad street line into the drier margin below the hills.',
    },
  },
  'foothill-mountain-sightline': {
    routeId: 'foothill-mountain-sightline',
    xs: [
      {
        momentId: 'foothill-buildings-step-back',
        prompt: 'The sidewalk opens as buildings step back from Foothill and the sky widens.',
        scale: 'xs',
      },
      {
        momentId: 'foothill-mountain-line',
        prompt: 'The mountain line stays north of the path, visible across the whole stretch.',
        scale: 'xs',
      },
      {
        momentId: 'foothill-widest-point',
        prompt: 'The broadest part of the route leaves more air around the body than the campus streets.',
        scale: 'xs',
      },
    ],
    s: {
      pathCharacter: 'open sightline',
      pathDescriptor: 'A wide Foothill sightline that keeps the San Gabriel range in peripheral view.',
    },
    m: {
      neighborhoodRhythm: 'wide street edge',
      rhythmNote: 'The pace is longer here, stretched by traffic spacing, low buildings, and mountain view.',
    },
    l: {
      landscapeTransition: 'campus to mountain-facing corridor',
      transitionNote:
        'You moved from the college edge into a mountain-facing street corridor with wider sky.',
    },
  },
  'padua-open-sky-approach': {
    routeId: 'padua-open-sky-approach',
    xs: [
      {
        momentId: 'padua-low-buildings',
        prompt: 'Low rooflines leave the sky exposed on both sides of Foothill.',
        scale: 'xs',
      },
      {
        momentId: 'padua-wide-arc',
        prompt: 'The long Foothill line keeps the horizon steady while the feet stay on even pavement.',
        scale: 'xs',
      },
      {
        momentId: 'padua-far-vista',
        prompt: 'At the far point, the street feels widest and the mountain edge sits in the distance.',
        scale: 'xs',
      },
    ],
    s: {
      pathCharacter: 'wide avenue out-and-back',
      pathDescriptor: 'A long open avenue route where sky and distance dominate the path.',
    },
    m: {
      neighborhoodRhythm: 'open arterial edge',
      rhythmNote: 'The rhythm is stretched by long blocks, low buildings, and the east-west pull of Foothill.',
    },
    l: {
      landscapeTransition: 'open city edge',
      transitionNote:
        'You followed the city’s open northern edge, where the built grid faces the mountains.',
    },
  },
  'village-memorial-even-loop': {
    routeId: 'village-memorial-even-loop',
    xs: [
      {
        momentId: 'village-loop-curves',
        prompt: 'The Village block turns without asking for a stop; the curb keeps the pace round.',
        scale: 'xs',
      },
      {
        momentId: 'memorial-park-perimeter',
        prompt: 'The park edge smooths the corner, and the ground stays even underfoot.',
        scale: 'xs',
      },
      {
        momentId: 'village-no-interrupt',
        prompt: 'This straight stretch has few interruptions, so the steps begin to space themselves.',
        scale: 'xs',
      },
      {
        momentId: 'second-st-rhythm',
        prompt: 'Second Street brings a small Village pulse back into the walk.',
        scale: 'xs',
      },
    ],
    s: {
      pathCharacter: 'even village loop',
      pathDescriptor: 'A connected loop where short Village blocks and park edges do most of the navigation.',
    },
    m: {
      neighborhoodRhythm: 'village linger',
      rhythmNote: 'The Village rhythm mixes errand pace with lingering. Both are allowed here.',
    },
    l: {
      landscapeTransition: 'commercial edge to park loop',
      transitionNote:
        'The loop returned you to the same place, but the Village rhythm has settled into your pace.',
    },
  },
  'five-college-continuous-circuit': {
    routeId: 'five-college-continuous-circuit',
    xs: [
      {
        momentId: 'college-circuit-start',
        prompt: 'The connector path takes over near East 9th, and the route begins to steer itself.',
        scale: 'xs',
      },
      {
        momentId: 'college-loop-settles',
        prompt: 'The north campus edge keeps an even width, and the pace settles into the path.',
        scale: 'xs',
      },
      {
        momentId: 'college-circuit-open-lawn',
        prompt: 'Dartmouth and Platt open the loop briefly toward lawn and sky.',
        scale: 'xs',
      },
      {
        momentId: 'college-circuit-unbroken',
        prompt: 'East 9th carries the return in a straight, unbroken line.',
        scale: 'xs',
      },
    ],
    s: {
      pathCharacter: 'college connector circuit',
      pathDescriptor: 'A campus circuit stitched from connector paths, service lanes, and flat college edges.',
    },
    m: {
      neighborhoodRhythm: 'student flow',
      rhythmNote: 'The pace here is set by students moving between colleges, not commuters.',
    },
    l: {
      landscapeTransition: 'five-college fabric',
      transitionNote:
        'You moved through the institutional fabric of the colleges, returning by the same quiet connector network.',
    },
  },
};

export const XL_QUESTIONS = {
  calm: 'Where do people go to feel held?',
  grounded: 'Where does the city slow down and touch the earth?',
  open: 'Where does the city breathe?',
  flowing: 'Where does movement stop feeling like effort?',
};
