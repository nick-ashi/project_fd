package com.finance.ashipfd.controller;

import com.finance.ashipfd.dto.BudgetRequest;
import com.finance.ashipfd.dto.BudgetResponse;
import com.finance.ashipfd.service.BudgetService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * BudgetController
 * REST API for budget operations
 * All endpoints require JWT auth
 * Base path: /api/budgets
 *
 * Endpoints:
 * - GET    /api/budgets?month=1&year=2026  - Get budget for month/year
 * - PUT    /api/budgets                    - Set/update budget
 * - DELETE /api/budgets?month=1&year=2026  - Delete budget
 */
@RestController
@RequestMapping("/api/budgets")
public class BudgetController {
    private final BudgetService budgetService;

    public BudgetController(BudgetService budgetService) {
        this.budgetService = budgetService;
    }

    /**
     * GET /api/budgets?month=1&year=2026
     *
     * Get budget for a specific month/year
     *
     * @param month
     * @param year
     * @param auth
     * @return
     */
    @GetMapping
    public ResponseEntity<BudgetResponse> getBudget(
            @RequestParam Integer month, @RequestParam Integer year, Authentication auth
    ) {
        Long userId = (Long) auth.getPrincipal();
        BudgetResponse budget = budgetService.getBudget(userId, month, year);

        if (budget == null) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(budget);
    }

    /**
     * PUT /api/budgets
     *
     * Set or update budget for a month/year
     * If budget exists -> updates amt
     * If budget doesn't exist -> creates new
     *
     * EXAMPLE REQUEST:
     * PUT /api/budgets
     * Authorization: Bearer <JWT_TOKEN>
     * Content-Type: application/json
     *
     * {
     *   "month": 1,
     *   "year": 2026,
     *   "amount": 2500.00
     * }
     *
     * EXAMPLE RESPONSE (200 OK):
     * {
     *   "id": 1,
     *   "userId": 4,
     *   "month": 1,
     *   "year": 2026,
     *   "amount": 2500.00,
     *   "createdAt": "2026-01-04T10:00:00",
     *   "updatedAt": "2026-01-04T10:00:00"
     * }
     */
    @PutMapping
    public ResponseEntity<BudgetResponse> setBudget(
            @Valid @RequestBody BudgetRequest request,
            Authentication auth
    ) {
        Long userId = (Long) auth.getPrincipal();
        BudgetResponse budget = budgetService.setBudget(request, userId);

        return ResponseEntity.ok(budget);
    }

    /**
     * DELETE /api/budgets?month=1&year=2026
     *
     * Delete budget for specific month/year
     */
    @DeleteMapping
    public ResponseEntity<Void> deleteBudget(
            @RequestParam Integer month,
            @RequestParam Integer year,
            Authentication auth
    ) {
        Long userId = (Long) auth.getPrincipal();
        budgetService.deleteBudget(userId, month, year);

        return ResponseEntity.noContent().build();
    }
}
