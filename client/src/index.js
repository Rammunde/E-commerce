import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Provider } from 'react-redux';
import store from './redux/store';

window.addEventListener('error', function (event) {
  const isChunkLoadError =
    event.message &&
    (event.message.includes('Loading chunk') || event.message.includes('Script error'));

  if (isChunkLoadError) {
    console.warn('Chunk load failed. Reloading the page...');
    window.location.reload();
  }
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
// In React 18, StrictMode causes some lifecycle methods and effects to run twice on purpose (in development only) to help detect issues.
// This can confuse developers or cause issues like:
// API calls running twice
// useEffect executing twice
// console.logs duplicating output

// ⚠️ Important: This only happens in development, not in production.
  // For long-term quality, it’s good practice to use StrictMode — it catches unsafe lifecycles, deprecated APIs, and more.
  // <React.StrictMode>
  <Provider store={store}>
    <App />
    </Provider>
  // </React.StrictMode>
);
reportWebVitals();
