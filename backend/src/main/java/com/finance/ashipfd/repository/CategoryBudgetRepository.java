package com.finance.ashipfd.repository;

import com.finance.ashipfd.model.CategoryBudget;
import com.finance.ashipfd.model.TransactionCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryBudgetRepository extends JpaRepository<CategoryBudget, Long> {
    /**
     * Find all category budgets for a user for specific month/year
     * Returns all categories budgeted for
     * @param userId
     * @param month
     * @param year
     * @return
     */
    List<CategoryBudget> findByUserIdAndMonthAndYear(Long userId, Integer month, Integer year);

    /**
     * Find specific category budget
     * @param userId
     * @param month
     * @param year
     * @param category
     * @return
     */
    Optional<CategoryBudget> findByUserIdAndMonthAndYearAndCategory(
            Long userId,
            Integer month,
            Integer year,
            TransactionCategory category
    );

    /**
     * Check if category budget exists
     */
    boolean existsByUserIdAndMonthAndYearAndCategory(
            Long userId,
            Integer month,
            Integer year,
            TransactionCategory category
    );
}
