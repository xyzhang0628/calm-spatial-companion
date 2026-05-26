import ActiveWalk from "./components/ActiveWalk";
import Arrival from "./components/Arrival";
import RouteDiscovery from "./components/RouteDiscovery";
import StateSelection from "./components/StateSelection";
import { WalkProvider, useWalk } from "./context/WalkContext";

function WalkExperience() {
  const { walkPhase } = useWalk();

  if (walkPhase === "browse") return <RouteDiscovery />;
  if (walkPhase === "walking") return <ActiveWalk />;
  if (walkPhase === "arrival") return <Arrival />;
  return <StateSelection />;
}

export default function App() {
  return (
    <WalkProvider>
      <WalkExperience />
    </WalkProvider>
  );
}
