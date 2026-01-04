package com.finance.ashipfd.repository;

import com.finance.ashipfd.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

/**
 * Repo interface for Users
 * Spring Data JPA auto implements this interface at runtime. That's pretty sick
 */

@Repository
// JpaRepository<Entity, IdType>
public interface UserRepository extends JpaRepository<User, Long> {
    /**
     * Find user by email
     *
     * @param email -- email to search for
     * @return Optional -- containing User if found, empty Optional if not found
     * <p>
     * Spring Data JPA auto gens the SQL query based on the method name:
     * SELECT * FROM users WHERE email = ?
     */
    Optional<User> findByEmail(String email);

    /**
     * Check if a user exists with the given email
     *
     * @param email -- given email to check
     * @return true -- if user exists, otherwise false
     *
     * Shud gen something like: SELECT COUNT(*) > 0 FROM users WHERE email = ?
     */
    boolean existsByEmail(String email);

}
