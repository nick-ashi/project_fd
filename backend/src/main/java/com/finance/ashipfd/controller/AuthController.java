package com.finance.ashipfd.controller;

import com.finance.ashipfd.dto.LoginRequest;
import jakarta.validation.Valid;
import com.finance.ashipfd.dto.AuthResponse;
import com.finance.ashipfd.dto.RegisterRequest;
import com.finance.ashipfd.model.User;
import com.finance.ashipfd.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST Controller for authentication endpoints
 *  - Handles HTTP reqs
 *  - Auto converts Java objects to/from JSON
 *  - Returns HTTP responses
 *
 *  Like express routes:
 *      i.e. app.post('api/auth/register', (req, res) => {...})
 *  Spring does JSON parsing and res building auto :o
 */
@RestController // <-- Combines @Controller + @ResponseBody (auto JSON conversion)
@RequestMapping("/api/auth") // <-- Base path: all endpoints start with /api/auth
public class AuthController {
    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    /**
     * POST /api/auth/register
     *
     * Register a new user.
     * @PostMapping - This method handles POST requests to /register
     * @RequestBody - Take JSON from req body and convert to
    RegisterRequest
     * @Valid - Run validation checks from RegisterRequest
    (@NotBlank, @Email, etc.)
     *
     * REQUEST FLOW:
     * 1. Client sends: POST /api/auth/register with JSON body
     * 2. Spring deserializes JSON --> RegisterRequest object
     * 3. @Valid triggers validation (checks @NotBlank, @Email, etc.)
     * 4. If validation fails --> Spring returns 400 Bad Request
    automatically
     * 5. If validation passes --> our method runs
     * 6. We call userService.registerUser()
     * 7. Convert User entity --> AuthResponse DTO
     * 8. Spring serializes AuthResponse --> JSON
     * 9. Return 201 Created with JSON body
     *
     * EXAMPLE REQUEST:
     * POST /api/auth/register
     * Content-Type: application/json
     *
     * {
     *   "email": "john@example.com",
     *   "password": "securePass123",
     *   "firstName": "John",
     *   "lastName": "Pork"
     * }
     *
     * EXAMPLE RESPONSE (201 Created):
     * {
     *   "id": 1,
     *   "email": "john@example.com",
     *   "firstName": "John",
     *   "lastName": "Pork",
     *   "message": "Registration successful"
     * }
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        // Call service to register user
        User user = userService.registerUser(request);

        // Convert User entity to AuthResponse DTO
        AuthResponse response = new AuthResponse(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                "Registered Successfully"
        );

        // Return 201 created with resp body
        // ResponseEntity controls HTTP stat code
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * POST /api/auth/login
     *
     * Authenticating user and returning JWT
     *
     * REQ:
     * {
     *     "email": "john@gmail.com",
     *     "password": "password"
     * }
     * RES:
     * {
     *     "token": "tokeninsertedherelol"
     * }
     * ** Using wildcard responsentity type -- this could probably be
     * its own class LoginResponse or something, but for now j using a wildcard instead **
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
        String token = userService.loginUser(req);

        return ResponseEntity.ok(java.util.Map.of("token", token));
    }
}
