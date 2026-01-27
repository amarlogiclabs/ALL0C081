package com.codearena.userservice.controller;

import com.codearena.userservice.dto.ApiResponse;
import com.codearena.userservice.dto.UserDTO;
import com.codearena.userservice.model.User;
import com.codearena.userservice.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    /**
     * Get all users
     * GET /api/users
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<UserDTO>>> getAllUsers() {
        List<UserDTO> users = userService.getAllUsers();
        return ResponseEntity.ok(
                ApiResponse.<List<UserDTO>>builder()
                        .success(true)
                        .data(users)
                        .message("Users retrieved successfully")
                        .build()
        );
    }

    /**
     * Get user by ID
     * GET /api/users/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDTO>> getUserById(@PathVariable String id) {
        Optional<UserDTO> user = userService.getUserById(id);
        if (user.isPresent()) {
            return ResponseEntity.ok(
                    ApiResponse.<UserDTO>builder()
                            .success(true)
                            .data(user.get())
                            .build()
            );
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.<UserDTO>builder()
                        .success(false)
                        .error("User not found")
                        .build()
                );
    }

    /**
     * Get user by email
     * GET /api/users/email/{email}
     */
    @GetMapping("/email/{email}")
    public ResponseEntity<ApiResponse<UserDTO>> getUserByEmail(@PathVariable String email) {
        Optional<UserDTO> user = userService.getUserByEmail(email);
        if (user.isPresent()) {
            return ResponseEntity.ok(
                    ApiResponse.<UserDTO>builder()
                            .success(true)
                            .data(user.get())
                            .build()
            );
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.<UserDTO>builder()
                        .success(false)
                        .error("User not found")
                        .build()
                );
    }

    /**
     * Get user by username
     * GET /api/users/username/{username}
     */
    @GetMapping("/username/{username}")
    public ResponseEntity<ApiResponse<UserDTO>> getUserByUsername(@PathVariable String username) {
        Optional<UserDTO> user = userService.getUserByUsername(username);
        if (user.isPresent()) {
            return ResponseEntity.ok(
                    ApiResponse.<UserDTO>builder()
                            .success(true)
                            .data(user.get())
                            .build()
            );
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.<UserDTO>builder()
                        .success(false)
                        .error("User not found")
                        .build()
                );
    }

    /**
     * Create new user
     * POST /api/users
     */
    @PostMapping
    public ResponseEntity<ApiResponse<UserDTO>> createUser(@RequestBody User user) {
        try {
            UserDTO createdUser = userService.createUser(user);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.<UserDTO>builder()
                            .success(true)
                            .data(createdUser)
                            .message("User created successfully")
                            .build()
                    );
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.<UserDTO>builder()
                            .success(false)
                            .error(e.getMessage())
                            .build()
                    );
        }
    }

    /**
     * Update user
     * PUT /api/users/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDTO>> updateUser(
            @PathVariable String id,
            @RequestBody User userDetails) {
        try {
            UserDTO updatedUser = userService.updateUser(id, userDetails);
            return ResponseEntity.ok(
                    ApiResponse.<UserDTO>builder()
                            .success(true)
                            .data(updatedUser)
                            .message("User updated successfully")
                            .build()
            );
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.<UserDTO>builder()
                            .success(false)
                            .error(e.getMessage())
                            .build()
                    );
        }
    }

    /**
     * Delete user
     * DELETE /api/users/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable String id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .success(true)
                        .message("User deleted successfully")
                        .build()
        );
    }

    /**
     * Health check endpoint
     * GET /api/users/health
     */
    @GetMapping("/health/check")
    public ResponseEntity<ApiResponse<String>> health() {
        return ResponseEntity.ok(
                ApiResponse.<String>builder()
                        .success(true)
                        .data("User Service is running")
                        .message("Health check passed")
                        .build()
        );
    }
}
