import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GrUpdate } from "react-icons/gr";
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import TransactionModal from '../transactionEditor/TransactionModal';
import {RiEditBoxFill} from "react-icons/ri";
import {FaTrashCan} from "react-icons/fa6";
import {MdCreditScore} from "react-icons/md";
import BudgetCard from "../budgetCard/BudgetCard.jsx";
import { formatCategoryName } from '../../utils/formatters.js';

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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null);

    const { user, logout } = useAuth();
    const nav = useNavigate();

    const [randomMsg] = useState( () => {
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
    });

    const handleLogout = async () => {
        await logout();
        nav('/login');
    }

    // Format date
    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';

        const [year, month, day] = dateStr.split('-');
        // who made months zero indexed?????
        const date = new Date(year, month - 1, day);
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

    // Add transaction functionality
    const handleCreateTransaction = async (formData) => {
        try {
            await api.post('/transactions', formData);
            setIsModalOpen(false);
            fetchTransactions(); // Refresh the list
        } catch (err) {
            console.error('Failed to create transaction:', err);
            setError('Failed to create transaction');
        }
    };

    // Update transaction functionality
    const handleUpdateTransaction = async (formData) => {
        try {
            await api.put(`/transactions/${editingTransaction.id}`, formData);
            setIsModalOpen(false);
            setEditingTransaction(null);
            fetchTransactions(); // Refresh the list
        } catch (err) {
            console.error('Failed to update transaction:', err);
            setError('Failed to update transaction');
        }
    };

    const handleDeleteTransaction = async (id) => {
        try {
            await api.delete(`/transactions/${id}`);
            fetchTransactions();
        } catch (err) {
            console.error('Failed to delete transaction:', err);
            setError('Failed to delete transaction');
        }
    };

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
                            { randomMsg }
                        </p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 bg-matcha-light transform transition-all duration-600 hover:bg-matcha text-white rounded-md font-medium"
                    >
                        Logout
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8 pb-2 sm:px-6 lg:px-8">
                <BudgetCard transactions={transactions}/>
            </div>

            {/* Transaction List */}
            <div className="max-w-7xl mx-auto px-4 pt-2 py-8 sm:px-6 lg:px-8">
                <div className="bg-matcha-cream rounded-lg shadow p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-matcha-darker mb-6">
                            Your Transactions
                        </h2>
                        <div className="flex justify-between items-center space-x-1 mb-6">
                            <button
                            onClick={() => {
                                setEditingTransaction(null);
                                setIsModalOpen(true);
                            }}
                            className="px-3 py-2 bg-matcha-light hover:bg-matcha transform transition-all duration-600 text-white rounded-md font-medium"
                            >
                                <div className="flex items-center justify-between space-x-1">
                                    <div>
                                        New
                                    </div>
                                    <div>
                                        <MdCreditScore className="text-xl"/>
                                    </div>
                                </div>
                            </button>


                        </div>

                    </div>

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
                                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                        OPTIONS
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
                                            {formatCategoryName(transaction.category)}
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
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-1">
                                            <button
                                                onClick={() => {
                                                    setIsModalOpen(true);
                                                    setEditingTransaction(transaction);
                                                }}
                                                className="px-4 py-2 bg-matcha-light hover:bg-matcha transform transition-all duration-600 text-white rounded-md font-medium "
                                            >
                                                <RiEditBoxFill />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    handleDeleteTransaction(transaction.id);
                                                }}
                                                className="px-4 py-2 bg-matcha-light hover:bg-matcha transform transition-all duration-600 text-white rounded-md font-medium "
                                            >
                                                <FaTrashCan />
                                            </button>
                                        </td>

                                    </tr>

                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
            <TransactionModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingTransaction(null);
                }}
                onSave={editingTransaction ? handleUpdateTransaction : handleCreateTransaction}
                transaction={editingTransaction}
            />
        </div>
    );
}