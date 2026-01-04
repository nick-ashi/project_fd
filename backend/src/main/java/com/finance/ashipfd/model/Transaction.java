package com.finance.ashipfd.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Transaction Entity
 *
 * Represents a financial transaction (income or expense)
 * Each transaction belongs to a specific user
 *
 * WHY BigDecimal for amount?
 * - Float/Double have precision issues: 0.1 + 0.2 != 0.3
 * - BigDecimal is exact, critical for money
 *
 * WHY ManyToOne relationship?
 * - One User can have MANY Transactions
 * - Each Transaction belongs to ONE User
 */
@Entity
@Table(name = "transactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * FK to users table
     *
     * @ManyToOne - many transacs to ONE user
     * @JoinColumn - Specifies FK column name in this table
     * nullable=false --> Every transaction MUST have a user
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /**
     * Transaction amount
     *
     * precision=19 --> total digits including decimals
     * scale=2 --> Decimal places cuz working w cash
     */
    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    /**
     * TransactionType taken from the created enum
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionType type;

    /**
     * Category (like groceries, salary, subscription, etc.)
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionCategory category;

    /**
     * Optional description/notes
     */
    @Column(length=500)
    private String description;

    /**
     * When transaction occurred
     * (may be different from recorded time)
     */
    @Column(nullable=false)
    private LocalDate transactionDate;

    /**
     * When transaction was RECORDED in this system
     */
    @Column(nullable=false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * Auto-set createdAt before saving
     */
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
