package ru.bmstu.service;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
public class ManagerService {

    private final JdbcTemplate jdbc;

    public ManagerService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<Map<String, Object>> getActiveOrders() {
        return jdbc.queryForList("""
            SELECT o.id, o.creation_date, o.status, o.order_content, u.username as customer_name
            FROM orders o
            JOIN users u ON o.customer_id = u.id
            WHERE o.status NOT IN ('Завершен', 'Отклонен')
            ORDER BY o.creation_date DESC
            """);
    }

    public List<Map<String, Object>> getAllOrders() {
        return jdbc.queryForList("""
            SELECT o.id, o.creation_date, o.status, o.order_content, u.username as customer_name
            FROM orders o
            JOIN users u ON o.customer_id = u.id
            ORDER BY o.creation_date DESC
            """);
    }

    public void approveOrder(Long orderId) {
        jdbc.update("""
            UPDATE orders SET status = 'Принят' WHERE id = ?
            """, orderId);
    }

    public void rejectOrder(Long orderId) {
        jdbc.update("""
            UPDATE orders SET status = 'Отклонен' WHERE id = ?
            """, orderId);
    }

    public void completeOrder(Long orderId) {
        jdbc.update("""
            UPDATE orders SET status = 'Завершен' WHERE id = ?
            """, orderId);
    }

    public List<Map<String, Object>> getProductionPlans() {
        return jdbc.queryForList("""
            SELECT id, creation_date, last_modified, content
            FROM production_plans_archive
            ORDER BY creation_date DESC
            """);
    }

    public void createProductionPlan(String content) {
        jdbc.update("""
            INSERT INTO production_plans_archive (creation_date, last_modified, content)
            VALUES (?, ?, ?)
            """, LocalDate.now(), LocalDate.now(), content);
    }

    public void updateProductionPlan(Long planId, String content) {
        jdbc.update("""
            UPDATE production_plans_archive SET content = ?, last_modified = ? WHERE id = ?
            """, content, LocalDate.now(), planId);
    }

    public void deleteProductionPlan(Long planId) {
        jdbc.update("""
            DELETE FROM production_plans_archive WHERE id = ?
            """, planId);
    }
}

