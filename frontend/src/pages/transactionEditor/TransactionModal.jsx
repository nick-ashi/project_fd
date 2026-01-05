import { useState, useEffect } from 'react';

/**
 * TRANSACTION EDITOR MODAL
 *
 * Planned for both add and edit usage
 *
 * PROPERTIES:
 * - isOpen: bool (conrtols visibility)
 * - onClose: func (called when modal should close)
 * - onSave: func (called on submission)
 * - transaction: object (should contain pre-existing data if called on edit)
 */
export default function TransactionModal( { isOpen, onClose, onSave, transaction = null}) {
    const [formData, setFormData] = useState({
        transactionDate: new Date().toISOString().split('T')[0],
        description: '',
        category: '',
        type: 'EXPENSE',
        amount: '',
    });

    // Reset form to initial state
    const resetForm = () => {
        setFormData({
            date: new Date().toISOString().split('T')[0],
            description: '',
            category: '',
            type: 'EXPENSE',
            amount: '',
        });
    }

    // If editing, populate form with existing transaction data
    useEffect(() => {
        if (transaction) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setFormData({
                amount: transaction.amount,
                description: transaction.description || '',
                category: transaction.category,
                type: transaction.type,
                transactionDate: transaction.transactionDate,
            });
        } else {
            resetForm();
        }

    }, [transaction]);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
        resetForm();
    };

    // Handle close
    const handleClose = () => {
        resetForm();
        onClose();
    }

    if (!isOpen) return null;

    return (
        // Backdrop - full screen dark overlay
        <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={handleClose} // Close when clicking backdrop
        >
            {/* Modal Content - the actual white box */}
            <div
                className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-matcha-darker">
                        {transaction ? 'Edit Transaction' : 'Add Transaction'}
                    </h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                    >
                        ×
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Amount */}
                    <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                            Amount
                        </label>
                        <input
                            id="amount"
                            name="amount"
                            type="number"
                            step="0.01"
                            required
                            value={formData.amount}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-matcha-light"
                            placeholder="0.00"
                        />
                    </div>

                    {/* Type */}
                    <div>
                        <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                            Type
                        </label>
                        <select
                            id="type"
                            name="type"
                            required
                            value={formData.type}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-matcha-light"
                        >
                            <option value="INCOME">Income</option>
                            <option value="EXPENSE">Expense</option>
                        </select>
                    </div>

                    {/* Category */}
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                            Category
                        </label>
                        <select
                            id="category"
                            name="category"
                            required
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-matcha-light"
                        >
                            <option value="">Select a category</option>

                            {/* Income Categories */}
                            <optgroup label="Income">
                                <option value="SALARY">Salary</option>
                                <option value="BUSINESS_INCOME">Business Income</option>
                                <option value="INVESTMENT_RETURNS">Investment Returns</option>
                                <option value="RENTAL_INCOME">Rental Income</option>
                                <option value="GIFTS_RECEIVED">Gifts Received</option>
                                <option value="TAX_REFUND">Tax Refund</option>
                                <option value="BONUS">Bonus</option>
                                <option value="SIDE_HUSTLE">Side Hustle</option>
                                <option value="OTHER_INCOME">Other Income</option>
                            </optgroup>

                            {/* Expense Categories - Essential */}
                            <optgroup label="Essential Expenses">
                                <option value="RENT_MORTGAGE">Rent/Mortgage</option>
                                <option value="UTILITIES">Utilities</option>
                                <option value="GROCERIES">Groceries</option>
                                <option value="TRANSPORTATION">Transportation</option>
                                <option value="GAS">Gas/Fuel</option>
                                <option value="INSURANCE">Insurance</option>
                                <option value="PHONE_INTERNET">Phone & Internet</option>
                                <option value="HEALTHCARE">Healthcare</option>
                                <option value="DEBT_PAYMENTS">Debt Payments</option>
                            </optgroup>

                            {/* Expense Categories - Lifestyle */}
                            <optgroup label="Lifestyle">
                                <option value="DINING_OUT">Dining Out</option>
                                <option value="DELIVERY">Delivery</option>
                                <option value="ENTERTAINMENT">Entertainment</option>
                                <option value="SHOPPING">Shopping</option>
                                <option value="SUBSCRIPTIONS">Subscriptions</option>
                                <option value="GYM_FITNESS">Gym & Fitness</option>
                                <option value="TRAVEL">Travel</option>
                                <option value="HOBBIES">Hobbies</option>
                                <option value="PERSONAL_CARE">Personal Care</option>
                                <option value="GIFTS_GIVEN">Gifts Given</option>
                            </optgroup>

                            {/* Expense Categories - Financial */}
                            <optgroup label="Financial">
                                <option value="SAVINGS">Savings</option>
                                <option value="INVESTMENTS">Investments</option>
                                <option value="EMERGENCY_FUND">Emergency Fund</option>
                                <option value="RETIREMENT">Retirement</option>
                                <option value="TAXES">Taxes</option>
                                <option value="BANK_FEES">Bank Fees</option>
                            </optgroup>

                            {/* Miscellaneous */}
                            <optgroup label="Other">
                                <option value="EDUCATION">Education</option>
                                <option value="CHARITY">Charity/Donations</option>
                                <option value="PET_EXPENSES">Pet Expenses</option>
                                <option value="HOME_IMPROVEMENT">Home Improvement</option>
                                <option value="CLOTHING">Clothing</option>
                                <option value="BOOKS_MEDIA">Books & Media</option>
                                <option value="OTHER_EXPENSE">Other Expense</option>
                            </optgroup>
                        </select>
                    </div>

                    {/* Description */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                            Description (Optional)
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            rows="3"
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-matcha-light"
                            placeholder="Add notes..."
                        />
                    </div>

                    {/* Transaction Date */}
                    <div>
                        <label htmlFor="transactionDate" className="block text-sm font-medium text-gray-700 mb-1">
                            Date
                        </label>
                        <input
                            id="transactionDate"
                            name="transactionDate"
                            type="date"
                            required
                            value={formData.transactionDate}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-matcha-light"
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-matcha-light hover:bg-matcha text-white rounded-md font-medium"
                        >
                            {transaction ? 'Update' : 'Add'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

