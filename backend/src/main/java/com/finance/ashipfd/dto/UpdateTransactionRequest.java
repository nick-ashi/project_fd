package com.finance.ashipfd.dto;

import com.finance.ashipfd.model.TransactionCategory;
import com.finance.ashipfd.model.TransactionType;
import jakarta.validation.constraints.DecimalMin;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO for updating an existing transaction
 *
 * All fields are optional - user can update just what they want
 * If a field is null, we won't update it
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateTransactionRequest {
    @DecimalMin(value = "0.01", message = "Amount must be greater than $0")
    private BigDecimal amount;

    private TransactionType type;

    private TransactionCategory category;

    private String description;

    private LocalDate transactionDate;
}
