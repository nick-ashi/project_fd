package com.finance.ashipfd.dto;

import com.finance.ashipfd.model.TransactionCategory;
import com.finance.ashipfd.model.TransactionType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO for returning transaction data to client
 *
 * Converts Transaction entity => JSON response
 *
 * We include all transaction data but NOT the full User object
 * (j the userId for reference)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransactionResponse {
    private Long id;
    private Long userId;
    private BigDecimal amount;
    private TransactionType type;
    private TransactionCategory category;
    private String description;
    private LocalDate transactionDate;
    private LocalDateTime createdAt;
}
