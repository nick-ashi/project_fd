package com.finance.ashipfd.dto;

import com.finance.ashipfd.model.TransactionCategory;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO for setting/updating category budget
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoryBudgetRequest {

    @NotNull(message = "Month is required")
    @Min(value = 1, message = "Please enter a valid numeric month")
    @Max(value = 12, message = "Please enter a valid numeric month")
    private Integer month;

    @NotNull(message = "Year is required")
    @Min(value = 2000, message = "Let's be realistic with the year ;)")
    @Max(value = 2200, message = "That's hopeful")
    private Integer year;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than $0")
    private BigDecimal amount;

    @NotNull(message = "Category required")
    private TransactionCategory category;
}
