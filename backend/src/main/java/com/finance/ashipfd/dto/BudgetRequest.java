package com.finance.ashipfd.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO for setting/updating monthly budget
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BudgetRequest {

    @NotNull(message = "Month is required")
    @Min(value = 1, message = "Please enter a valid month number")
    @Max(value = 12, message = "Please enter a valid month number")
    private Integer month;

    @NotNull(message = "Year is required")
    @Min(value = 2000, message = "No going back in time")
    @Max(value = 2100, message = "That's a hopeful amount of time you're entering..")
    private Integer year;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than $0")
    private BigDecimal amount;


}