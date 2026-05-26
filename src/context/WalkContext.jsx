import { createContext, useContext, useMemo, useState } from 'react';

const WalkContext = createContext(null);

export function WalkProvider({ children }) {
  const [spatialState, setSpatialState] = useState(null);
  const [activeRoute, setActiveRoute] = useState(null);
  const [walkPhase, setWalkPhase] = useState('select');

  const value = useMemo(
    () => ({
      spatialState,
      activeRoute,
      walkPhase,
      setWalkPhase,
      setSpatialState,
      setActiveRoute,
    }),
    [spatialState, activeRoute, walkPhase],
  );

  return <WalkContext.Provider value={value}>{children}</WalkContext.Provider>;
}

export function useWalk() {
  const context = useContext(WalkContext);

  if (!context) {
    throw new Error('useWalk must be used within a WalkProvider');
  }

  return context;
}
