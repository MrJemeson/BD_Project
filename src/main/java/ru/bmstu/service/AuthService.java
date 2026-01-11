package ru.bmstu.service;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import ru.bmstu.model.User;
import ru.bmstu.repository.UserRepository;

@Service
public class AuthService {

    private final UserRepository userRepository;
//    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User authenticate(String username, String password) {
        User user = userRepository.findByUsernameAndActiveTrue(username)
                .orElseThrow(() -> new RuntimeException("User not found"));


        if (password.equals(user.getPassword())) {
            throw new RuntimeException("Bad credentials");
        }
//        if (!encoder.matches(password, user.getPassword())) {
//            throw new RuntimeException("Bad credentials");
//        }

        return user;
    }

    public String resolveRedirect(String role) {
        return switch (role) {
            case "CLIENT" -> "client.html";
            case "MANAGER" -> "manager.html";
            case "DISPATCHER" -> "dispatcher.html";
            case "DEPARTMENT_EMPLOYEE" -> "department-emp.html";
            case "DOC_EMPLOYEE" -> "doc-emp.html";
            case "ADMIN" -> "admin.html";
            default -> throw new RuntimeException("Unknown role");
        };
    }
}
