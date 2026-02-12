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
 *  [X] Make sub budgets (maybe in an expanded view option?)
 *  [X] Set budgets for upcoming months, be able to look back at previous months
 *  [ ] Ability to either create a budget based on one lump sum OR sum of category budgets
 *  [ ] Ability to COPY budgets from the previous month
 */
export default function BudgetCard({ transactions }) {
    const [budget, setBudget] = useState(null);
    const [budgetType, setBudgetType] = useState('GENERAL');
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

    // Copy budget states
    const [showCopyModal, setShowCopyModal] = useState(false);
    const [copySource, setCopySource] = useState({ month: null, year: null });
    const [copyOptions, setCopyOptions] = useState({
        copyBudgetAmount: true,
        copyCategories: true
    });
    const [sourceBudgetInfo, setSourceBudgetInfo] = useState(null);

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
        return transactions.filter(t => {
            if (t.type !== 'INCOME') return false;

            const [year, month, day] = t.transactionDate.split("-");
            const transDate = new Date(year, month - 1, day);

            return transDate.getMonth() + 1 === viewingMonth &&
                transDate.getFullYear() === viewingYear;
        }).reduce((sum, t) => sum + parseFloat(t.amount), 0);
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
            setBudgetType(res.data?.budgetType || 'GENERAL');
        } catch (err) {
            if (err.response?.status === 204) {
                // No budget set - this is fine...
                setBudget(null);
                setBudgetType('GENERAL');
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
            if (budgetType === 'GENERAL') {
                const amount = parseFloat(budgetAmount);
                if (isNaN(amount) || amount <= 0) {
                    setError('Please enter a valid amount');
                    return;
                }
            }

            await api.put('/budgets', {
                month: viewingMonth,
                year: viewingYear,
                budgetType: budgetType,
                amount: budgetType === 'GENERAL' ? parseFloat(budgetAmount) : 0
            });

            await fetchBudget();
            // ?????
            await fetchCategoryBudgets();
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
            await fetchBudget();
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
            await fetchBudget();
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
                await fetchBudget();
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

    // COPY HANDLERS
    // Fetch source budget info when user selects a month to copy from
    const fetchSourceBudgetInfo = async (month, year) => {
        try {
            const [budgetRes, categoriesRes] = await Promise.all([
                api.get(`/budgets?month=${month}&year=${year}`),
                api.get(`/budgets/categories?month=${month}&year=${year}`)
            ]);

            setSourceBudgetInfo({
                budget: budgetRes.data,
                categories: categoriesRes.data || []
            });
        } catch (err) {
            if (err.response?.status === 204) {
                setSourceBudgetInfo({ budget: null, categories: [] });
            } else {
                console.error('Failed to fetch source budget:', err);
                setSourceBudgetInfo(null);
            }
        }
    };

    // Handle copy budget
    const handleCopyBudget = async () => {
        try {
            await api.post('/budgets/copy', {
                sourceMonth: copySource.month,
                sourceYear: copySource.year,
                targetMonth: viewingMonth,
                targetYear: viewingYear,
                copyBudgetAmount: copyOptions.copyBudgetAmount,
                copyCategories: copyOptions.copyCategories
            });

            await fetchBudget();
            await fetchCategoryBudgets();
            setShowCopyModal(false);
            setCopySource({ month: null, year: null });
            setSourceBudgetInfo(null);
            setError(null);
        } catch (err) {
            console.error('Failed to copy budget:', err);
            setError(err.response?.data?.message || 'Failed to copy budget');
        }
    };

    // Get previous month for default copy source
    const getPreviousMonth = () => {
        if (viewingMonth === 1) {
            return { month: 12, year: viewingYear - 1 };
        }
        return { month: viewingMonth - 1, year: viewingYear };
    };

    // Calc progress
    const budgetTotal = budget?.effectiveAmount || budget?.amount || 0;
    const progressPercentage = budgetTotal > 0 ? Math.min((monthlyExpenses / budgetTotal) * 100, 100) : 0;

    // Color based on percentage
    const getProgressColor = () => {
        if (progressPercentage >= 100) return 'bg-red-500';
        if (progressPercentage >= 80) return 'bg-yellow-500';
        if (progressPercentage >= 60) return 'bg-yellow-400';
        return 'bg-green-500';
    };

    const getRemainingAmountColor = () => {
        const budgetTotal = budget.effectiveAmount || budget.amount;
        const remaining = budgetTotal - monthlyExpenses;
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
        <div className="bg-matcha-cream rounded-lg shadow p-4 sm:p-6 mb-6">
            {/* Header with Month NAVVVV */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-4">
                    {/* Prev month arrow */}
                    <button
                        onClick={handlePreviousMonth}
                        className="px-2 sm:px-3 py-1 text-matcha-darker hover:bg-matcha-light hover:text-white rounded-md transition-colors"
                        title="Previous month"
                    >
                        ←
                    </button>

                    {/* Month/Year Display */}
                    <div className="flex items-center gap-2 flex-1 sm:flex-initial justify-center sm:justify-start">
                        <h2 className="text-lg sm:text-2xl font-bold text-matcha-darker">
                            {getMonthName()} {viewingYear}
                        </h2>
                        {!isViewingCurrentMonth && (
                            <button
                                onClick={handleGoToCurrentMonth}
                                className="px-2 py-1 text-xs bg-matcha-light text-white rounded-md hover:bg-matcha whitespace-nowrap"
                                title="Go to current month"
                            >
                                Today
                            </button>
                        )}
                    </div>

                    {/* Next month arrow */}
                    <button
                        onClick={handleNextMonth}
                        className="px-2 sm:px-3 py-1 text-matcha-darker hover:bg-matcha-light hover:text-white rounded-md transition-colors"
                        title="Next month"
                    >
                        →
                    </button>
                </div>

                {/* Edit/Delete Buttons */}
                {budget && !isEditing && (
                    <div className="flex gap-2 w-full sm:w-auto">
                        <button
                            onClick={() => setIsEditing(true)}
                            className="flex-1 sm:flex-initial px-3 py-1 text-sm bg-matcha-light hover:bg-matcha text-white rounded-md"
                        >
                            Edit
                        </button>
                        <button
                            onClick={handleDeleteBudget}
                            className="flex-1 sm:flex-initial px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded-md"
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

            {/* Copy Budget Modal */}
            {showCopyModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-bold text-matcha-darker mb-4">
                            Copy Budget to {getMonthName()} {viewingYear}
                        </h3>

                        {/* Source Month Selection */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Copy from:
                            </label>
                            <div className="flex gap-2">
                                <select
                                    value={copySource.month || ''}
                                    onChange={(e) => {
                                        const newMonth = parseInt(e.target.value);
                                        const newSource = { ...copySource, month: newMonth };
                                        setCopySource(newSource);
                                        if (newSource.month && newSource.year) {
                                            fetchSourceBudgetInfo(newSource.month, newSource.year);
                                        }
                                    }}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2
  focus:ring-matcha-light"
                                >
                                    <option value="">Month</option>
                                    {[...Array(12)].map((_, i) => (
                                        <option key={i + 1} value={i + 1}>
                                            {new Date(2000, i).toLocaleDateString('en-US', { month: 'long' })}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    value={copySource.year || ''}
                                    onChange={(e) => {
                                        const newYear = parseInt(e.target.value);
                                        const newSource = { ...copySource, year: newYear };
                                        setCopySource(newSource);
                                        if (newSource.month && newSource.year) {
                                            fetchSourceBudgetInfo(newSource.month, newSource.year);
                                        }
                                    }}
                                    className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2
  focus:ring-matcha-light"
                                >
                                    <option value="">Year</option>
                                    {[...Array(5)].map((_, i) => {
                                        const year = actualCurrentYear - 2 + i;
                                        return <option key={year} value={year}>{year}</option>;
                                    })}
                                </select>
                            </div>
                        </div>

                        {/* Source Budget Info */}
                        {sourceBudgetInfo && (
                            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                {sourceBudgetInfo.budget ? (
                                    <>
                                        <p className="text-sm text-gray-700">
                                            <span className="font-semibold">Type:</span> {sourceBudgetInfo.budget.budgetType === 'GENERAL' ?
                                            'Fixed Budget' : 'Category Sum'}
                                        </p>
                                        {sourceBudgetInfo.budget.budgetType === 'GENERAL' && (
                                            <p className="text-sm text-gray-700">
                                                <span className="font-semibold">Amount:</span> {formatCurrency(sourceBudgetInfo.budget.amount)}
                                            </p>
                                        )}
                                        <p className="text-sm text-gray-700">
                                            <span className="font-semibold">Categories:</span> {sourceBudgetInfo.categories.length} budget(s)
                                        </p>
                                    </>
                                ) : (
                                    <p className="text-sm text-gray-500">No budget found for this month</p>
                                )}
                            </div>
                        )}

                        {/* Copy Options - Only show for GENERAL type */}
                        {sourceBudgetInfo?.budget?.budgetType === 'GENERAL' && (
                            <div className="mb-4 space-y-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    What to copy:
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={copyOptions.copyBudgetAmount}
                                        onChange={(e) => setCopyOptions({
                                            ...copyOptions,
                                            copyBudgetAmount: e.target.checked
                                        })}
                                        className="rounded border-gray-300 text-matcha-light focus:ring-matcha-light"
                                    />
                                    <span className="text-sm text-gray-700">Budget amount
  ({formatCurrency(sourceBudgetInfo.budget.amount)})</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={copyOptions.copyCategories}
                                        onChange={(e) => setCopyOptions({
                                            ...copyOptions,
                                            copyCategories: e.target.checked
                                        })}
                                        className="rounded border-gray-300 text-matcha-light focus:ring-matcha-light"
                                    />
                                    <span className="text-sm text-gray-700">Category budgets ({sourceBudgetInfo.categories.length})</span>
                                </label>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                            <button
                                onClick={handleCopyBudget}
                                disabled={!sourceBudgetInfo?.budget || (sourceBudgetInfo.budget.budgetType === 'GENERAL' &&
                                    !copyOptions.copyBudgetAmount && !copyOptions.copyCategories)}
                                className="flex-1 px-4 py-2 bg-matcha-light hover:bg-matcha text-white rounded-md font-medium
  disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Copy
                            </button>
                            <button
                                onClick={() => {
                                    setShowCopyModal(false);
                                    setCopySource({ month: null, year: null });
                                    setSourceBudgetInfo(null);
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* No Budget Set */}
            {!budget && !isEditing && (
                <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">
                        No budget set for {getMonthName()} {viewingYear}
                    </p>
                    <div className="flex gap-2 justify-center">
                        <button
                            onClick={() => setIsEditing(true)}
                            className="px-4 py-2 bg-matcha-light hover:bg-matcha text-white rounded-md font-medium"
                        >
                            Set Budget
                        </button>
                        <button
                            onClick={() => {
                                const prev = getPreviousMonth();
                                setCopySource(prev);
                                fetchSourceBudgetInfo(prev.month, prev.year);
                                setShowCopyModal(true);
                            }}
                            className="px-4 py-2 border-2 border-matcha-light text-matcha-darker hover:bg-matcha-light hover:text-white rounded-md
   font-medium"
                        >
                            Copy from...
                        </button>
                    </div>
                </div>
            )}

            {/* Edit/Create Budget Form */}
            {isEditing && (
                <div className="space-y-4">
                    {/* Budget Type Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Budget Type
                        </label>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setBudgetType('GENERAL')}
                                className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                                    budgetType === 'GENERAL'
                                        ? 'border-matcha-light bg-matcha-light text-white'
                                        : 'border-gray-300 hover:border-matcha-light'
                                }`}
                            >
                                <div className="font-semibold">Fixed Budget</div>
                                <div className="text-xs mt-1 opacity-80">
                                    Set a total amount manually
                                </div>
                            </button>
                            <button
                                type="button"
                                onClick={() => setBudgetType('CATEGORY_SUM')}
                                className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                                    budgetType === 'CATEGORY_SUM'
                                        ? 'border-matcha-light bg-matcha-light text-white'
                                        : 'border-gray-300 hover:border-matcha-light'
                                }`}
                            >
                                <div className="font-semibold">Category Sum</div>
                                <div className="text-xs mt-1 opacity-80">
                                    Total from category budgets
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Amount Input - Only show for GENERAL type */}
                    {budgetType === 'GENERAL' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Budget Amount for {getMonthName()} {viewingYear}
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={budgetAmount}
                                onChange={(e) => setBudgetAmount(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2
  focus:ring-matcha-light"
                                placeholder="Enter budget amount"
                            />
                        </div>
                    )}

                    {/* Info message for CATEGORY_SUM type */}
                    {budgetType === 'CATEGORY_SUM' && (
                        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded border-dashed">
                            <p className="text-sm">
                                <strong> ⚠ Category Sum Mode:</strong> Your total budget will be calculated
                                from your category budgets below. Add category budgets after saving to
                                build your total budget.
                            </p>
                            {categoryBudgets.length > 0 && (
                                <p className="text-sm mt-2">
                                    Current category total: <strong>{formatCurrency(
                                    categoryBudgets.reduce((sum, cb) => sum + parseFloat(cb.amount), 0)
                                )}</strong>
                                </p>
                            )}
                        </div>
                    )}

                    {/* Save/Cancel Buttons */}
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
                                setBudgetType(budget?.budgetType || 'GENERAL');
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
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                        <div>
                            <p className="text-xs sm:text-sm font-bold text-gray-600">
                                Budget {budget.budgetType === 'CATEGORY_SUM' && <span className="text-xs font-normal">(from categories)</span>}
                            </p>
                            <p className="text-base sm:text-xl font-bold text-matcha-darker">
                                {formatCurrency(budget.effectiveAmount || budget.amount)}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs sm:text-sm font-bold text-gray-600">Spent</p>
                            <p className="text-base sm:text-xl font-bold text-matcha-darker">
                                {formatCurrency(monthlyExpenses)}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs sm:text-sm font-bold text-gray-600">Earned</p>
                            <p className="text-base sm:text-xl font-bold text-green-600">
                                {formatCurrency(monthlyIncome)}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs sm:text-sm font-bold text-gray-600">Remaining</p>
                            <p className={`text-base sm:text-xl font-bold ${getRemainingAmountColor()}`}>
                                {formatCurrency((budget.effectiveAmount || budget.amount) - monthlyExpenses)}
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