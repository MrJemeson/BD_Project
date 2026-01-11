package ru.bmstu.service;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

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
            SELECT do.id, do.order_id, do.content, do.creation_date, do.status, do.last_modified,
                   o.order_content as original_order_content
            FROM department_orders do
            JOIN orders o ON do.order_id = o.id
            WHERE do.department_id = ?
            ORDER BY do.creation_date DESC
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

    // Получить информацию о пользователе по username
    public Map<String, Object> getUserInfo(String username) {
        return jdbc.queryForMap("""
            SELECT id, username, department_id FROM users WHERE username = ?
            """, username);
    }
}
