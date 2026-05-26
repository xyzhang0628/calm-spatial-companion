import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { WalkProvider } from './context/WalkContext.jsx';
import 'mapbox-gl/dist/mapbox-gl.css';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <WalkProvider>
      <App />
    </WalkProvider>
  </StrictMode>,
);
