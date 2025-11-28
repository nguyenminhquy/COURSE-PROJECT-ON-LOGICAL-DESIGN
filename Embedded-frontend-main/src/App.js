// src/App.js
import React from 'react';
import AppRoutes from './routes';
import { GlobalProvider } from './services/globalContext';
function App() {
  return (
    <GlobalProvider>
      <AppRoutes />
    </GlobalProvider>
  );
}

export default App;
