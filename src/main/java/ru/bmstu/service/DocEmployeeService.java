package ru.bmstu.service;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
public class DocEmployeeService {

    private final JdbcTemplate jdbc;

    public DocEmployeeService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<Map<String, Object>> getDocumentationArchive() {
        return jdbc.queryForList("""
            SELECT id, name, creation_date, last_modified, content
            FROM documentation_archive
            ORDER BY creation_date DESC
            """);
    }

    public void createDocument(String name, String content) {
        jdbc.update("""
            INSERT INTO documentation_archive (name, creation_date, last_modified, content)
            VALUES (?, ?, ?, ?)
            """, name, LocalDate.now(), LocalDate.now(), content);
    }

    public void updateDocument(Long documentId, String name, String content) {
        jdbc.update("""
            UPDATE documentation_archive SET name = ?, content = ?, last_modified = ? WHERE id = ?
            """, name, content, LocalDate.now(), documentId);
    }

    public void deleteDocument(Long documentId) {
        jdbc.update("""
            DELETE FROM documentation_archive WHERE id = ?
            """, documentId);
    }

    public List<Map<String, Object>> getIssuedCopies() {
        return jdbc.queryForList("""
            SELECT ic.id, ic.document_id, ic.department_id, ic.issue_date,
                   da.name as document_name, d.name as department_name
            FROM issued_copies ic
            JOIN documentation_archive da ON ic.document_id = da.id
            JOIN departments d ON ic.department_id = d.id
            ORDER BY ic.issue_date DESC
            """);
    }

    public void issueDocumentCopy(Long documentId, Long departmentId) {
        jdbc.update("""
            INSERT INTO issued_copies (document_id, department_id, issue_date)
            VALUES (?, ?, ?)
            """, documentId, departmentId, LocalDate.now());
    }

    public void revokeDocumentCopy(Long issuedCopyId) {
        jdbc.update("""
            DELETE FROM issued_copies WHERE id = ?
            """, issuedCopyId);
    }

    public List<Map<String, Object>> getDocumentationRequests() {
        return jdbc.queryForList("""
            SELECT dr.id, da.name as document_name, d.name as department_name,
                   dr.request_reason, dr.request_date, dr.status
            FROM documentation_requests dr
            JOIN documentation_archive da ON dr.document_id = da.id
            JOIN departments d ON dr.department_id = d.id
            ORDER BY dr.request_date DESC
            """);
    }

    public void approveDocumentationRequest(Long requestId) {
        Map<String, Object> request = jdbc.queryForMap("""
            SELECT document_id, department_id FROM documentation_requests WHERE id = ?
            """, requestId);

        Object documentIdValue = request.get("document_id");
        Object departmentIdValue = request.get("department_id");

        if (!(documentIdValue instanceof Number) || !(departmentIdValue instanceof Number)) {
            throw new IllegalStateException("Некорректные идентификаторы документа или отдела.");
        }

        Long documentId = ((Number) documentIdValue).longValue();
        Long departmentId = ((Number) departmentIdValue).longValue();

        issueDocumentCopy(documentId, departmentId);

        jdbc.update("""
            UPDATE documentation_requests SET status = 'Одобрено', response_date = CURRENT_DATE
            WHERE id = ?
            """, requestId);
    }

    public void rejectDocumentationRequest(Long requestId) {
        jdbc.update("""
            UPDATE documentation_requests SET status = 'Отклонено', response_date = CURRENT_DATE
            WHERE id = ?
            """, requestId);
    }

    public List<Map<String, Object>> getDepartments() {
        return jdbc.queryForList("""
            SELECT id, name, type FROM departments
            """);
    }
}


