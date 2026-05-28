import { SPATIAL_LAYERS } from '../data/spatialLayers.js';

function RouteCard({ route, isActive, onSelect, onBegin }) {
  const layer = SPATIAL_LAYERS[route.id];

  return (
    <article
      className={`route-card ${isActive ? 'is-active' : ''}`}
      onClick={() => onSelect(route)}
    >
      <button type="button" className="route-card__select" aria-pressed={isActive}>
        <div className="route-card__top">
          <h2>{route.name}</h2>
          <span className="route-card__meta-pills">
            {layer?.m.neighborhoodRhythm && (
              <span className="route-card__rhythm">{layer.m.neighborhoodRhythm}</span>
            )}
            <span className="route-card__duration">{route.duration_min} min</span>
          </span>
        </div>
        <p className="route-card__tagline">{route.tagline}</p>
        {layer?.s.pathDescriptor && (
          <p className="route-card__path-descriptor">{layer.s.pathDescriptor}</p>
        )}
        <div className="route-card__tags">
          {route.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
        <div className="route-card__indicators" aria-label="Spatial qualities">
          {route.spatial_indicators.map((indicator) => (
            <span key={indicator}>{indicator}</span>
          ))}
        </div>
      </button>

      {isActive && (
        <button
          type="button"
          className="begin-button"
          onClick={(event) => {
            event.stopPropagation();
            onBegin();
          }}
        >
          Begin this walk
        </button>
      )}
    </article>
  );
}

export default RouteCard;
