package ru.bmstu.service;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
public class DispatcherService {

    private final JdbcTemplate jdbc;

    public DispatcherService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    // Просмотр всех заказов
    public List<Map<String, Object>> getAllOrders() {
        return jdbc.queryForList("""
            SELECT o.id, o.creation_date, o.status, o.order_content, u.username as customer_name
            FROM orders o
            JOIN users u ON o.customer_id = u.id
            ORDER BY o.creation_date DESC
            """);
    }

    // Просмотр заказов подразделений
    public List<Map<String, Object>> getDepartmentOrders() {
        return jdbc.queryForList("""
            SELECT dept_orders.id, dept_orders.order_id, dept_orders.department_id, dept_orders.content, dept_orders.creation_date,
                   dept_orders.status, dept_orders.last_modified, d.name as department_name
            FROM department_orders dept_orders
            JOIN departments d ON dept_orders.department_id = d.id
            ORDER BY dept_orders.creation_date DESC
            """);
    }

    // Добавить заказ подразделению
    public void createDepartmentOrder(Long orderId, Long departmentId, String content) {
        jdbc.update("""
            INSERT INTO department_orders (order_id, department_id, content, creation_date, status, last_modified)
            VALUES (?, ?, ?, ?, ?, ?)
            """, orderId, departmentId, content, LocalDate.now(), "Новый", LocalDate.now());
    }

    // Обновить заказ подразделению
    public void updateDepartmentOrder(Long deptOrderId, String content, String status) {
        jdbc.update("""
            UPDATE department_orders SET content = ?, status = ?, last_modified = ? WHERE id = ?
            """, content, status, LocalDate.now(), deptOrderId);
    }

    // Удалить заказ подразделению
    public void deleteDepartmentOrder(Long deptOrderId) {
        jdbc.update("""
            DELETE FROM department_orders WHERE id = ?
            """, deptOrderId);
    }

    // Просмотр планов производства
    public List<Map<String, Object>> getProductionPlans() {
        return jdbc.queryForList("""
            SELECT id, creation_date, last_modified, content
            FROM production_plans_archive
            ORDER BY creation_date DESC
            """);
    }

    // Получить список отделов
    public List<Map<String, Object>> getDepartments() {
        return jdbc.queryForList("""
            SELECT id, name, type FROM departments
            """);
    }
}





