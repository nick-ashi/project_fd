package com.finance.ashipfd.service;

import com.finance.ashipfd.dto.BudgetRequest;
import com.finance.ashipfd.dto.BudgetResponse;
import com.finance.ashipfd.model.Budget;
import com.finance.ashipfd.model.User;
import com.finance.ashipfd.repository.BudgetRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * BudgetService
 * Logic for budget ops
 */
@Service
public class BudgetService {
    private final BudgetRepository budgetRepository;
    private final UserService userService;

    public BudgetService(BudgetRepository budgetRepository, UserService userService) {
        this.budgetRepository = budgetRepository;
        this.userService = userService;
    }

    /**
     * Get budget for a specific month/year
     * Returns null if no budget
     *
     * @param userId User ID from JWT
     * @param month Month (1-12)
     * @param year Year
     * @return Budget DTO or null
     */
    public BudgetResponse getBudget(Long userId, Integer month, Integer year) {
        Optional<Budget> budget = budgetRepository.findByUserIdAndMonthAndYear(userId, month, year);
        return budget.map(this::toDTO).orElse(null);
    }

    /**
     * Set or update budget for a specific month/year
     *
     * If budget exists for that month/year -> update it
     * If budget doesn't exist -> create new one
     *
     * @param req Budget data (month, year, amount)
     * @param userId User ID from JWT
     * @return Created/updated budget DTO
     */
    public BudgetResponse setBudget(BudgetRequest req, Long userId) {
        User user = userService.findById(userId);

        Optional<Budget> existingBudget = budgetRepository.findByUserIdAndMonthAndYear(userId, req.getMonth(), req.getYear());

        Budget budget;
        if (existingBudget.isPresent()) {
            budget = existingBudget.get();
            budget.setAmount(req.getAmount());
        } else {
            budget = new Budget();
            budget.setUser(user);
            budget.setMonth(req.getMonth());
            budget.setYear(req.getYear());
            budget.setAmount(req.getAmount());
        }

        Budget savedBudget = budgetRepository.save(budget);
        return toDTO(savedBudget);
    }

    /**
     * Delete budget for a specific month/year
     *
     * @param userId User ID from JWT
     * @param month Month (1-12)
     * @param year Year
     */
    public void deleteBudget(Long userId, Integer month, Integer year) {
        Optional<Budget> budget = budgetRepository.findByUserIdAndMonthAndYear(userId, month, year);
        budget.ifPresent(budgetRepository::delete);
    }

    /**
     * Helper to convert Budget entity to DTO
     */
    private BudgetResponse toDTO(Budget budget) {
        return new BudgetResponse(
                budget.getId(),
                budget.getUser().getId(),
                budget.getMonth(),
                budget.getYear(),
                budget.getAmount(),
                budget.getCreatedAt(),
                budget.getUpdatedAt()
        );
    }
}