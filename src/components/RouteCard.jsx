import { motion } from "framer-motion";
import { STATE_COLORS } from "../data/routes";

export default function RouteCard({ route, isActive, onSelect, onBegin }) {
  const color = STATE_COLORS[route.state];

  return (
    <motion.article
      className={`route-card ${isActive ? "route-card--active" : ""}`}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") onSelect();
      }}
      style={{ "--state-color": color }}
      layout
    >
      <div className="route-card__meta">
        <span>{route.duration_min} min</span>
      </div>
      <h2>{route.name}</h2>
      <p>{route.tagline}</p>
      <div className="route-card__tags">
        {route.tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
      {isActive && (
        <motion.button
          type="button"
          className="primary-action"
          onClick={(event) => {
            event.stopPropagation();
            onBegin();
          }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          Begin this walk
        </motion.button>
      )}
    </motion.article>
  );
}
