import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { MeetupProvider } from './context/MeetupContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MeetupProvider>
      <App />
    </MeetupProvider>
  </React.StrictMode>
);
