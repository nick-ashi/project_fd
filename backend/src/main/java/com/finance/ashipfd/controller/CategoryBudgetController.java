package com.finance.ashipfd.controller;

import com.finance.ashipfd.dto.CategoryBudgetRequest;
import com.finance.ashipfd.dto.CategoryBudgetResponse;
import com.finance.ashipfd.model.TransactionCategory;
import com.finance.ashipfd.service.CategoryBudgetService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * CategoryBudgetController
 * REST API for category budget operations
 * All endpoints require JWT auth
 * Base path: /api/budgets/categories
 *
 * Endpoints:
 * - GET        /api/budgets/categories?month=1&year=2026                       - Get all category budgets for month
 * - PUT        /api/budgets/categories                                         - Set/update category budget
 * - DELETE     /api/budgets/categories?month=1&year=2026&category=GROCERIES    - Delete category budget
 */
@RestController
@RequestMapping("/api/budgets/categories")
public class CategoryBudgetController {
    private final CategoryBudgetService categoryBudgetService;

    public CategoryBudgetController(CategoryBudgetService categoryBudgetService) {
        this.categoryBudgetService = categoryBudgetService;
    }

    /**
     * GET /api/budgets/categories?month=1&year=2026
     *
     * Get all category budgets for a month/year
     *
     * EXAMPL (200 OK):
     * [
     *   {
     *     "id": 1,
     *     "userId": 4,
     *     "month": 1,
     *     "year": 2026,
     *     "category": "GROCERIES",
     *     "amount": 400.00,
     *     "createdAt": "2026-01-04T10:00:00",
     *     "updatedAt": "2026-01-04T10:00:00"
     *   },
     *   {
     *     "id": 2,
     *     "userId": 4,
     *     "month": 1,
     *     "year": 2026,
     *     "category": "DINING_OUT",
     *     "amount": 200.00,
     *     "createdAt": "2026-01-04T10:05:00",
     *     "updatedAt": "2026-01-04T10:05:00"
     *   }
     * ]
     */
    @GetMapping
    public ResponseEntity<List<CategoryBudgetResponse>> getCategoryBudgets(
            @RequestParam Integer month,
            @RequestParam Integer year,
            Authentication auth
    ) {
        Long userId = (Long) auth.getPrincipal();
        List<CategoryBudgetResponse> categoryBudgets = categoryBudgetService.getCategoryBudgets(userId, month, year);
        return ResponseEntity.ok(categoryBudgets);
    }

    /**
     * PUT /api/budgets/categories
     *
     * Set / update categorybudget
     *
     * EXAMPLE:
     * {
     *   "month": 1,
     *   "year": 2026,
     *   "category": "GROCERIES",
     *   "amount": 400.00
     * }
     */
    @PutMapping
    public ResponseEntity<CategoryBudgetResponse> setCategoryBudget(
            @Valid @RequestBody CategoryBudgetRequest request,
            Authentication auth
    ) {
        Long userId = (Long) auth.getPrincipal();
        CategoryBudgetResponse budget = categoryBudgetService.setCategoryBudget(request, userId);

        return ResponseEntity.ok(budget);
    }

    /**
     * i.e. DELETE /api/budgets/categories?month=1&year=2026&category=GROCERIES
     *
     * Delete a category budget
     */
    @DeleteMapping
    public ResponseEntity<Void> deleteCategoryBudget(
            @RequestParam Integer month,
            @RequestParam Integer year,
            @RequestParam TransactionCategory category,
            Authentication auth
    ) {
        Long userId = (Long) auth.getPrincipal();
        categoryBudgetService.deleteCategoryBudget(userId, month, year, category);

        return ResponseEntity.noContent().build();
    }
}
