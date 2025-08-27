import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import '@fortawesome/fontawesome-free/css/fontawesome.min.css'
import '@fortawesome/fontawesome-free/css/brands.min.css'
import '@fortawesome/fontawesome-free/css/solid.min.css'
import 'bootstrap/dist/css/bootstrap.min.css';

// Redux
import { Provider } from 'react-redux'
import store from './redux/store'

// import { stopReportingRuntimeErrors } from "react-error-overlay";
import App from './App'
import './stylesCSS/index.css'

// if (process.env.NODE_ENV === "development") {
//   stopReportingRuntimeErrors();
// }

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>
)