package com.finance.ashipfd.service;

import com.finance.ashipfd.dto.CategoryBudgetRequest;
import com.finance.ashipfd.dto.CategoryBudgetResponse;
import com.finance.ashipfd.model.CategoryBudget;
import com.finance.ashipfd.model.TransactionCategory;
import com.finance.ashipfd.model.User;
import com.finance.ashipfd.repository.CategoryBudgetRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * CategoryBudgetService
 * Logic for category budget ops
 *
 * TODO:
 * [] Come back to document methods and such
 */
@Service
public class CategoryBudgetService {
    private final CategoryBudgetRepository categoryBudgetRepository;
    private final UserService userService;

    public CategoryBudgetService(CategoryBudgetRepository categoryBudgetRepository, UserService userService) {
        this.categoryBudgetRepository = categoryBudgetRepository;
        this.userService = userService;
    }

    public List<CategoryBudgetResponse> getCategoryBudgets(Long userId, Integer month, Integer year) {
        List<CategoryBudget> budgets = categoryBudgetRepository.findByUserIdAndMonthAndYear(userId, month, year);

        return budgets.stream().map(this::toDTO).collect(Collectors.toList());
    }

    public CategoryBudgetResponse setCategoryBudget(CategoryBudgetRequest req, Long userId) {
        User user = userService.findById(userId);

        Optional<CategoryBudget> existingBudget = categoryBudgetRepository
                .findByUserIdAndMonthAndYearAndCategory(
                        userId,
                        req.getMonth(),
                        req.getYear(),
                        req.getCategory()
                );

        CategoryBudget categoryBudget;
        if(existingBudget.isPresent()) {
            categoryBudget = existingBudget.get();
            categoryBudget.setAmount(req.getAmount());
        } else {
            categoryBudget = new CategoryBudget();
            categoryBudget.setUser(user);
            categoryBudget.setMonth(req.getMonth());
            categoryBudget.setYear(req.getYear());
            categoryBudget.setCategory(req.getCategory());
            categoryBudget.setAmount(req.getAmount());
        }

        CategoryBudget savedCategoryBudget = categoryBudgetRepository.save(categoryBudget);
        return toDTO(savedCategoryBudget);
    }

    public void deleteCategoryBudget(Long userId, Integer month, Integer year, TransactionCategory category) {
        Optional<CategoryBudget> budget = categoryBudgetRepository.findByUserIdAndMonthAndYearAndCategory(userId, month, year, category);

        budget.ifPresent(categoryBudgetRepository::delete);
    }

    public CategoryBudgetResponse toDTO(CategoryBudget budget) {
        return new CategoryBudgetResponse(
                budget.getId(),
                budget.getUser().getId(),
                budget.getMonth(),
                budget.getYear(),
                budget.getCategory(),
                budget.getAmount(),
                budget.getCreatedAt(),
                budget.getUpdatedAt()
        );
    }
}
