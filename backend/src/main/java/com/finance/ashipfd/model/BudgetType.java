package com.finance.ashipfd.model;

/**
 * Budget types can be either general (one total sum with category split optional)
 * OR category_sum (start with the cats, total budget will come from there)
 */
public enum BudgetType {
    GENERAL,
    CATEGORY_SUM
}
