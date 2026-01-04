package com.finance.ashipfd.dto;

import com.finance.ashipfd.model.TransactionCategory;
import com.finance.ashipfd.model.TransactionType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO for creating a new transaction
 *
 * Client sends this in the request body
 * We validate it, then convert to Transaction entity
 *
 * NOTE: We DON'T include userId here - we get that from the JWT token!
 * This prevents users from creating transactions for other users
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateTransactionRequest {
    /**
     * Amount needs to be positive (use type to indicate income/expense)
     */
    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    private BigDecimal amount;

    /**
     * Gotta be INCOME or EXPENSE
     */
    @NotNull(message = "Transaction type is required")
    private TransactionType type;

    /**
     * Category name (like grocery, salary)
     */
    @NotNull(message = "Category is required")
    private TransactionCategory category;

    /**
     * Optional desc
     */
    private String description;

    /**
     * When the transaction occurred
     * If not provided, we'll default to today
     */
    private LocalDate transactionDate;
}
