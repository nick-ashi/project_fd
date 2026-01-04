package com.finance.ashipfd.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.repository.cdi.Eager;

/**
 * Client sends:
 * {
 *     "email": "nathanforyou@gmail.com",
 *     "password": "ihopeyourehungry"
 * }
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {

    @Email (message = "Must be a valid email address.")
    @NotBlank (message = "Email cannot be blank.")
    private String email;

    @NotBlank (message = "Password is REQUIRED. DUH.")
    private String password;
}
