package com.finance.ashipfd.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;

/**
 * JWT Auth Filter
 * NOTES FOR ME:
 *  - Run BEFORE controller
 *  - Express equivalent: app.use((req, res, next) => {...})
 *  - Can inspect/mod reqs and responses
 *
 *  OncePerReqFilter makes sure this runs ONCE PER REQ since spring could process the same req multiple times internally
 *
 *  WHAT THIS FILTER ACTUALLY DO ?
 *  1. EXTRACT JWT token from auth header
 *  2. VALIDATE the token
 *  3. EXTRACT user info from token
 *  4. Tells Spring Security: "Trust me man this user is authenticated"
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    public JwtAuthenticationFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest req,
            HttpServletResponse res,
            FilterChain filterChain
    ) throws ServletException, IOException {
        // 1. Extract JWT token from Authorization header
        String header = req.getHeader("Authorization");

        // Check if we're getting a valid header
        if (header == null || !header.startsWith("Bearer ")) {
            filterChain.doFilter(req, res);
            return;
        }

        // Extract the actual token (remove "Bearer " prefix)
        // e.g. "Bearer eyJhbG..." --> "eyJhbG..."
        String token = header.substring(7);

        try {
            if (jwtUtil.validateToken(token)) {
                String email = jwtUtil.getEmailFromToken(token);
                Long userId = jwtUtil.getUserIdFromToken(token);

                // Create auth object
                UsernamePasswordAuthenticationToken auth =
                        new UsernamePasswordAuthenticationToken(
                                userId,
                                null,
                                new ArrayList<>()
                        );
                // Add request details
                auth.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(req)
                );

                // Put auth in securityContext
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        } catch (Exception e) {
            // Token validation failed - silently continue without auth
            // The sec filter chain will handle unauthorized access
        }

        filterChain.doFilter(req, res);

    }

}
