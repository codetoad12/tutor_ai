import React from 'react';
import ReactDOM from 'react-dom/client';
import DailyBrief from './components/DailyBrief';
import './styles.css';

// Create root element and render the DailyBrief component
const root = ReactDOM.createRoot(document.getElementById('app'));
root.render(
  <React.StrictMode>
    <DailyBrief />
  </React.StrictMode>
); 