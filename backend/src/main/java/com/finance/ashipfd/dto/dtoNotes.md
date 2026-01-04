# What Are DTOs and Why Do We Need Them?
## DTO = Data Transfer Object
- DTOs are kinda like "specialized messengers" that carry data between layers of your application.
- Why not just use the User entity everywhere?
- java// BAD - Using User entity directly in API
```java
@PostMapping("/register")
public User register(@RequestBody User user) {  // Don't do ts
return userRepository.save(user);
}
```
Problems w this way:

Security: Exposes database structure to the outside world
Password exposure: Might accidentally return the password in the response
Over-fetching: Client might send fields we don't want (like setting their own ID)
Tight coupling: API is tied to database schema - if database changes, API breaks
Validation: Can't have different validation rules for different operations

SOOOO Instead - Use DTOs:
java// GOOD - Using DTOs
```java
@PostMapping("/register")
public AuthResponse register(@RequestBody RegisterRequest request) {  // way better
// Control exactly what comes in and goes out
}
```
Benefits:
- we only expose what's needed
- Different DTOs for different operations (register vs. update profile)
- Keep passwords out of responses
- API independent of database schema
- Custom validation per endpoint