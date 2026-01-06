package com.finance.ashipfd.repository;

import com.finance.ashipfd.model.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {

    /**
     * Find budget for a specific user, month, and year
     */
    Optional<Budget> findByUserIdAndMonthAndYear(Long userId, Integer month, Integer year);

    /**
     * Check if budget exists for user/month/year
     */
    boolean existsByUserIdAndMonthAndYear(Long userId, Integer month, Integer year);
}