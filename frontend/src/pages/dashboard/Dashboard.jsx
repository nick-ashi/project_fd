import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

/**
 * DASHBOARD PAGE
 *
 * Used for an easy view of all a user's transactions
 *  - can create, update, or delete transactions
 *
 * 1. Component mounts --> useEffect runs
 * 2. Fetch the trans from GET /api/transactions
 * 3. Display in a table
 * 4. User can logout (clears the token, redir to login)
 */
export default function Dashboard() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { user, logout } = useAuth();
    const nav = useNavigate();

    const chooseRandomMsg = () => {
        const msgs = [
            "Track your finances and reach your goals faster",
            "Every dollar saved is a dollar earned !",
            "Building generational wealth one transaction at a time 🚶‍➡️",
            "Your future self will thank you ong",
            "Financial freedom starts here 🦅",
            "Making money moves 🤑",
            "Invest in yourself, track your progress 📈",
            "Smart spending, smarter saving 🧠",
            "Your financial journey, your rules 😈",
            "Turning dreams into financial plans",
        ]
        return msgs[Math.floor(Math.random() * msgs.length)];
    }

    const handleLogout = async () => {
        await logout();
        nav('/login');
    }

    // Format date
    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';

        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;

        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD' }).format(amount);
    };

    // Fetch transactions when the component mounts
    useEffect(() => {
        fetchTransactions();
    }, []); // empty arr aka run once on mount

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const res = await api.get('/transactions');
            setTransactions(res.data);
        } catch (err) {
            setError(err.response?.data?.message);
            console.error(err)
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-matcha-dark">
            {/* Header */}
            <div className="bg-matcha-cream shadow">
                <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-matcha-darker">
                            Welcome back, {user?.firstName}!
                        </h1>
                        <p className="text-gray-600 mt-1">
                            { chooseRandomMsg() }
                        </p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 bg-matcha-light hover:bg-matcha text-white rounded-md font-medium"
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <div className="bg-matcha-cream rounded-lg shadow p-6">
                    <h2 className="text-2xl font-bold text-matcha-darker mb-6">
                        Your Transactions
                    </h2>

                    {/* Loading State */}
                    {loading && (
                        <div className="text-center py-12">
                            <div className="text-xl text-gray-600">Loading transactions...</div>
                        </div>
                    )}

                    {/* Error State */}
                    {error && !loading && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && !error && transactions.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-gray-600 text-lg">
                                No transactions yet. Start tracking your finances!
                            </p>
                        </div>
                    )}

                    {/* Transactions Table */}
                    {!loading && !error && transactions.length > 0 && (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-matcha-light">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                        Description
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                        Category
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                        Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                        Amount
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                {transactions.map((transaction) => (
                                    <tr key={transaction.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {formatDate(transaction.transactionDate)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {transaction.description}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {transaction.category}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                      transaction.type === 'INCOME'
                                                          ? 'bg-green-100 text-green-800'
                                                          : 'bg-red-100 text-red-800'
                                                  }`}>
                                                      {transaction.type}
                                                  </span>
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                                            transaction.type === 'INCOME'
                                                ? 'text-green-600'
                                                : 'text-red-600'
                                        }`}>
                                            {transaction.type === 'INCOME' ? '+' : '-'}
                                            {formatCurrency(transaction.amount)}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}