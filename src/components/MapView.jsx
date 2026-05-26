import { useEffect, useMemo, useRef } from "react";
import Map, { Layer, Marker, Source } from "react-map-gl/mapbox";
import bbox from "@turf/bbox";
import { STATE_COLORS } from "../data/routes";
import { softenBaseMap } from "../utils/mapStyle";

const STYLE_URL = "mapbox://styles/mapbox/light-v11";
export default function MapView({
  routes,
  activeRoute,
  showMoments = false,
  userPosition,
  walking = false,
}) {
  const mapRef = useRef(null);
  const token = import.meta.env.VITE_MAPBOX_TOKEN;
  const displayedRoutes = walking && activeRoute ? [activeRoute] : routes;

  const routeData = useMemo(
    () => ({
      type: "FeatureCollection",
      features: displayedRoutes.map((route) => ({
        type: "Feature",
        properties: {
          id: route.id,
          color: STATE_COLORS[route.state],
          active: !activeRoute || activeRoute.id === route.id,
        },
        geometry: route.geometry,
      })),
    }),
    [activeRoute, displayedRoutes],
  );

  useEffect(() => {
    if (!activeRoute || !mapRef.current) return;
    const [minLng, minLat, maxLng, maxLat] = bbox(activeRoute.geometry);
    mapRef.current.fitBounds(
      [
        [minLng, minLat],
        [maxLng, maxLat],
      ],
      { padding: 80, duration: 800 },
    );
  }, [activeRoute]);

  if (!token) {
    return <div className="map-fallback">Add VITE_MAPBOX_TOKEN to .env.</div>;
  }

  return (
    <Map
      ref={mapRef}
      mapboxAccessToken={token}
      mapStyle={STYLE_URL}
      initialViewState={{
        longitude: -122.6765,
        latitude: 45.5231,
        zoom: 12,
      }}
      attributionControl={false}
      logoPosition="bottom-left"
      onLoad={(event) => softenBaseMap(event.target)}
      reuseMaps
    >
      <Source id="routes" type="geojson" data={routeData}>
        <Layer
          id="route-lines"
          type="line"
          paint={{
            "line-color": ["get", "color"],
            "line-width": 4,
            "line-opacity": walking
              ? 0.35
              : ["case", ["get", "active"], 0.6, 0.16],
          }}
          layout={{ "line-cap": "round", "line-join": "round" }}
        />
      </Source>
      {showMoments &&
        activeRoute?.moments.map((moment) => (
          <Marker
            key={moment.id}
            longitude={moment.coordinates[0]}
            latitude={moment.coordinates[1]}
            anchor="center"
          >
            <span
              className="moment-pulse"
              style={{ "--state-color": STATE_COLORS[activeRoute.state] }}
            />
          </Marker>
        ))}
      {userPosition && (
        <Marker longitude={userPosition[0]} latitude={userPosition[1]} anchor="center">
          <span className="user-dot" />
        </Marker>
      )}
    </Map>
  );
}
