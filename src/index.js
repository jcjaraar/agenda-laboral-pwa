// src/index.js - VERSIÓN SUPER SIMPLE
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js');
  });
}

// ⚠️ Elimina también la línea de reportWebVitals si existe:
// import reportWebVitals from './reportWebVitals';
// reportWebVitals();