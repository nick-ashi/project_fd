import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom";
import { AuthProvider} from "./context/AuthContext.jsx";
import './index.css'
import App from './App.jsx'

/**
 * CHANGELOG:
 * - Nested comps:
 *  1. Router (Controls navigation)
 *  2. Auth (provides login state)
 *  3. actual App (uses both of the above)
 * - BrowserRouter: Enables url nav routing
 * - AuthProvider: wraps the whole app, makes auth state available for all components
 */
createRoot(document.getElementById('root')).render(
  <StrictMode>
      <BrowserRouter>
          <AuthProvider>
              <App />
          </AuthProvider>
      </BrowserRouter>
  </StrictMode>,
)
