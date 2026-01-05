package com.finance.ashipfd.repository;

import com.finance.ashipfd.model.Transaction;
import com.finance.ashipfd.model.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

/**
 * TransactionRepository
 *
 * Spring Data JPA auto-implements these methods based on naming
 conventions
 *
 * Method naming pattern:
 * - findBy[Field]                    --> Find by single field
 * - findBy[Field1]And[Field2]        --> Multiple conditions (AND)
 * - findBy[Field]OrderBy[Field]Desc  --> Sorted results
 * - findBy[Field]Between             --> Range queries
 *
 * Spring generates the SQL automatically!
 */
@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    /**
     * Find all transactions for a specific user
     * Ordered by transaction date (newest first)
     *
     * Generated SQL:
     * SELECT * FROM transactions
     * WHERE user_id = ?
     * ORDER BY transaction_date DESC
     */
    List<Transaction> findByUserIdOrderByCreatedAtDesc(
            Long userId
    );

    /**
     * Find transactions by user and type (INCOME or EXPENSE)
     *
     * Generated SQL:
     * SELECT * FROM transactions
     * WHERE user_id = __ and type = __
     * ORDER BY transaction_date DESC
     */
    List<Transaction> findByUserIdAndTypeOrderByTransactionDateDesc(
            Long userId, TransactionType type
    );

    /**
     * Find transactions by user within a date range
     * For monthly reports maybe? filtering by date range, etc.
     *
     * Generated SQL:
     * SELECT * FROM transactions
     * WHERE user_id = __
     * AND transaction_date BETWEEN __ AND __
     * ORDER BY transaction_date DESC
     */
    List<Transaction>
    findByUserIdAndTransactionDateBetweenOrderByTransactionDateDesc(
            Long userId,
            LocalDate startDate,
            LocalDate endDate
    );

    /**
     * Find transactions by user and category
     *
     * Generated SQL:
     * SELECT * FROM transactions
     * WHERE user_id = __ AND category = __
     * ORDER BY transaction_date DESC
     */
    List<Transaction>
    findByUserIdAndCategoryOrderByTransactionDateDesc(
            Long userId,
            String category
    );
}
