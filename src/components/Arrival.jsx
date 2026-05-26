import { motion } from 'framer-motion';
import { useWalk } from '../context/WalkContext.jsx';

function Arrival() {
  const { activeRoute, setActiveRoute, setSpatialState, setWalkPhase } = useWalk();

  function handleWalkAgain() {
    setSpatialState(null);
    setActiveRoute(null);
    setWalkPhase('select');
  }

  function handleSaveRoute() {
    console.log('Saved route:', activeRoute);
  }

  return (
    <section className="screen arrival">
      <motion.div
        className="arrival__content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        <h1>You've arrived.</h1>
        <div className="arrival__actions">
          <button type="button" className="primary-action" onClick={handleWalkAgain}>
            Walk again
          </button>
          <button type="button" className="secondary-action" onClick={handleSaveRoute}>
            Save route
          </button>
        </div>
      </motion.div>
    </section>
  );
}

export default Arrival;
