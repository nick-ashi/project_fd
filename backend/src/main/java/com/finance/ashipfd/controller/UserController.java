package com.finance.ashipfd.controller;

import com.finance.ashipfd.model.User;
import com.finance.ashipfd.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * GET /api/users/me
     *
     * Returns info abt the curr authd user
     *
     * HOW IT WORKS:
     * 1. JWT filter runs FIRST, extracts userId from token
     * 2. Sets userId in SecurityContext as the "principal"
     * 3. Spring auto-injects Authentication object into this method
     * 4. We extract userId from Authentication.getPrincipal()
     * 5. Look up user in database
     * 6. Return user info
     *
     * REQUIRES: Valid JWT in Authorization header
     *
     * EXAMPLE REQUEST:
     * GET /api/users/me
     * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     *
     * EXAMPLE RESPONSE (200 OK):
     * {
     *   "id": 1,
     *   "email": "john@example.com",
     *   "firstName": "John",
     *   "lastName": "Pork"
     * }
     */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication auth) {
        // Extract userId from SecurityContext
        // Set by JwtAuthenticationFilter
        Long userId = (Long)  auth.getPrincipal();

        // Look up user by Id
        User user = userService.findById(userId);

        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "email", user.getEmail(),
                "firstName", user.getFirstName(),
                "lastName", user.getLastName()
        ));
    }
}
