import { useState, useEffect } from 'react';
import { formatCategoryName } from '../../utils/formatters.js';
import { TRANSACTION_CATEGORIES } from "../../utils/constants.js";
import api from '../../api/axios';

/**
 * BUDGET CARD COMPONENT
 *
 * Displays monthly budget tracking with:
 *  - budget amount (editable)
 *  - curr month expenses
 *  - progress bar (g y r as gets closer to budget limit)
 *  - Set/Edit budget functionality
 *
 *  TODO:
 *  [] Make sub budgets (maybe in an expanded view option?)
 *  [X] Set budgets for upcoming months, be able to look back at previous months
 */
export default function BudgetCard({ transactions }) {
    const [budget, setBudget] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [budgetAmount, setBudgetAmount] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Category budget states
    const [categoryBudgets, setCategoryBudgets] = useState([]);
    const [isCategoryExpanded, setIsCategoryExpanded] = useState(false);
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [newCategoryBudget, setNewCategoryBudget] = useState({
        category: '',
        amount: ''
    });
    const [editingCategoryBudget, setEditingCategoryBudget] = useState(null);

    // Get current month and year
    const currentDate = new Date();
    const actualCurrentMonth = currentDate.getMonth() + 1; // 0-indexed, so add 1
    const actualCurrentYear = currentDate.getFullYear();

    // Viewing months
    const [viewingMonth, setViewingMonth] = useState(actualCurrentMonth);
    const [viewingYear, setViewingYear] = useState(actualCurrentYear);

    const isViewingCurrentMonth = viewingMonth === actualCurrentMonth && viewingYear === actualCurrentYear;

    // Calculate total expenses for curr month
    const calculateMonthlyExpenses = () => {
        return transactions
            .filter(t => {
                // Only count EXPENSE transactions from curr month
                if (t.type !== 'EXPENSE') return false;

                const [year, month, day] = t.transactionDate.split("-");
                const transDate = new Date(year, month - 1, day);

                return transDate.getMonth() + 1 === viewingMonth &&
                    transDate.getFullYear() === viewingYear;
            })
            .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    };

    const monthlyExpenses = calculateMonthlyExpenses();

    const calculateMonthlyIncome = () => {
        return transactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + parseFloat(t.amount), 0);
    }

    const monthlyIncome = calculateMonthlyIncome();

    // Fetch budget on component looads
    useEffect(() => {
        fetchBudget();
        fetchCategoryBudgets();
    }, [viewingMonth, viewingYear]);

    const fetchBudget = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/budgets?month=${viewingMonth}&year=${viewingYear}`);
            setBudget(res.data);
            setBudgetAmount(res.data?.amount || '');
        } catch (err) {
            if (err.response?.status === 204) {
                // No budget set - this is fine...
                setBudget(null);
            } else {
                console.error('Failed to fetch budget:', err);
                setError('Failed to load budget');
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchCategoryBudgets = async () => {
        try {
            const res = await api.get(`/budgets/categories?month=${viewingMonth}&year=${viewingYear}`);
            setCategoryBudgets(res.data);
        } catch (err) {
            console.error('Failed to fetch category budgets:', err);
            // Don't set error - category budgets are OPTIONAL
        }
    };

    const handleSaveBudget = async () => {
        try {
            const amount = parseFloat(budgetAmount);
            if (isNaN(amount) || amount <= 0) {
                setError('Please enter a valid amount');
                return;
            }

            await api.put('/budgets', {
                month: viewingMonth,
                year: viewingYear,
                amount: amount
            });

            await fetchBudget();
            setIsEditing(false);
            setError(null);
        } catch (err) {
            console.error('Failed to save budget:', err);
            setError('Failed to save budget');
        }
    };

    const handleDeleteBudget = async () => {
        if (window.confirm('Are you sure you want to delete this budget?')) {
            try {
                await api.delete(`/budgets?month=${viewingMonth}&year=${viewingYear}`);
                setBudget(null);
                setBudgetAmount('');
                setError(null);
            } catch (err) {
                console.error('Failed to delete budget:', err);
                setError('Failed to delete budget');
            }
        }
    };

    // Navigate to previous month
    const handlePreviousMonth = () => {
        if (viewingMonth === 1) {
            setViewingMonth(12);
            setViewingYear(viewingYear - 1);
        } else {
            setViewingMonth(viewingMonth - 1);
        }
    };

    // Navigate to next month
    const handleNextMonth = () => {
        if (viewingMonth === 12) {
            setViewingMonth(1);
            setViewingYear(viewingYear + 1);
        } else {
            setViewingMonth(viewingMonth + 1);
        }
    };

    // Jump back to current month
    const handleGoToCurrentMonth = () => {
        setViewingMonth(actualCurrentMonth);
        setViewingYear(actualCurrentYear);
    };

    // Category budget saves
    const handleSaveCategoryBudget = async () => {
        try {
            const amount = parseFloat(newCategoryBudget.amount);
            if (!newCategoryBudget.category || isNaN(amount) || amount <= 0) {
                setError('Please select a category and enter a valid amount');
                return;
            }

            await api.put(`/budgets/categories`, {
                month: viewingMonth,
                year: viewingYear,
                category: newCategoryBudget.category,
                amount: amount
            });

            await fetchCategoryBudgets();
            setIsAddingCategory(false);
            setNewCategoryBudget({ category: '', amount: '' });
            setError(null);

        } catch (err) {
            console.error('Failed to save category budget:', err);
            setError(err.response?.data?.message || 'Failed to save category budget');
        }
    };

    // Update category budget
    const handleUpdateCategoryBudget = async () => {
        try {
            const amount = parseFloat(editingCategoryBudget.amount);
            if (isNaN(amount) || amount <= 0) {
                setError('Please enter a valid amount');
                return;
            }

            await api.put('/budgets/categories', {
                month: viewingMonth,
                year: viewingYear,
                category: editingCategoryBudget.category,
                amount: amount
            });

            await fetchCategoryBudgets();
            setEditingCategoryBudget(null);
            setError(null);
        } catch (err) {
            console.error('Failed to update category budget:', err);
            setError('Failed to update category budget');
        }
    };

    // Delete categorybudget
    const handleDeleteCategoryBudget = async (category) => {
        if (window.confirm(`Delete budget for ${formatCategoryName(category)}?`)) {
            try {
                await api.delete(`/budgets/categories?month=${viewingMonth}&year=${viewingYear}&category=${category}`);
                await fetchCategoryBudgets();
            } catch (err) {
                console.error('Failed to delete category budget:', err);
                setError('Failed to delete category budget');
            }
        }
    };

    // Calc the spend for a specific category
    const calculateCategorySpending = (category) => {
        return transactions
            .filter(t => {
                if (t.type !== 'EXPENSE' || t.category !== category) return false;

                const [year, month, day] = t.transactionDate.split("-");
                const transDate = new Date(year, month - 1, day);

                return transDate.getMonth() + 1 === viewingMonth &&
                    transDate.getFullYear() === viewingYear;
            })
            .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    };

    // Calc progress
    const progressPercentage = budget ? Math.min((monthlyExpenses / budget.amount) * 100, 100) : 0;

    // Color based on percentage
    const getProgressColor = () => {
        if (progressPercentage >= 100) return 'bg-red-500';
        if (progressPercentage >= 80) return 'bg-yellow-500';
        if (progressPercentage >= 60) return 'bg-yellow-400';
        return 'bg-green-500';
    };

    const getRemainingAmountColor = () => {
        const remaining = budget.amount - monthlyExpenses;
        if (remaining < 0) return 'text-red-600';
        if (progressPercentage >= 80) return 'text-yellow-600';
        return 'text-green-600';
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    // Get month name
    const getMonthName = () => {
        return new Date(viewingYear, viewingMonth - 1).toLocaleDateString('en-US', { month: 'long' });
    };

    if (loading) {
        return (
            <div className="bg-matcha-cream rounded-lg shadow p-6 mb-6">
                <div className="text-center text-gray-600">Loading budget...</div>
            </div>
        );
    }

    return (
        <div className="bg-matcha-cream rounded-lg shadow p-6 mb-6">
            {/* Header with Month NAVVVV */}
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-4">
                    {/* Prev month arrow */}
                    <button
                        onClick={handlePreviousMonth}
                        className="px-3 py-1 text-matcha-darker hover:bg-matcha-light hover:text-white rounded-md transition-colors"
                        title="Previous month"
                    >
                        ←
                    </button>

                    {/* Month/Year Display */}
                    <div className="flex items-center gap-2">
                        <h2 className="text-2xl font-bold text-matcha-darker">
                            {getMonthName()} {viewingYear}
                        </h2>
                        {!isViewingCurrentMonth && (
                            <button
                                onClick={handleGoToCurrentMonth}
                                className="px-2 py-1 text-xs bg-matcha-light text-white rounded-md hover:bg-matcha"
                                title="Go to current month"
                            >
                                Today
                            </button>
                        )}
                    </div>

                    {/* Next month arrow */}
                    <button
                        onClick={handleNextMonth}
                        className="px-3 py-1 text-matcha-darker hover:bg-matcha-light hover:text-white rounded-md transition-colors"
                        title="Next month"
                    >
                        →
                    </button>
                </div>

                {/* Edit/Delete Buttons */}
                {budget && !isEditing && (
                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsEditing(true)}
                            className="px-3 py-1 text-sm bg-matcha-light hover:bg-matcha text-white rounded-md"
                        >
                            Edit
                        </button>
                        <button
                            onClick={handleDeleteBudget}
                            className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded-md"
                        >
                            Delete
                        </button>
                    </div>
                )}
            </div>

            {/* Error */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {/* No Budget Set */}
            {!budget && !isEditing && (
                <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">
                        No budget set for {getMonthName()} {viewingYear}
                    </p>
                    <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-matcha-light hover:bg-matcha text-white rounded-md font-medium"
                    >
                        Set Budget
                    </button>
                </div>
            )}

            {/* Edit/Create Budget Form */}
            {isEditing && (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Budget Amount for {getMonthName()} {viewingYear}
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            value={budgetAmount}
                            onChange={(e) => setBudgetAmount(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-matcha-light"
                            placeholder="Enter budget amount"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleSaveBudget}
                            className="flex-1 px-4 py-2 bg-matcha-light hover:bg-matcha text-white rounded-md font-medium"
                        >
                            Save
                        </button>
                        <button
                            onClick={() => {
                                setIsEditing(false);
                                setBudgetAmount(budget?.amount || '');
                                setError(null);
                            }}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Budget Display with Progress */}
            {budget && !isEditing && (
                <div className="space-y-4">
                    {/* Stats */}
                    <div className="grid grid-cols-4 gap-4">
                        <div>
                            <p className="text-sm font-bold text-gray-600">Budget</p>
                            <p className="text-xl font-bold text-matcha-darker">
                                {formatCurrency(budget.amount)}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-600">Spent</p>
                            <p className="text-xl font-bold text-gray-900">
                                {formatCurrency(monthlyExpenses)}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-600">Earned</p>
                            <p className="text-xl font-bold text-green-600">
                                {formatCurrency(monthlyIncome)}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-600">Remaining</p>
                            <p className={`text-xl font-bold ${getRemainingAmountColor()}`}>
                                {formatCurrency(budget.amount - monthlyExpenses)}
                            </p>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div>
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>{progressPercentage.toFixed(1)}% of budget used</span>
                            {progressPercentage >= 100 && (
                                <span className="text-red-600 font-semibold">Over budget!</span>
                            )}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4">
                            <div
                                className={`h-4 rounded-full transition-all duration-300 ${getProgressColor()}`}
                                style={{ width: `${progressPercentage}%` }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Category Budgets Accordion */}
            {budget && !isEditing && (
                <div className="mt-6 border-t pt-4">
                    {/* Accordion Header */}
                    <button
                        onClick={() => setIsCategoryExpanded(!isCategoryExpanded)}
                        className="w-full flex justify-between items-center text-left hover:bg-gray-50 p-2 rounded transition-colors"
                    >
                        <div className="flex items-center gap-2">
                              <span className="text-lg font-semibold text-matcha-darker">
                                  Category Budgets
                              </span>
                            {categoryBudgets.length > 0 && (
                                <span className="text-sm text-gray-500">
                                      ({categoryBudgets.length} set)
                                  </span>
                            )}
                        </div>
                        <span className="text-2xl text-matcha-darker">
                              {isCategoryExpanded ? '▼' : '▶'}
                          </span>
                    </button>

                    {/* Expanded Content */}
                    {isCategoryExpanded && (
                        <div className="mt-4 space-y-3">
                            {/* Category Budget List */}
                            {categoryBudgets.map((catBudget) => {
                                const spent = calculateCategorySpending(catBudget.category);
                                const percentage = Math.min((spent / catBudget.amount) * 100, 100);

                                const getColor = () => {
                                    if (percentage >= 100) return 'bg-red-500';
                                    if (percentage >= 80) return 'bg-yellow-500';
                                    if (percentage >= 60) return 'bg-yellow-400';
                                    return 'bg-green-500';
                                };

                                // Check if this category is being edited
                                const isEditing = editingCategoryBudget?.category === catBudget.category;

                                return (
                                    <div key={catBudget.id} className="bg-gray-50 p-4 rounded-lg">
                                        {isEditing ? (
                                            // Edit Mode
                                            <div className="space-y-3">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        {formatCategoryName(catBudget.category)}
                                                    </label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={editingCategoryBudget.amount}
                                                        onChange={(e) => setEditingCategoryBudget({
                                                            ...editingCategoryBudget,
                                                            amount: e.target.value
                                                        })}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-matcha-light"
                                                        placeholder="Enter amount"
                                                    />
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={handleUpdateCategoryBudget}
                                                        className="flex-1 px-3 py-2 bg-matcha-light hover:bg-matcha text-white rounded-md text-sm"
                                                    >
                                                        Save
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setEditingCategoryBudget(null);
                                                            setError(null);
                                                        }}
                                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            // Display Mode
                                            <>
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <h4 className="font-bold text-gray-900">
                                                            {formatCategoryName(catBudget.category)}
                                                        </h4>
                                                        <p className="text-sm text-gray-600">
                                                            <span className="font-semibold">{formatCurrency(catBudget.amount)}</span> budget
                                                        </p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => setEditingCategoryBudget({
                                                                category: catBudget.category,
                                                                amount: catBudget.amount
                                                            })}
                                                            className="px-3 py-1 text-sm bg-matcha-light hover:bg-matcha text-white rounded-md"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteCategoryBudget(catBudget.category)}
                                                            className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded-md"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="space-y-1">
                                                    <div className="flex justify-between text-sm">
                              <span className="font-semibold text-gray-600">
                                  Spent: {formatCurrency(spent)}
                              </span>
                                                        <span className={percentage >= 100 ? 'text-red-600 font-semibold' : 'text-gray-600'}>
                                  {percentage.toFixed(0)}%
                              </span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className={`h-2 rounded-full transition-all duration-300 ${getColor()}`}
                                                            style={{ width: `${percentage}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                );
                            })}

                            {/* Add Category Budget Form */}
                            {isAddingCategory ? (
                                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Category
                                        </label>
                                        <select
                                            value={newCategoryBudget.category}
                                            onChange={(e) => setNewCategoryBudget({
                                                ...newCategoryBudget,
                                                category: e.target.value
                                            })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-matcha-light"
                                        >
                                            <option value="">Select a category</option>
                                            {/* Only show categories that don't have budgets tho */}
                                            {Object.keys(TRANSACTION_CATEGORIES)
                                                .filter(cat => !categoryBudgets.find(cb => cb.category === cat))
                                                .map(cat => (
                                                    <option key={cat} value={cat}>
                                                        {TRANSACTION_CATEGORIES[cat]}
                                                    </option>
                                                ))
                                            }
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Budget Amount
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={newCategoryBudget.amount}
                                            onChange={(e) => setNewCategoryBudget({
                                                ...newCategoryBudget,
                                                amount: e.target.value
                                            })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-matcha-light"
                                            placeholder="Enter amount"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleSaveCategoryBudget}
                                            className="flex-1 px-3 py-2 bg-matcha-light hover:bg-matcha text-white rounded-md text-sm"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsAddingCategory(false);
                                                setNewCategoryBudget({ category: '', amount: '' });
                                                setError(null);
                                            }}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setIsAddingCategory(true)}
                                    className="w-full px-4 py-3 border-2 border-dashed border-matcha-darker rounded-lg text-matcha-darker hover:border-matcha-light hover:text-matcha-light transition-colors"
                                >
                                    + Add Category Budget
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}