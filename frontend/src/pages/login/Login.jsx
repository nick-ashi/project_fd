import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

/**
 * LOGIN PAGE COMP
 *
 * 1. User enters info
 * 2. Clicks "Login"
 * 3. Calls AuthContext.login()
 * 4. If success -> /dashboard
 * 5. If error -> Error msg
 *
 */
export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Get login func from AuthContext
    const { login } = useAuth();

    // Hook to nav to diff pages
    const nav = useNavigate();

    // Form submission stuff
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            nav('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid email or password... try again');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-matcha-dark">
            <div className="max-w-md w-full space-y-8 p-8 bg-matcha-cream rounded-lg shadow">
                {/* Header */}
                <div>
                    <h1 className="text-left text-3xl font-bold text-matcha-darker">
                        Welcome to AshiPFD
                    </h1>
                    <h3 className="text-left text-xl font-bold text-matcha-darker">
                        Sign in to start saving 💰
                    </h3>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                )}

                {/* Login Form START */}
                <form className="space-y-6" onSubmit={handleSubmit}>
                    {/* Email Input */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email address
                        </label>
                        <input
                            id="email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-700 focus:border-green-700"
                        />
                    </div>

                    {/* Password Input */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-700 focus:border-green-700"
                        />
                    </div>

                    {/* Submit Button */}
                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-matcha-light hover:bg-matcha-dark focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </div>
                </form>
                {/* Login Form END */}

                {/* Link to Register */}
                <div className="text-center">
                    <p className="text-sm text-gray-600">
                        Don't have an account?{' '}
                        <Link to="/register" className="font-medium text-matcha hover:text-matcha-dark">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )

}