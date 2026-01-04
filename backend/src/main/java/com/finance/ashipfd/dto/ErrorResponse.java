package com.finance.ashipfd.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ErrorResponse {
    // when
    private LocalDateTime timestamp;

    // http status codes
    private int status;

    // actual error
    private String error;

    // human readable ver of error
    private String message;
}
