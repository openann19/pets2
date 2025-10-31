import React from 'react'
import { logger } from '@pawfectmatch/core';
;
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// ----- DEV AUTH BYPASS -----
if (process.env.NODE_ENV === 'development') {
  const stored = localStorage.getItem('accessToken');
  if (!stored) {
    // Pre-generated demo tokens from backend (valid for 24h)
    localStorage.setItem('accessToken', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGQ1MzYxZTU3ZGVmZGFhNzZmYzNjM2YiLCJpYXQiOjE3NTg4MDM0ODYsImV4cCI6MTc1OTQwODI4Nn0.uw2KH-77AuozUVbuleO07UAX0sBBeZZ6S6g0_5srV-I');
    localStorage.setItem('refreshToken', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGQ1MzYxZTU3ZGVmZGFhNzZmYzNjM2YiLCJpYXQiOjE3NTg4MDM0ODYsImV4cCI6MTc2MTM5NTQ4Nn0.3uEUvdPP7ZmW2_XilX7OFcfbUfnjLj3mlx65T38l6t8');
    localStorage.setItem(
      'pawfect_user',
      JSON.stringify({
        _id: '68d5361e57defdaa76fc3c3f',
        email: 'demo@pawfect.com',
        firstName: 'Demo',
        lastName: 'User',
        premium: { isActive: false, plan: 'basic' },
      })
    );
    logger.info('%c[DEV] Auth bypass tokens injected', { 'color: #8b5cf6' });
  }
}
// ----- END DEV AUTH BYPASS -----

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
