package ru.bmstu.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import ru.bmstu.service.UserService;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {

        String username = credentials.get("username");
        String password = credentials.get("password");

        return userService.authenticate(username, password)
                .map(user -> {
                    String redirectUrl = resolveRedirectByRole(user.getRole());

                    return ResponseEntity.ok(Map.of(
                            "id", user.getId(),
                            "username", user.getUsername(),
                            "role", user.getRole(),
                            "redirectUrl", redirectUrl
                    ));
                })
                .orElseGet(() ->
                        ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                .body(Map.of("error", "Invalid credentials"))
                );
    }

    private String resolveRedirectByRole(String role) {
        String cleanRole = role.startsWith("ROLE_") ? role.substring(5) : role;
        return switch (cleanRole) {
            case "CLIENT" -> "client.html";
            case "MANAGER" -> "manager.html";
            case "DISPATCHER" -> "dispatcher.html";
            case "DEPARTMENT_EMPLOYEE" -> "department-emp.html";
            case "DOC_EMPLOYEE" -> "doc-emp.html";
            case "ADMIN" -> "admin.html";
            default -> throw new RuntimeException("Unknown role: " + role);
        };
    }
}
