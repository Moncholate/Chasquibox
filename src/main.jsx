import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

/* Para que abra sin internet (ver pwa/sw.js). Solo en lo publicado: en
   desarrollo un worker guardando archivos hace que los cambios no se vean.
   La ruta lleva la base porque Vite no reescribe rutas dentro de los scripts:
   '/sw.js' apuntaría a la raíz del dominio y daría 404. */
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`, { scope: import.meta.env.BASE_URL })
      .catch(err => console.warn('SW registration failed:', err))
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
