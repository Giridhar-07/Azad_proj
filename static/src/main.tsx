import './style.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './components/App';
import 'aos/dist/aos.css';

// Initialize React application
const root = ReactDOM.createRoot(
  document.getElementById('app') as HTMLElement
);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// Legacy TypeScript classes are now replaced by React components
// The Chatbot, AnimatedLogo, and other components are now React-based