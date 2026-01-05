package com.finance.ashipfd.model;

// Jakarta persistence API (JPA) = standard ORM (object-relational mapping)
// Tells Hibernate (our JPA impl) how to map this java class ot a database table
import jakarta.persistence.*;
import jakarta.persistence.Table;
// Using lombok to auto-generate boilerplate code at compile time
import lombok.AllArgsConstructor; // Gens a constructor with all params
import lombok.Cleanup;
import lombok.Data; // Generates getters, setters, toString, equals, hashCode
import lombok.NoArgsConstructor; // Generates a const with no params
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    // Id marks this field as the primary key
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(nullable = true)
    private Long monthlyBudget

    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
