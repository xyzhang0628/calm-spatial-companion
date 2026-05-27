import { useEffect, useMemo, useRef, useState } from 'react';
import Map, { Layer, Marker, Source } from 'react-map-gl';
import mapboxgl from 'mapbox-gl/esm';
import { along, length, lineString } from '@turf/turf';
import { STATE_COLORS } from '../data/routes.js';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const INITIAL_VIEW_STATE = { longitude: -117.71, latitude: 34.102, zoom: 14.5, pitch: 0, bearing: 0 };
const routeFeature = (route) => ({ type: 'Feature', properties: { id: route.id }, geometry: route.geometry });
const lineLayout = { 'line-cap': 'round', 'line-join': 'round' };

function isNoisyLabel(layerId) {
  return (
    layerId.includes('poi-label') ||
    layerId.includes('transit-label') ||
    layerId.includes('airport-label') ||
    layerId.includes('settlement-subdivision-label')
  );
}

function softenMapStyle(map) {
  (map.getStyle()?.layers ?? []).forEach((layer) => {
    try {
      if (isNoisyLabel(layer.id)) {
        map.setLayoutProperty(layer.id, 'visibility', 'none');
        return;
      }

      if (layer.type === 'symbol') {
        if (layer.paint?.['text-color']) map.setPaintProperty(layer.id, 'text-color', '#74746f');
        if (layer.paint?.['text-halo-color']) map.setPaintProperty(layer.id, 'text-halo-color', '#ffffff');
        if (layer.paint?.['text-opacity']) map.setPaintProperty(layer.id, 'text-opacity', 0.82);
      }

      if (layer.type === 'fill' && layer.paint?.['fill-color']) {
        map.setPaintProperty(layer.id, 'fill-opacity', layer.id.includes('landuse') ? 0.45 : 0.72);
      }

      if (layer.type === 'line' && layer.paint?.['line-color']) {
        map.setPaintProperty(layer.id, 'line-color', '#d9d9d5');
        if (layer.paint?.['line-opacity']) map.setPaintProperty(layer.id, 'line-opacity', 0.58);
      }
    } catch {
      /* skip immutable base layer expressions */
    }
  });
}

function walkedFeature(route, progress) {
  if (!route || progress <= 0) return null;

  const coords = route.geometry.coordinates;
  const line = lineString(coords);
  const safeProgress = Math.min(progress, 1);
  const pointOnLine = along(line, length(line, { units: 'kilometers' }) * safeProgress, {
    units: 'kilometers',
  });
  const cutoff = Math.max(1, Math.floor(coords.length * safeProgress));

  return {
    type: 'Feature',
    properties: {},
    geometry: { type: 'LineString', coordinates: [...coords.slice(0, cutoff), pointOnLine.geometry.coordinates] },
  };
}

function MapView({ routes = [], activeRoute, position, progress = 0, mode = 'browse' }) {
  const mapRef = useRef(null);
  const [mapError, setMapError] = useState(null);
  const token = import.meta.env.VITE_MAPBOX_TOKEN;
  const stateColor = STATE_COLORS[activeRoute?.state] ?? STATE_COLORS.calm;
  const routeCollection = useMemo(
    () => ({ type: 'FeatureCollection', features: routes.map(routeFeature) }),
    [routes],
  );
  const activeFeature = useMemo(() => activeRoute && routeFeature(activeRoute), [activeRoute]);
  const walked = useMemo(() => walkedFeature(activeRoute, progress), [activeRoute, progress]);

  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map || !activeRoute) return;

    const first = activeRoute.geometry.coordinates[0];
    const bbox = activeRoute.geometry.coordinates.reduce(
      (bounds, coordinate) => bounds.extend(coordinate),
      new mapboxgl.LngLatBounds(first, first),
    );
    map.fitBounds(bbox, {
      padding:
        mode === 'browse'
          ? { top: 120, bottom: 280, left: 40, right: 40 }
          : { top: 120, bottom: 180, left: 48, right: 48 },
      duration: 800,
    });
  }, [activeRoute, mode]);

  if (!token || mapError) {
    return (
      <div className="map-fallback map-fallback--inline">
        <p>{mapError ? 'Mapbox could not load this map.' : 'Mapbox token is missing.'}</p>
      </div>
    );
  }

  return (
    <Map
      ref={mapRef}
      mapLib={mapboxgl}
      mapboxAccessToken={token}
      initialViewState={INITIAL_VIEW_STATE}
      mapStyle="mapbox://styles/mapbox/light-v11"
      attributionControl={false}
      dragRotate={false}
      touchPitch={false}
      onLoad={(event) => softenMapStyle(event.target)}
      onError={(event) => setMapError(event.error ?? new Error('Mapbox failed to load'))}
    >
      <Source id="routes" type="geojson" data={routeCollection}>
        <Layer
          id="routes-faint"
          type="line"
          paint={{ 'line-color': stateColor, 'line-width': 1, 'line-opacity': 0.15 }}
          layout={lineLayout}
        />
      </Source>

      {activeFeature && (
        <Source id="active-route" type="geojson" data={activeFeature}>
          <Layer
            id="active-route-line"
            type="line"
            paint={{
              'line-color': stateColor,
              'line-width': mode === 'browse' ? 4 : 3,
              'line-opacity': mode === 'browse' ? 0.7 : 0.5,
            }}
            layout={lineLayout}
          />
        </Source>
      )}

      {walked && (
        <Source id="walked-route" type="geojson" data={walked}>
          <Layer
            id="walked-route-line"
            type="line"
            paint={{ 'line-color': stateColor, 'line-width': 3, 'line-opacity': 0.7 }}
            layout={lineLayout}
          />
        </Source>
      )}

      {mode === 'browse' &&
        activeRoute?.moments.map((moment) => (
          <Marker
            key={moment.id}
            longitude={moment.coordinates[0]}
            latitude={moment.coordinates[1]}
            anchor="bottom"
          >
            <div className="moment-checkpoint" aria-label={moment.label}>
              <span className="moment-marker" />
              <span className="moment-marker__label">{moment.prompt ?? moment.label}</span>
            </div>
          </Marker>
        ))}

      {position && (
        <Marker longitude={position[0]} latitude={position[1]} anchor="center">
          <span className="user-marker" aria-label="Current location" />
        </Marker>
      )}
    </Map>
  );
}

export default MapView;
