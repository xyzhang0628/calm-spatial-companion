import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TOKEN = readFileSync(join(__dirname, '..', '.env'), 'utf8')
  .match(/VITE_MAPBOX_TOKEN=(.+)/)?.[1]?.trim();

if (!TOKEN) {
  console.error('Could not read VITE_MAPBOX_TOKEN from .env');
  process.exit(1);
}

const routesPath = join(__dirname, '..', 'src', 'data', 'routes.js');
const routesSrc = readFileSync(routesPath, 'utf8');

const routeWaypoints = [
  {
    id: 'the-canopy-corridor',
    coords: [
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
  {
    id: 'the-garden-threshold',
    coords: [
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
  {
    id: 'the-open-edge',
    coords: [
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
  {
    id: 'the-flow-line',
    coords: [
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
];

async function fetchDirections(waypoints) {
  const coordStr = waypoints.map(([lng, lat]) => `${lng},${lat}`).join(';');
  const url = `https://api.mapbox.com/directions/v5/mapbox/walking/${coordStr}?geometries=geojson&overview=full&access_token=${TOKEN}`;

  const resp = await fetch(url);
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Directions API error ${resp.status}: ${text}`);
  }

  const data = await resp.json();
  if (!data.routes || data.routes.length === 0) {
    throw new Error('No routes returned from Directions API');
  }

  return data.routes[0].geometry.coordinates;
}

async function main() {
  const results = {};

  for (const route of routeWaypoints) {
    console.log(`Fetching directions for: ${route.id}`);
    const coords = await fetchDirections(route.coords);
    results[route.id] = coords;
    console.log(`  Got ${coords.length} points (was ${route.coords.length})`);
    await new Promise((r) => setTimeout(r, 500));
  }

  writeFileSync(
    join(__dirname, 'route-geometries.json'),
    JSON.stringify(results, null, 2),
  );
  console.log('\nSaved to scripts/route-geometries.json');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
