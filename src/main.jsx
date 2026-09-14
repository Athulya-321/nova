import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { NovaProvider } from './context/NovaContext.jsx';

import './styles/global.css';
import './styles/starways.css';
import './styles/nova.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <NovaProvider>
      <App />
    </NovaProvider>
  </React.StrictMode>,
);
