package ru.bmstu.service;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import ru.bmstu.repository.OrderRepository;
import ru.bmstu.repository.UserRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
public class ClientService {

    private final JdbcTemplate jdbc;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

    public ClientService(JdbcTemplate jdbc, UserRepository userRepository, OrderRepository orderRepository) {
        this.jdbc = jdbc;
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
    }

    public List<Map<String, Object>> getOrdersByClient(String username) {
        return jdbc.queryForList("""
            SELECT o.id, o.creation_date, o.status, o.order_content
            FROM orders o
            JOIN users u ON o.customer_id = u.id
            WHERE u.username = ?
            """, username);
    }

    public void createOrder(String username, String content) {
        if (username == null || username.trim().isEmpty()) {
            throw new IllegalArgumentException("Имя пользователя не может быть пустым");
        }
        if (content == null || content.trim().isEmpty()) {
            throw new IllegalArgumentException("Содержание заказа не может быть пустым");
        }

        // Get user id by username
        Long userId = jdbc.queryForObject("""
            SELECT id FROM users WHERE username = ? AND active = true
            """, Long.class, username);

        if (userId == null) {
            throw new IllegalArgumentException("Пользователь не найден: " + username);
        }

        jdbc.update("""
            INSERT INTO orders (creation_date, status, customer_id, order_content)
            VALUES (?, ?, ?, ?)
            """, LocalDate.now(), "Новый", userId, content);
    }
}
