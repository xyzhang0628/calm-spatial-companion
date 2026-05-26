function RouteCard({ route, isActive, onSelect, onBegin }) {
  return (
    <article
      className={`route-card ${isActive ? 'is-active' : ''}`}
      style={{ '--route-state-color': `var(--${route.state})` }}
      onClick={() => onSelect(route)}
    >
      <button
        type="button"
        className="route-card__select"
        aria-pressed={isActive}
        onClick={() => onSelect(route)}
      >
        <span className="route-card__meta">
          {route.duration_min} min · {route.state}
        </span>
        <h2>{route.name}</h2>
        <p>{route.tagline}</p>
        <div className="route-card__tags">
          {route.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      </button>

      {isActive && (
        <button type="button" className="begin-button" onClick={onBegin}>
          Begin this walk
        </button>
      )}
    </article>
  );
}

export default RouteCard;
