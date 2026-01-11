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

    // Просмотр активных заказов
    public List<Map<String, Object>> getActiveOrders() {
        return jdbc.queryForList("""
            SELECT o.id, o.creation_date, o.status, o.order_content, u.username as customer_name
            FROM orders o
            JOIN users u ON o.customer_id = u.id
            WHERE o.status NOT IN ('Завершен', 'Отклонен')
            ORDER BY o.creation_date DESC
            """);
    }

    // Просмотр всех заказов (журнал)
    public List<Map<String, Object>> getAllOrders() {
        return jdbc.queryForList("""
            SELECT o.id, o.creation_date, o.status, o.order_content, u.username as customer_name
            FROM orders o
            JOIN users u ON o.customer_id = u.id
            ORDER BY o.creation_date DESC
            """);
    }

    // Принять заказ
    public void approveOrder(Long orderId) {
        jdbc.update("""
            UPDATE orders SET status = 'Принят' WHERE id = ?
            """, orderId);
    }

    // Отклонить заказ
    public void rejectOrder(Long orderId) {
        jdbc.update("""
            UPDATE orders SET status = 'Отклонен' WHERE id = ?
            """, orderId);
    }

    // Завершить заказ
    public void completeOrder(Long orderId) {
        jdbc.update("""
            UPDATE orders SET status = 'Завершен' WHERE id = ?
            """, orderId);
    }

    // Просмотр планов производства
    public List<Map<String, Object>> getProductionPlans() {
        return jdbc.queryForList("""
            SELECT id, creation_date, last_modified, content
            FROM production_plans_archive
            ORDER BY creation_date DESC
            """);
    }

    // Добавить план производства
    public void createProductionPlan(String content) {
        jdbc.update("""
            INSERT INTO production_plans_archive (creation_date, last_modified, content)
            VALUES (?, ?, ?)
            """, LocalDate.now(), LocalDate.now(), content);
    }

    // Обновить план производства
    public void updateProductionPlan(Long planId, String content) {
        jdbc.update("""
            UPDATE production_plans_archive SET content = ?, last_modified = ? WHERE id = ?
            """, content, LocalDate.now(), planId);
    }

    // Удалить план производства
    public void deleteProductionPlan(Long planId) {
        jdbc.update("""
            DELETE FROM production_plans_archive WHERE id = ?
            """, planId);
    }
}

