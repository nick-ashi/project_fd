package com.finance.ashipfd.dto;

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
    private BigDecimal amount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}