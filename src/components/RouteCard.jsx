function RouteCard({ route, isActive, onSelect, onBegin }) {
  return (
    <article
      className={`route-card ${isActive ? 'is-active' : ''}`}
      onClick={() => onSelect(route)}
    >
      <button type="button" className="route-card__select" aria-pressed={isActive}>
        <div className="route-card__top">
          <h2>{route.name}</h2>
          <span className="route-card__duration">{route.duration_min} min</span>
        </div>
        <p className="route-card__tagline">{route.tagline}</p>
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
