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
        date: new Date().toISOString().split('T')[0],
        description: '',
        category: '',
        type: '',
        amount: '',
    });

    // If editing, populate form with existing transaction data
    useEffect(() => {
        if (transaction) {
            setFormData({
                amount: transaction.amount,
                description: transaction.description,
                category: transaction.category,
                type: transaction.type,
                transactionDate: transaction.transactionDate,
            });
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

    // Reset form to initial state
    const resetForm = () => {
        setFormData({
            date: new Date().toISOString().split('T')[0],
            description: '',
            category: '',
            type: '',
            amount: '',
        });
    }

    // Handle close
    const handleClose = () => {
        resetForm();
        onClose();
    }

    if (!isOpen) return null;
}

