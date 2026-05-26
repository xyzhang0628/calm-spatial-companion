import { STATE_COLORS } from "../data/routes";
import { useWalk } from "../context/WalkContext";

const CLOSING_LINES = {
  calm: "Let the quiet you found keep walking with you.",
  grounded: "The ground remains available, even after the route ends.",
  open: "Carry this wider room into the next threshold.",
  flowing: "Something in you already knows how to keep moving softly.",
};

export default function Arrival() {
  const { spatialState, activeRoute, resetWalk } = useWalk();
  const color = STATE_COLORS[spatialState] ?? "#7a9e8a";

  const saveRoute = () => {
    if (!activeRoute) return;
    const saved = JSON.parse(localStorage.getItem("savedRoutes") ?? "[]");
    const next = [...new Set([...saved, activeRoute.id])];
    localStorage.setItem("savedRoutes", JSON.stringify(next));
  };

  return (
    <main className="arrival" style={{ "--state-color": color }}>
      <section className="arrival__inner">
        <p className="eyebrow">Arrival</p>
        <h1>{CLOSING_LINES[spatialState]}</h1>
        <div className="arrival__actions">
          <button type="button" onClick={saveRoute}>
            Save this route
          </button>
          <button type="button" onClick={resetWalk}>
            Walk again
          </button>
        </div>
      </section>
    </main>
  );
}
