package com.finance.ashipfd.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for auth responses.
 *
 * Separate response DTO for...
 *  - Never sending pw (even hashed) to client
 *  - We only send back what client needs to know
 *  - Decouple API from db structure
 * Client gets:
 * {
 *     "id": 1,
 *     "email": "user@ex.com",
 *     "firstName": "John",
 *     "lastName": "Pork",
 *     "message": "Successfully registered"
 * }
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String message;
}
