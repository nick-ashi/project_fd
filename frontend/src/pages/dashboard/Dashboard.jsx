import React, { useState, useEffect, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import TransactionModal from '../transactionEditor/TransactionModal';
import {RiEditBoxFill} from "react-icons/ri";
import {FaTrashCan} from "react-icons/fa6";
import {MdCreditScore} from "react-icons/md";
import BudgetCard from "../budgetCard/BudgetCard.jsx";
import { formatCategoryName } from '../../utils/formatters.js';
import { TRANSACTION_CATEGORIES } from "../../utils/constants.js";

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

    // Pagination
    const [currentPage, setCurrentPage] = useState(1); // which page rn
    const [itemsPerPage, setItemsPerPage] = useState(10); // how many trans per page

    // Sorting
    const [sortConfig, setSortConfig] = useState([
        { key: 'transactionDate', direction: 'desc' } // Default: newest first
    ]); // Defaults to newest first

    const { user, logout } = useAuth();
    const nav = useNavigate();

    const [randomMsg] = useState( () => {
        const msgs = [
            "Track your finances and reach your goals faster",
            "Every dollar saved is a dollar earned !",
            "Building generational wealth one transaction at a time 🚶‍➡️",
            "Your future self will thank you ong",
            "Financial freedom starts here 🦅",
            "CHASE THAT BAG 🤑",
            "Invest in yourself, track your progress 📈 (or your downfall)",
            "Smart spending, smart-ish saving 🧠",
            "Your financial journey, your rules. Unless you gamble 😈",
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

    const handleSort = (key, event) => {
        setSortConfig(prevConfig => {
            const existingIndex = prevConfig.findIndex(s => s.key === key);

            // Shift/CMD key will be multicol sort
            if (event.shiftKey || event.metaKey) {
                if (existingIndex >= 0) {
                    const newConfig = [...prevConfig];
                    newConfig[existingIndex] = {
                        ...newConfig[existingIndex],
                        direction: newConfig[existingIndex].direction === 'asc' ? 'desc' : 'asc'
                    };
                    return newConfig;
                } else {
                    return [...prevConfig, { key, direction: 'asc' }];
                }
            } else {
                if (existingIndex === 0 && prevConfig.length === 1) {
                    // Toggle direction if clicking same column
                    return [{
                        key,
                        direction: prevConfig[0].direction === 'asc' ? 'desc' : 'asc'
                    }];
                } else {
                    // New single column sort
                    return [{ key, direction: 'asc' }];
                }
            }
        });
        setCurrentPage(1);
    };

    // Sort transactions based on sortConfig
    const getSortedTransactions = () => {
        const sorted = [...transactions].sort((a, b) => {
            for (const sort of sortConfig) {
                let aVal = a[sort.key];
                let bVal = b[sort.key];

                // dates
                if (sort.key === 'transactionDate') {
                    aVal = new Date(aVal);
                    bVal = new Date(bVal);
                }

                // Amounts
                if (sort.key === 'amount') {
                    aVal = parseFloat(aVal);
                    bVal = parseFloat(bVal);
                }

                if (aVal < bVal) return sort.direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return sort.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });

        return sorted;
    };

    // Get paginated transactions
    const getPaginatedTransactions = () => {
        const sorted = getSortedTransactions();
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return sorted.slice(startIndex, endIndex);
    };

    // Calculate total pages
    const totalPages = Math.ceil(transactions.length / itemsPerPage);

    // Get sort indicator for column
    const getSortIndicator = (key) => {
        const sortIndex = sortConfig.findIndex(s => s.key === key);
        if (sortIndex === -1) return null;

        const sort = sortConfig[sortIndex];
        const arrow = sort.direction === 'asc' ? '↑' : '↓';

        // Show number if multi-sort
        if (sortConfig.length > 1) {
            return `${arrow}${sortIndex + 1}`;
        }
        return arrow;
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
                        <h2 className="text-2xl font-bold text-matcha-darker mb-3">
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
                        <div className="space-y-4">
                            {/* Pagination Controls - Top */}
                            <div className="flex justify-between items-center">
                                <div className="text-sm text-gray-600">
                                    Seeing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, transactions.length)} out of your {transactions.length} recorded transactions
                                </div>
                                <div className="flex items-center gap-2">
                                    <label className="text-sm text-gray-600">Per page:</label>
                                    <select
                                        value={itemsPerPage}
                                        onChange={(e) => {
                                            setItemsPerPage(Number(e.target.value));
                                            setCurrentPage(1);
                                        }}
                                        className="px-2 py-1 border border-gray-300 rounded-md text-sm"
                                    >
                                        <option value={5}>5</option>
                                        <option value={10}>10</option>
                                        <option value={25}>25</option>
                                        <option value={50}>50</option>
                                        <option value={100}>100</option>
                                    </select>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-matcha-light">
                                    <tr>
                                        <th
                                            onClick={(e) => handleSort('transactionDate', e)}
                                            className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:bg-matcha select-none"
                                            title="Click to sort, Shift+Click for multi-sort"
                                        >
                                            <div className="flex items-center gap-1">
                                                Date
                                                <span className="text-sm">{getSortIndicator('transactionDate')}</span>
                                            </div>
                                        </th>
                                        <th
                                            onClick={(e) => handleSort('description', e)}
                                            className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:bg-matcha select-none"
                                            title="Click to sort, Shift+Click for multi-sort"
                                        >
                                            <div className="flex items-center gap-1">
                                                Description
                                                <span className="text-sm">{getSortIndicator('description')}</span>
                                            </div>
                                        </th>
                                        <th
                                            onClick={(e) => handleSort('category', e)}
                                            className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:bg-matcha select-none"
                                            title="Click to sort, Shift+Click for multi-sort"
                                        >
                                            <div className="flex items-center gap-1">
                                                Category
                                                <span className="text-sm">{getSortIndicator('category')}</span>
                                            </div>
                                        </th>
                                        <th
                                            onClick={(e) => handleSort('type', e)}
                                            className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:bg-matcha select-none"
                                            title="Click to sort, Shift+Click for multi-sort"
                                        >
                                            <div className="flex items-center gap-1">
                                                Type
                                                <span className="text-sm">{getSortIndicator('type')}</span>
                                            </div>
                                        </th>
                                        <th
                                            onClick={(e) => handleSort('amount', e)}
                                            className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:bg-matcha select-none"
                                            title="Click to sort, Shift+Click for multi-sort"
                                        >
                                            <div className="flex items-center gap-1">
                                                Amount
                                                <span className="text-sm">{getSortIndicator('amount')}</span>
                                            </div>
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                            OPTIONS
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                    {getPaginatedTransactions().map((transaction) => (
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

                            {/* Pagination Controls - Bottom */}
                            <div className="flex justify-between items-center">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className={`px-4 py-2 rounded-md ${
                                        currentPage === 1
                                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                            : 'bg-matcha-light text-white hover:bg-matcha'
                                    }`}
                                >
                                    Previous
                                </button>

                                <div className="flex items-center gap-2">
                                    {/* Page Numbers */}
                                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                                        .filter(page => {
                                            // Show first, last, current, and +/- 1 from current
                                            return page === 1 ||
                                                page === totalPages ||
                                                Math.abs(page - currentPage) <= 1;
                                        })
                                        .map((page, index, array) => {
                                            // Add ellipsis if gap
                                            const prevPage = array[index - 1];
                                            const showEllipsis = prevPage && page - prevPage > 1;

                                            return (
                                                <Fragment key={page}>
                                                    {showEllipsis && <span className="px-2 text-gray-500">...</span>}
                                                    <button
                                                        onClick={() => setCurrentPage(page)}
                                                        className={`px-3 py-1 rounded-md ${
                                                            currentPage === page
                                                                ? 'bg-matcha text-white'
                                                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                        }`}
                                                    >
                                                        {page}
                                                    </button>
                                                </Fragment>
                                            );
                                        })
                                    }
                                </div>

                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className={`px-4 py-2 rounded-md ${
                                        currentPage === totalPages
                                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                            : 'bg-matcha-light text-white hover:bg-matcha'
                                    }`}
                                >
                                    Next
                                </button>
                            </div>

                            {/* Sort hint */}
                            {sortConfig.length > 0 && (
                                <div className="text-xs text-gray-500 text-center">
                                    #ProGamerTip: Click column headers to sort. Shift+Click to sort by multiple columns.
                                    {sortConfig.length > 1 && (
                                        <button
                                            onClick={() => setSortConfig([{ key: 'transactionDate', direction: 'desc' }])}
                                            className="ml-2 text-matcha-darker hover:underline"
                                        >
                                            Clear multi-sort
                                        </button>
                                    )}
                                </div>
                            )}
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