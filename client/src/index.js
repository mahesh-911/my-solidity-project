import React from 'react';
import ReactDOM from 'react-dom/client';
import { default as App } from './App'; // Correct the path to the App.js file in src/services
import './App.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
