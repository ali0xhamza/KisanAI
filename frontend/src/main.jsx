import React from 'react';
import './i18n/index.js';               // ← i18n import (add this line)
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';  // ← Google OAuth
import { AuthProvider } from './context/AuthContext';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import { store } from './store/index.js';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <GoogleOAuthProvider clientId="277789271557-j5ngtgck7fg3n2323k1va8cfj6a5vtb6.apps.googleusercontent.com">
          <AuthProvider>
            <App />
          </AuthProvider>
        </GoogleOAuthProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#1B4D2E',
              color: '#fff',
              borderRadius: '14px',
            },
          }}
        />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);