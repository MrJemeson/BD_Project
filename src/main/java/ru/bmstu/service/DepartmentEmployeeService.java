package ru.bmstu.service;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
public class DepartmentEmployeeService {

    private final JdbcTemplate jdbc;

    public DepartmentEmployeeService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    // Просмотр заказов своего подразделения
    public List<Map<String, Object>> getDepartmentOrders(Long departmentId) {
        return jdbc.queryForList("""
            SELECT dept_orders.id, dept_orders.order_id, dept_orders.content, dept_orders.creation_date, dept_orders.status, dept_orders.last_modified,
                   o.order_content as original_order_content
            FROM department_orders dept_orders
            JOIN orders o ON dept_orders.order_id = o.id
            WHERE dept_orders.department_id = ?
            ORDER BY dept_orders.creation_date DESC
            """, departmentId);
    }

    // Просмотр документации доступной отделу (выданные копии)
    public List<Map<String, Object>> getAvailableDocumentation(Long departmentId) {
        return jdbc.queryForList("""
            SELECT da.id, da.name, da.creation_date, da.last_modified, da.content, ic.issue_date
            FROM documentation_archive da
            JOIN issued_copies ic ON da.id = ic.document_id
            WHERE ic.department_id = ?
            ORDER BY ic.issue_date DESC
            """, departmentId);
    }

    // Получить каталог документов для запроса с отметкой выдачи текущему отделу
    public List<Map<String, Object>> getDocumentationCatalog(Long departmentId) {
        return jdbc.queryForList("""
            SELECT da.id,
                   da.name,
                   EXISTS (
                       SELECT 1 FROM issued_copies ic
                       WHERE ic.document_id = da.id AND ic.department_id = ?
                   ) AS issued_to_department
            FROM documentation_archive da
            ORDER BY da.name
            """, departmentId);
    }

    // Создать запрос на получение документации
    public void createDocumentationRequest(Long departmentId, Long documentId, String requestReason) {
        jdbc.update("""
            INSERT INTO documentation_requests (document_id, department_id, request_reason)
            VALUES (?, ?, ?)
            """, documentId, departmentId, requestReason);
    }

    public int updateDepartmentOrderStatus(Long departmentId, Long deptOrderId, String status) {
        return jdbc.update("""
            UPDATE department_orders
            SET status = ?, last_modified = ?
            WHERE id = ? AND department_id = ?
            """, status, LocalDate.now(), deptOrderId, departmentId);
    }

    // Получить информацию о пользователе по username
    public Map<String, Object> getUserInfo(String username) {
        return jdbc.queryForMap("""
            SELECT id, username, department_id FROM users WHERE username = ?
            """, username);
    }
}
