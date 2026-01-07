package com.finance.ashipfd.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * CategoryBudget Entity
 *
 * Represents a budget for a specific category within a month
 * Each user can set different budgets for different categories per month
 *
 * Example: January 2026 -> Groceries: $400, Dining Out: $200
 *
 * WHY separate from Budget?
 * - Budget = overall monthly spending limit
 * - CategoryBudget = specific category spending limit
 * - User can have both: "Spend max $2500 total, but only $200 on dining out"
 */
@Entity
@Table(name = "category_budgets",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "month", "year", "category"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoryBudget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private Integer month;

    @Column(nullable = false)
    private Integer year;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private TransactionCategory category;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
