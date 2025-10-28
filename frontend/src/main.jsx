import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

// 1. Make sure the AlertProvider is imported
import { AlertProvider } from './context/AlertContext';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      {/* 2. Make sure the provider WRAPS your <App /> component */}
      <AlertProvider>
        <App />
      </AlertProvider>
    </BrowserRouter>
  </React.StrictMode>
);
