package com.finance.ashipfd.controller;

import com.finance.ashipfd.dto.CreateTransactionRequest;
import com.finance.ashipfd.dto.TransactionResponse;
import com.finance.ashipfd.dto.UpdateTransactionRequest;
import com.finance.ashipfd.service.TransactionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * TransactionController
 * REST API for transaction operations
 * All endpoints require JWT auth (configured in
 SecurityConfig)
 * Bp: /api/transactions
 * Endpoints:
 * - POST   /api/transactions          - Create new transaction
 * - GET    /api/transactions          - Get all user's transactions
 * - GET    /api/transactions/{id}     - Get single transaction
 * - PUT    /api/transactions/{id}     - Update transaction
 * - DELETE /api/transactions/{id}     - Delete transaction
 */
@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    /**
     * POST /api/transactions
     *
     * Create a new transaction
     *
     * EXAMPLE REQUEST:
     * POST /api/transactions
     * Authorization: Bearer <JWT_TOKEN>
     * Content-Type: application/json
     *
     * {
     *   "amount": 45.50,
     *   "type": "EXPENSE",
     *   "category": "Groceries",
     *   "description": "Daily coffeeeeeeeeee",
     *   "transactionDate": "2025-12-15"
     * }
     *
     * EXAMPLE RESPONSE (201 Created):
     * {
     *   "id": 1,
     *   "userId": 4,
     *   "amount": 45.50,
     *   "type": "EXPENSE",
     *   "category": "Groceries",
     *   "description": "Weekly order of coffee beans",
     *   "transactionDate": "2025-12-15",
     *   "createdAt": "2025-12-15T14:30:00"
     * }
     */
    @PostMapping
    public ResponseEntity<TransactionResponse> createTransaction(
            @Valid @RequestBody CreateTransactionRequest req,
            Authentication auth
    ) {
        Long userId = (Long) auth.getPrincipal();

        TransactionResponse transactionResponse = transactionService.createTransaction(req, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(transactionResponse);
    }

    /**
     * GET /api/transactions
     *
     * Get all transactions for authd user
     * Returns transactions ordered by date (newest first)
     *
     EXAMPLE REQUEST:
     * GET /api/transactions
     * Authorization: Bearer <JWT_TOKEN>
     *
     * EXAMPLE RESPONSE (200 OK):
     * [
     *   {
     *     "id": 2,
     *     "userId": 4,
     *     "amount": 6000.00,
     *     "type": "INCOME",
     *     "category": "Salary",
     *     "description": "Monthly salary",
     *     "transactionDate": "2025-01-15",
     *     "createdAt": "2025-01-15T09:00:00"
     *   },
     *   {
     *     "id": 1,
     *     "userId": 4,
     *     "amount": 67.50,
     *     "type": "EXPENSE",
     *     "category": "Groceries",
     *     "description": "Weekly groceries",
     *     "transactionDate": "2025-12-14",
     *     "createdAt": "2025-12-14T18:30:00"
     *   }
     */
    @GetMapping
    public ResponseEntity<List<TransactionResponse>> getAllTransactions(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        List<TransactionResponse> transactions = transactionService.getAllUserTransactions(userId);

        return ResponseEntity.ok(transactions);
    }

    /**
     * GET /api/transactions/{id}
     *
     * Get a single transaction by ID
     * Only returns IF trans belongs to authd user
     *
     * EXAMPLE:
     * GET /api/transactions/123
     * Authorization: Bearer <JWT>
     * EX. RESPONSE (200 OK):
     * {
     *     "id": 123,
     *     "userId": 4,
     *     "amount": 67.50,
     *     "type": "EXPENSE",
     *     "category": "Dinner",
     *     "description": "Dinner at Maro",
     *     "transactionDate": "2025-12-15",
     *     "createdAt": "2025-12-15T19:30:45"
     * }
     */
    @GetMapping("/{id}")
    public ResponseEntity<TransactionResponse> getTransactionById(
            @PathVariable Long id,
            Authentication auth
    ) {
        Long userId = (Long) auth.getPrincipal();
        TransactionResponse transaction = transactionService.getTransactionById(id, userId);

        return ResponseEntity.ok(transaction);
    }

    /**
     * PUT /api/transactions/{id}
     *
     * Update existing transaction
     * Only updates fields provided in request (partial update)
     * Only works if transaction is from authd user
     *
     * EXAMPLE REQUEST:
     * PUT /api/transactions/123
     * Authorization: Bearer <JWT_TOKEN>
     * Content-Type: application/json
     *
     * {
     *   "amount": 23.75,
     *   "description": "Snacks"
     * }
     *
     * EXAMPLE RES (200 OK):
     * {
     *   "id": 123,
     *   "userId": 5,
     *   "amount": 23.75,
     *   "type": "EXPENSE",
     *   "category": "Groceries",
     *   "description": "Snacks",
     *   "transactionDate": "2025-12-14",
     *   "createdAt": "2025-12-14T18:30:00"
     * }
     */
    @PutMapping("/{id}")
    public ResponseEntity<TransactionResponse> updateTransaction(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTransactionRequest req,
            Authentication auth
    ) {
        Long userId = (Long) auth.getPrincipal();
        TransactionResponse updatedTransaction = transactionService.updateTransaction(id, req, userId);

        return ResponseEntity.ok(updatedTransaction);
    }

    /**
     * DELETE /api/transactions/{id}
     * Delete a transaction
     * Only works if transaction belongs to authenticated user
     *
     * EXAMPLE REQ:
     * DELETE /api/transactions/123
     * Authorization: Bearer <JWT>
     *
     * EXAMPLE RES (204 No Content):
     * (empty body)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransaction(
            @PathVariable Long id,
            Authentication authentication
    ) {
        Long userId = (Long) authentication.getPrincipal();

        transactionService.deleteTransaction(id, userId);

        // 204 No Content - successfully del, no res body
        return ResponseEntity.noContent().build();
    }
}
