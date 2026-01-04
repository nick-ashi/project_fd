import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from '../../context/AuthContext.jsx';

/**
 * TRANSACTION EDITOR COMPONENT
 *
 * Will be used for addition of transaction + editing of a transaction
 *
 * 1. Enter info for transaction
 *  a. Date of transaction (defaults to today)
 *  b. Description for transaction (textbox)
 *  c. Category (String, --> should be own entity)
 */
export default function TransactionEditor() {
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        description: '',
        category: '',
        type: '',
        amount: '',
    });

    const nav = useNavigate();

    return (
        <div>
            <h1>Transaction Editor</h1>
            <form>
                <label htmlFor="date">Date</label>
                <input type="date" id="date" name="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
                <label htmlFor="description">Description</label>
                <input type="text" id="description" name="description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                <label htmlFor="category">Category</label>
                <input type="text" id="category" name="category" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} />
                <label htmlFor="type">Type</label>
                <select id="type" name="type" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                    <option value="income">Income</option>
                </select>
            </form>
        </div>
    )
}