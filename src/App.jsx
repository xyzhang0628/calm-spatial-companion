import ActiveWalk from './components/ActiveWalk.jsx';
import Arrival from './components/Arrival.jsx';
import RouteDiscovery from './components/RouteDiscovery.jsx';
import StateSelection from './components/StateSelection.jsx';
import { useWalk } from './context/WalkContext.jsx';

function App() {
  const { walkPhase } = useWalk();

  return (
    <main className="app-shell" aria-live="polite">
      {walkPhase === 'select' && <StateSelection />}
      {walkPhase === 'browse' && <RouteDiscovery />}
      {walkPhase === 'walking' && <ActiveWalk />}
      {walkPhase === 'arrival' && <Arrival />}
    </main>
  );
}

export default App;
