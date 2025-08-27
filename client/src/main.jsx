import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import '@fortawesome/fontawesome-free/css/fontawesome.min.css'
import '@fortawesome/fontawesome-free/css/brands.min.css'
import '@fortawesome/fontawesome-free/css/solid.min.css'
import 'bootstrap/dist/css/bootstrap.min.css';

// Redux
import { Provider } from 'react-redux'
import store from './redux/store'

// Performance utilities
import { registerServiceWorker, collectPerformanceMetrics } from './utils/performance'

import App from './App'
import './stylesCSS/index.css'

// Initialize performance monitoring
if (process.env.NODE_ENV === 'development') {
  setTimeout(collectPerformanceMetrics, 2000)
}

// Register service worker for production
registerServiceWorker()

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <HelmetProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </Provider>
)