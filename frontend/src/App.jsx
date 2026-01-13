import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/login/Login.jsx';
import Register from "./pages/register/Register.jsx";
import Dashboard from "./pages/dashboard/Dashboard.jsx";

/**
 * Main App Component
 *
 * Sets up routing for the entire application
 *
 * Routes:
 * - / → Redirects to /login or /dashboard
 * - /login → Login page
 * - /register → Register page (we'll create this next)
 * - /dashboard → Dashboard page (we'll create this next)
 */
function App() {
    const { isAuthenticated, loading } = useAuth();

    // Show spinner while checking auth
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    return (
        <Routes>
            {/* Root path - redirect based on auth status */}
            <Route
                path="/"
                element={
                    isAuthenticated ? (
                        <Navigate to="/dashboard" replace />
                    ) : (
                        <Navigate to="/login" replace />
                    )
                }
            />

            {/* Login page */}
            <Route path="/login" element={<Login />} />

            {/* Register page */}
            <Route
                path="/register"
                element={<Register />}
            />

            {/* Dashboard */}
            <Route
                path="/dashboard"
                element={<Dashboard />}
            />

            {/* 404 - page not found */}
            <Route
                path="*"
                element={<div>404 - Page Not Found</div>}
            />
        </Routes>
    );
}

export default App;