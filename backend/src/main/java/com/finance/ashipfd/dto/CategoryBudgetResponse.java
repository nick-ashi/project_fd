package com.finance.ashipfd.dto;

import com.finance.ashipfd.model.TransactionCategory;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO for returning category budget data to client
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoryBudgetResponse {
    private Long id;
    private Long userId;
    private Integer month;
    private Integer year;
    private TransactionCategory category;
    private BigDecimal amount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
