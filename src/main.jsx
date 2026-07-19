import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { UserAuthProvider } from './context/UserAuthContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <UserAuthProvider>
        <App />
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: 'rgba(20,20,20,0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.92)',
              borderRadius: '12px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.9rem',
              padding: '12px 18px',
            },
            success: {
              iconTheme: { primary: '#c0392b', secondary: '#111' },
            },
            error: {
              iconTheme: { primary: '#e74c3c', secondary: '#111' },
            },
          }}
        />
      </UserAuthProvider>
    </AuthProvider>
  </BrowserRouter>
)

// Register Service Worker for Notifications
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(reg => {
      console.log('Service Worker registered successfully.', reg.scope);
    }).catch(err => {
      console.warn('Service Worker registration failed:', err);
    });
  });
}
