package com.finance.ashipfd.dto;

import com.finance.ashipfd.model.BudgetType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO for returning budget data to client
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BudgetResponse {
    private Long id;
    private Long userId;
    private Integer month;
    private Integer year;
    private BudgetType budgetType;
    private BigDecimal amount;
    /**
     * GENERAL budget: same as amount
     * CATEGORY_BUDGET budget: calculated from category budget totals
     */
    private BigDecimal effectiveAmount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}