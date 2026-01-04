import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from '../../context/AuthContext.jsx';

/**
 * REGISTER PAGE
 *
 * 1. Enter email, password, first name, last name
 * 2. Click signup
 * 3. If success --> auto-login --> /dashboard
 * 4. If error --> show error message
 */
export default function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Get reg func from AuthContext
    const { register } = useAuth();

    // Hook for nav
    const nav = useNavigate();

    // Form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (password === confirmPassword) {
            try {
                setLoading(true);
                await register(email, password, firstName, lastName);
                // Auto-login is in AuthContext, then redir to the dash
                nav('/dashboard');
            } catch (err) {
                setError(err.response?.data?.message);
            } finally {
                setLoading(false);
            }
        } else {
            setError("Passwords do not match");
        }

    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-matcha-dark">
            <div className="max-w-md w-full space-y-8 p-8 bg-matcha-cream rounded-lg shadow">
                {/* Header */}
                <div>
                    <h1 className="text-left text-3xl font-bold text-matcha-darker">
                        Join AshiPFD
                    </h1>
                    <h3 className="text-left text-xl font-bold text-matcha-darker">
                        Start tracking your finances 📊
                    </h3>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                )}

                {/* Register Form */}
                <form className="space-y-6" onSubmit={handleSubmit}>
                    {/* First Name Input */}
                    <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                            First Name
                        </label>
                        <input
                            id="firstName"
                            type="text"
                            required
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-700 focus:border-green-700"
                        />
                    </div>

                    {/* Last Name Input */}
                    <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                            Last Name
                        </label>
                        <input
                            id="lastName"
                            type="text"
                            required
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-700 focus:border-green-700"
                        />
                    </div>

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

                    {/* Confirm password input */}
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                            Confirm Password
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
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
                            {loading ? 'Creating account...' : 'Sign up'}
                        </button>
                    </div>
                </form>

                {/* Link to Login */}
                <div className="text-center">
                    <p className="text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link to="/login" className="font-medium text-matcha hover:text-matcha-dark">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}