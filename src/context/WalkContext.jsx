import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const WalkContext = createContext(null);

export function WalkProvider({ children }) {
  const [spatialState, setSpatialState] = useState(null);
  const [activeRoute, setActiveRoute] = useState(null);
  const [walkPhase, setWalkPhase] = useState('select');
  const [selectedDuration, setSelectedDuration] = useState(30);
  const [triggeredMoments, setTriggeredMoments] = useState(() => new Set());

  const addTriggeredMoment = useCallback((id) => {
    setTriggeredMoments((current) => {
      if (current.has(id)) {
        return current;
      }

      const next = new Set(current);
      next.add(id);
      return next;
    });
  }, []);

  const resetTriggeredMoments = useCallback(() => {
    setTriggeredMoments(new Set());
  }, []);

  const value = useMemo(
    () => ({
      spatialState,
      activeRoute,
      walkPhase,
      selectedDuration,
      triggeredMoments,
      setWalkPhase,
      setSpatialState,
      setActiveRoute,
      setSelectedDuration,
      addTriggeredMoment,
      resetTriggeredMoments,
    }),
    [
      spatialState,
      activeRoute,
      walkPhase,
      selectedDuration,
      triggeredMoments,
      addTriggeredMoment,
      resetTriggeredMoments,
    ],
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
