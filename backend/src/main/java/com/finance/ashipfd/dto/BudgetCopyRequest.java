package com.finance.ashipfd.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * dto for copying budget from one month to another
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BudgetCopyRequest {
    @NotNull
    @Min(value = 1, message = "Invalid Month")
    @Max(value = 12, message = "Invalid Month")
    private Integer sourceMonth;

    @NotNull
    @Min(value = 2000, message = "Invalid Year")
    @Max(value = 2100, message = "Invalid Year")
    private Integer sourceYear;

    @NotNull
    @Min(value = 1, message = "Invalid Month")
    @Max(value = 12, message = "Invalid Month")
    private Integer targetMonth;

    @NotNull
    @Min(value = 2000, message = "Invalid Year")
    @Max(value = 2100, message = "Invalid Year")
    private Integer targetYear;

    // For general budgets
    // Category budgets need the categories anyways
    private boolean copyBudgetAmount = true;
    private boolean copyCategories = true;
}
