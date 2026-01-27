package com.finance.ashipfd.service;

import com.finance.ashipfd.model.BudgetType;
import com.finance.ashipfd.model.CategoryBudget;
import com.finance.ashipfd.repository.CategoryBudgetRepository;
import java.math.BigDecimal;
import java.util.List;
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
    private final CategoryBudgetRepository categoryBudgetRepository;

    public BudgetService(
            BudgetRepository budgetRepository,
            CategoryBudgetRepository categoryBudgetRepository,
            UserService userService) {
        this.budgetRepository = budgetRepository;
        this.categoryBudgetRepository = categoryBudgetRepository;
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

        Optional<Budget> existingBudget = budgetRepository.findByUserIdAndMonthAndYear(
                userId, req.getMonth(), req.getYear());

        Budget budget;
        if (existingBudget.isPresent()) {
            budget = existingBudget.get();
            // budget.setAmount(req.getAmount());
        } else {
            budget = new Budget();
            budget.setUser(user);
            budget.setMonth(req.getMonth());
            budget.setYear(req.getYear());
            // budget.setAmount(req.getAmount());
        }

        // Set budg type
        budget.setBudgetType(req.getBudgetType());

        // For GENERAL type, use the provided amount
        // For CATEGORY_SUM type, amount is calculated (store 0 or null as placeholder)
        if (req.getBudgetType() == BudgetType.GENERAL) {
            if (req.getAmount() == null) {
                throw new IllegalArgumentException("Amount is required for GENERAL budget type");
            }
            budget.setAmount(req.getAmount());
        } else {
            // CATEGORY_SUM: amount will be calculated dynamically
            // Store BigDecimal.ZERO as placeholder (actual amount comes from category budgets)
            budget.setAmount(BigDecimal.ZERO);
        }

        Budget savedBudget = budgetRepository.save(budget);
        return toDTO(savedBudget);
    }

    /**
     * Calculate the sum of all category budgets for a user/month/year
     * Used when budgetType is CATEGORY_SUM
     *
     * @param userId User ID
     * @param month Month (1-12)
     * @param year Year
     * @return Sum of all category budget amounts, or ZERO if none exist
     */
    private BigDecimal calculateCategoryBudgetSum(Long userId, Integer month, Integer year) {
        List<CategoryBudget> categoryBudgets = categoryBudgetRepository
                .findByUserIdAndMonthAndYear(userId, month, year);

        return categoryBudgets.stream()
                .map(CategoryBudget::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
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
        BigDecimal effectiveAmount;

        if (budget.getBudgetType() == BudgetType.CATEGORY_SUM) {
            // Calculate sum from category budgets
            effectiveAmount = calculateCategoryBudgetSum(
                    budget.getUser().getId(),
                    budget.getMonth(),
                    budget.getYear()
            );
        } else {
            // GENERAL type: use stored amount
            effectiveAmount = budget.getAmount();
        }

        BudgetResponse response = new BudgetResponse();
        response.setId(budget.getId());
        response.setUserId(budget.getUser().getId());
        response.setMonth(budget.getMonth());
        response.setYear(budget.getYear());
        response.setBudgetType(budget.getBudgetType());
        response.setAmount(budget.getAmount());
        response.setEffectiveAmount(effectiveAmount);
        response.setCreatedAt(budget.getCreatedAt());
        response.setUpdatedAt(budget.getUpdatedAt());

        return response;
    }
}