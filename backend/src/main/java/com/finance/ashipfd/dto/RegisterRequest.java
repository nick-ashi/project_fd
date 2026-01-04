package com.finance.ashipfd.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for user registration reqs
 * This reps the data we receive from the client when they try to register
 *
 * We use a separate dto INSTEAD of the User entity so that:
 * 1. We don't want client to set their own ID
 * 2. We need diff validation rules than the User entity
 * 3. We might not need all User fields during reg
 * 4. Separates API contract from database structure
 */

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    /**
     * Email addr of the User
     *
     * @NotBlank -- can't be null or empty
     * @Email - Has to be a valid email (user@example.com)
     *
     * Validation happens AUTO WOOHOO when the DTO is received in a controller if the controller method uses @Valid annotation
     */
    @NotBlank(message = "Email is required")
    @Email(message = "Must be a valid email address")
    private String email;

    /**
     * User's password (plain text from client, will encrypt before saving).
     *
     * @NotBlank - gotta have a value
     * @Size - gotta be at least 6 chars
     *
     * Security note: comes over HTTPS (encrypted in transit).
     * Will hash with BCrypt before storing in database
     */
    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    /**
     * User's first name (optional for registration).
     *
     * No validation - allowed to be null or empty.
     * User can update later in their profile..?
     */
    private String firstName;

    /**
     * User's last name (optional).
     *
     * No validation - allowed to be null or empty.
     */
    private String lastName;
}
