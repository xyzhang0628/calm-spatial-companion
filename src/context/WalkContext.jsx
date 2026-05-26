import { createContext, useContext, useMemo, useState } from "react";

const WalkContext = createContext(null);

export function WalkProvider({ children }) {
  const [spatialState, setSpatialState] = useState(null);
  const [activeRoute, setActiveRoute] = useState(null);
  const [walkPhase, setWalkPhase] = useState("select");
  const [triggeredMoments, setTriggeredMoments] = useState(new Set());
  const [timePreference, setTimePreference] = useState(null);

  const triggerMoment = (momentId) => {
    setTriggeredMoments((current) => {
      if (current.has(momentId)) return current;
      const next = new Set(current);
      next.add(momentId);
      return next;
    });
  };

  const resetWalk = () => {
    setSpatialState(null);
    setActiveRoute(null);
    setWalkPhase("select");
    setTriggeredMoments(new Set());
    setTimePreference(null);
  };

  const value = useMemo(
    () => ({
      spatialState,
      setSpatialState,
      activeRoute,
      setActiveRoute,
      walkPhase,
      setWalkPhase,
      triggeredMoments,
      triggerMoment,
      resetWalk,
      timePreference,
      setTimePreference,
    }),
    [activeRoute, spatialState, timePreference, triggeredMoments, walkPhase],
  );

  return <WalkContext.Provider value={value}>{children}</WalkContext.Provider>;
}

export function useWalk() {
  const context = useContext(WalkContext);
  if (!context) {
    throw new Error("useWalk must be used inside WalkProvider");
  }
  return context;
}
