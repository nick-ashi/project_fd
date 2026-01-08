import { TRANSACTION_CATEGORIES } from './constants.js';

/**
 * Format category enum name to display name
 */
export const formatCategoryName = (category) => {
    return TRANSACTION_CATEGORIES[category] || category;
};