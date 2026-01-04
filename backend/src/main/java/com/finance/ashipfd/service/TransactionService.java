package com.finance.ashipfd.service;

import com.finance.ashipfd.dto.CreateTransactionRequest;
import com.finance.ashipfd.dto.TransactionResponse;
import com.finance.ashipfd.dto.UpdateTransactionRequest;
import com.finance.ashipfd.exception.TransactionNotFoundException;
import com.finance.ashipfd.model.Transaction;
import com.finance.ashipfd.model.User;
import com.finance.ashipfd.repository.TransactionRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

/**
 * TransactionService
 * Business logic for transaction operations
 * SECURITY: All methods check that the userId from JWT
 matches
 * the transaction owner - users can only access their own
 transactions obv
 */
@Service
public class TransactionService {
    private final TransactionRepository transactionRepository;
    private final UserService userService;

    public TransactionService(TransactionRepository transactionRepository, UserService userService) {
        this.transactionRepository = transactionRepository;
        this.userService = userService;
    }

    /**
     * Create a new transaction
     *
     * 1. Get userId from JWT (passed from controller)
     * 2. Fetch User entity
     * 3. Convert DTO → Entity
     * 4. Save to database
     * 5. Convert Entity → Response DTO
     *
     * @param req Transaction data from client
     * @param userId User ID from JWT token
     * @return Created transaction as DTO
     */
    public TransactionResponse createTransaction(CreateTransactionRequest req, Long userId) {
        // Fetch user
        User user = userService.findById(userId);

        // Build transaction entity
        Transaction transaction = new Transaction();
        transaction.setUser(user);
        transaction.setAmount(req.getAmount());
        transaction.setType(req.getType());
        transaction.setCategory(req.getCategory());
        transaction.setDescription(req.getDescription());

        // If no date given, j def to today
        transaction.setTransactionDate(
                req.getTransactionDate() != null
                        ? req.getTransactionDate()
                        : LocalDate.now()

        );

        Transaction createdTransaction = transactionRepository.save(transaction);

        return toDTO(createdTransaction);
    }

    /**
     * Get all transactions for a user
     *
     * @param userId User ID from JWT token
     * @return List of all user's transactions (newest
    first)
     */
    public List<TransactionResponse>
    getAllUserTransactions(Long userId) {
        List<Transaction> transactions =
                transactionRepository.findByUserIdOrderByTransactionDateDesc(userId);

        // Convert list of entities → list of DTOs
        return transactions.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get a single transaction by ID
     *
     * SECURITY: Verifies the transaction belongs to the
     requesting user
     *
     * @param transactionId Transaction ID
     * @param userId User ID from JWT token
     * @return Transaction DTO
     * @throws TransactionNotFoundException if not found or
    doesn't belong to user
     */
    public TransactionResponse getTransactionById(Long transactionId, Long userId) {
        Transaction transaction =
                transactionRepository.findById(transactionId)
                        .orElseThrow(() -> new
                                TransactionNotFoundException(transactionId));

        // SECURITY CHECK: Does this transaction belong to the requesting user?
        if (!transaction.getUser().getId().equals(userId))
        {
            throw new
                    TransactionNotFoundException(transactionId);
        }

        return toDTO(transaction);
    }

    /**
     * Update a transaction
     *
     * Only updates fields that are non-null in the request
     (partial update)
     *
     * SECURITY: Verifies the transaction belongs to the
     requesting user
     *
     * @param transactionId Transaction ID
     * @param request Update data (only non-null fields are
    updated)
     * @param userId User ID from JWT token
     * @return Updated transaction DTO
     * @throws TransactionNotFoundException if not found or
    doesn't belong to user
     */
    public TransactionResponse updateTransaction(
            Long transactionId,
            UpdateTransactionRequest req,
            Long userId
    ) {
        Transaction transaction =
                transactionRepository.findById(transactionId)
                        .orElseThrow(() -> new TransactionNotFoundException(transactionId));

        // SECURITY CHECK
        if (!transaction.getUser().getId().equals(userId))
        {
            throw new TransactionNotFoundException(transactionId);
        }

        // Update only non-null fields (partial update)
        if (req.getAmount() != null) {
            transaction.setAmount(req.getAmount());
        }
        if (req.getType() != null) {
            transaction.setType(req.getType());
        }
        if (req.getCategory() != null) {
            transaction.setCategory(req.getCategory());
        }
        if (req.getDescription() != null) {
            transaction.setDescription(req.getDescription());
        }
        if (req.getTransactionDate() != null) {
            transaction.setTransactionDate(req.getTransactionDate());
        }

        // Save and return
        Transaction updated = transactionRepository.save(transaction);
        return toDTO(updated);
    }

    /**
     * Delete a transaction
     *
     * SECURITY: Verifies the transaction belongs to the
     requesting user
     *
     * @param transactionId Transaction ID
     * @param userId User ID from JWT token
     * @throws TransactionNotFoundException if not found or
    doesn't belong to user
     */
    public void deleteTransaction(Long transactionId, Long userId) {
        Transaction transaction =
                transactionRepository.findById(transactionId)
                        .orElseThrow(() -> new TransactionNotFoundException(transactionId));

        // SECURITY CHECK
        if (!transaction.getUser().getId().equals(userId)) {
            throw new TransactionNotFoundException(transactionId);
        }

        transactionRepository.delete(transaction);
    }

    /**
     * helpMe: Convert Transaction entity →
     TransactionResponse DTO
     *
     * Keeps conversion logic in one place
     */
    private TransactionResponse toDTO(Transaction transaction) {
        return new TransactionResponse(
                transaction.getId(),
                transaction.getUser().getId(),
                transaction.getAmount(),
                transaction.getType(),
                transaction.getCategory(),
                transaction.getDescription(),
                transaction.getTransactionDate(),
                transaction.getCreatedAt()
        );
    }
}
