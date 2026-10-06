import { useEffect, useMemo, useRef, useState } from 'react';
import { LIMITS, OBJECT_DEFINITIONS, SWATCHES } from './jelly/geometry.js';
import { createJellyScene } from './jelly/JellyScene.js';

const ADD_ITEMS = [
  ['gummy', 'Gummy bear'],
  ['pear', 'Pear slice'],
  ['cucumber', 'Cucumber'],
  ['watermelon', 'Watermelon'],
  ['orange', 'Orange'],
];

const TOOLBAR_ITEMS = [
  { id: 'hand', label: 'Hand', icon: 'H' },
  { id: 'split', label: 'Split', icon: '/' },
];

function App() {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const noticeTimer = useRef(0);
  const [tool, setTool] = useState('hand');
  const [paused, setPaused] = useState(false);
  const [slowMotion, setSlowMotion] = useState(false);
  const [stacked, setStacked] = useState(false);
  const [objectCount, setObjectCount] = useState(0);
  const [objectList, setObjectList] = useState([]);
  const [menu, setMenu] = useState(null);
  const [notice, setNotice] = useState('');
  const [stroke, setStroke] = useState(null);
  const [gpu, setGpu] = useState({ supported: true, checked: false });
  const [firmness, setFirmness] = useState(0.72);
  const [damping, setDamping] = useState(0.58);

  const selectedObject = useMemo(
    () => objectList.find((object) => object.id === menu?.id),
    [menu, objectList],
  );

  useEffect(() => {
    document.title = 'Jelly Study';
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return undefined;
    const scene = createJellyScene(canvasRef.current, {
      onObjectsChange: (payload) => {
        setObjectCount(payload.count);
        setObjectList(payload.objects);
        setStacked(payload.stacked);
      },
      onMenu: setMenu,
      onNotice: showNotice,
      onStroke: setStroke,
      onGpuStatus: (status) => setGpu({ ...status, checked: true }),
    });
    sceneRef.current = scene;
    return () => scene.dispose?.();
  }, []);

  useEffect(() => {
    sceneRef.current?.setFirmness(firmness);
  }, [firmness]);

  useEffect(() => {
    sceneRef.current?.setDamping(damping);
  }, [damping]);

  function showNotice(message) {
    setNotice(message);
    window.clearTimeout(noticeTimer.current);
    noticeTimer.current = window.setTimeout(() => setNotice(''), 3800);
  }

  function addItem(type) {
    setMenu(null);
    sceneRef.current?.addObject(type);
  }

  function chooseTool(nextTool) {
    if (!sceneRef.current?.setTool(nextTool)) return;
    setTool(nextTool);
    setMenu(null);
  }

  function togglePause() {
    const next = !paused;
    setPaused(next);
    sceneRef.current?.setPaused(next);
  }

  function toggleSlowMotion() {
    const next = !slowMotion;
    setSlowMotion(next);
    sceneRef.current?.setSlowMotion(next);
  }

  function toggleStack() {
    const next = sceneRef.current?.toggleStack();
    if (typeof next === 'boolean') {
      setStacked(next);
      if (next) setTool('hand');
    }
    setMenu(null);
  }

  function setCamera(view) {
    sceneRef.current?.setCameraPreset(view);
    setMenu(null);
  }

  function reset() {
    setTool('hand');
    setPaused(false);
    setSlowMotion(false);
    setMenu(null);
    sceneRef.current?.setPaused(false);
    sceneRef.current?.setSlowMotion(false);
    sceneRef.current?.resetScene();
  }

  const simulationUnavailable = gpu.checked && !gpu.supported;

  return (
    <main className="jelly-app" aria-label="Jelly Study 3D playground">
      <canvas
        ref={canvasRef}
        className="jelly-canvas"
        aria-label="Interactive 3D jelly fruit playground"
      />

      <section className="hero-copy" aria-hidden="true">
        <h1>
          <span>JELLY</span>
          <span>STUDY</span>
        </h1>
      </section>

      <header className="brand-bar">
        <span>Jelly Study</span>
        <span>Volumetric playground</span>
      </header>

      <section className="add-tray" aria-label="Add jelly item">
        <div className="add-tray__label">
          Add item <span aria-label={`${objectCount} objects in scene`}>{objectCount}/{LIMITS.maxObjects}</span>
        </div>
        <div className="fruit-pills">
          {ADD_ITEMS.map(([type, label]) => (
            <button
              key={type}
              type="button"
              className="pill-button"
              onClick={() => addItem(type)}
              disabled={simulationUnavailable || objectCount >= LIMITS.maxObjects}
              aria-label={`Add ${label}`}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <section className="study-note">
        <p>
          Drag empty space to orbit. Drag fruit to stretch real geometry. Split draws a cut plane; Stack pins each
          piece to a wooden toothpick while the jelly edge stays elastic.
        </p>
      </section>

      {simulationUnavailable && <StillPreview />}

      {stroke && (
        <svg className="stroke-guide" aria-hidden="true">
          <line x1={stroke.start.x} y1={stroke.start.y} x2={stroke.current.x} y2={stroke.current.y} />
        </svg>
      )}

      {notice && (
        <aside className="notice" role="status" aria-live="polite">
          {notice}
        </aside>
      )}

      {selectedObject && menu && (
        <div className="object-menu" style={{ left: menu.position.x, top: menu.position.y }}>
          <p>{OBJECT_DEFINITIONS[selectedObject.type]?.label ?? 'Jelly object'}</p>
          <div className="swatches" aria-label="Color swatches">
            {SWATCHES.map((color) => (
              <button
                key={color}
                type="button"
                className="swatch"
                style={{ '--swatch': color }}
                aria-label={`Recolor object ${color}`}
                onClick={() => sceneRef.current?.recolorObject(menu.id, color)}
              />
            ))}
          </div>
          <div className="object-menu__actions">
            <button type="button" onClick={() => sceneRef.current?.duplicateObject(menu.id)}>
              Duplicate
            </button>
            <button type="button" onClick={() => sceneRef.current?.removeObject(menu.id)}>
              Remove
            </button>
          </div>
        </div>
      )}

      <nav className="bottom-toolbar" aria-label="Jelly tools">
        <div className="tool-group" role="group" aria-label="Interaction tools">
          {TOOLBAR_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={tool === item.id ? 'is-active' : ''}
              onClick={() => chooseTool(item.id)}
              disabled={simulationUnavailable || (item.id === 'split' && stacked)}
              aria-pressed={tool === item.id}
              title={item.id === 'split' && stacked ? 'Unstack before splitting' : item.label}
            >
              <span aria-hidden="true">{item.icon}</span>
              {item.label}
            </button>
          ))}
          <button
            type="button"
            onClick={toggleStack}
            disabled={simulationUnavailable}
            aria-pressed={stacked}
            title={stacked ? 'Unstack pieces' : 'Stack pieces on a toothpick'}
          >
            <span aria-hidden="true">|</span>
            {stacked ? 'Unstack' : 'Stack'}
          </button>
        </div>

        <div className="tool-group" role="group" aria-label="Simulation controls">
          <button type="button" onClick={() => sceneRef.current?.shake()} disabled={simulationUnavailable || paused}>
            <span aria-hidden="true">~</span>
            Shake
          </button>
          <button type="button" onClick={reset} disabled={simulationUnavailable}>
            <span aria-hidden="true">R</span>
            Reset
          </button>
          <button type="button" onClick={togglePause} disabled={simulationUnavailable} aria-pressed={paused}>
            <span aria-hidden="true">{paused ? 'P' : 'II'}</span>
            {paused ? 'Resume' : 'Pause'}
          </button>
          <button type="button" onClick={toggleSlowMotion} disabled={simulationUnavailable} aria-pressed={slowMotion}>
            <span aria-hidden="true">1/4</span>
            Slow
          </button>
        </div>

        <div className="tool-group view-tools" role="group" aria-label="View controls">
          <button type="button" onClick={() => setCamera('front')} disabled={simulationUnavailable}>
            Front
          </button>
          <button type="button" onClick={() => setCamera('threeQuarter')} disabled={simulationUnavailable}>
            3/4
          </button>
          <button type="button" onClick={() => setCamera('side')} disabled={simulationUnavailable}>
            Side
          </button>
        </div>

        <div className="sliders" aria-label="Jelly feel controls">
          <label>
            Firmness
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={firmness}
              disabled={simulationUnavailable}
              onChange={(event) => setFirmness(Number(event.target.value))}
            />
          </label>
          <label>
            Damping
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={damping}
              disabled={simulationUnavailable}
              onChange={(event) => setDamping(Number(event.target.value))}
            />
          </label>
        </div>
      </nav>
    </main>
  );
}

function StillPreview() {
  return (
    <section className="still-preview" role="alert">
      <div className="still-preview__pear">
        <span />
      </div>
      <p>WebGL/GPU rendering is unavailable. Showing a labeled still preview; simulation controls are disabled.</p>
    </section>
  );
}

export default App;
