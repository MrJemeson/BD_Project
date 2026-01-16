package ru.bmstu.controller;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin
public class AdminController {

    private final JdbcTemplate jdbc;

    public AdminController(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @GetMapping("/tables")
    public List<String> tables() {
        return jdbc.queryForList("""
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
        """, String.class);
    }

    @GetMapping("/table/{name}")
    public List<Map<String, Object>> getTable(@PathVariable String name) {
        return jdbc.queryForList("SELECT * FROM " + name);
    }

    @PostMapping("/table/{name}")
    public ResponseEntity<?> insert(@PathVariable String name,
                                    @RequestBody Map<String, Object> body) {
        try {
            Map<String, Object> filtered = normalizeValues(name, body, true);

            if (filtered.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "No values provided"));
            }

            String columns = String.join(",", filtered.keySet());
            String values = filtered.keySet().stream()
                    .map(k -> "?")
                    .reduce((a, b) -> a + "," + b).orElse("");

            jdbc.update(
                    "INSERT INTO " + name + " (" + columns + ") VALUES (" + values + ")",
                    filtered.values().toArray()
            );
            return ResponseEntity.ok(Map.of("message", "Row created"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", extractRootMessage(e)));
        }
    }

    @PutMapping("/table/{name}")
    public void update(@PathVariable String name,
                       @RequestParam("idColumn") String idColumn,
                       @RequestParam("idValue") String idValue,
                       @RequestBody Map<String, Object> body) {

        Map<String, Object> normalized = normalizeValues(name, body, false);
        normalized.remove(idColumn);

        String setClause = normalized.keySet().stream()
                .map(k -> k + " = ?")
                .reduce((a, b) -> a + ", " + b).orElse("");

        Object[] values = new Object[normalized.size() + 1];
        System.arraycopy(normalized.values().toArray(), 0, values, 0, normalized.size());
        values[normalized.size()] = parseIdValue(idValue);

        jdbc.update(
                "UPDATE " + name + " SET " + setClause + " WHERE " + idColumn + " = ?",
                values
        );
    }

    @DeleteMapping("/table/{name}")
    public void delete(@PathVariable String name,
                       @RequestParam("idColumn") String idColumn,
                       @RequestParam("idValue") String idValue) {

        jdbc.update("DELETE FROM " + name + " WHERE " + idColumn + " = ?", parseIdValue(idValue));
    }

    private Object parseIdValue(String idValue) {
        if (idValue == null) {
            return null;
        }
        try {
            return Long.valueOf(idValue);
        } catch (NumberFormatException ex) {
            return idValue;
        }
    }

    private Map<String, Object> normalizeValues(String tableName, Map<String, Object> input, boolean filterNulls) {
        Map<String, String> columnTypes = getColumnTypes(tableName);
        Map<String, Object> normalized = new LinkedHashMap<>();

        input.forEach((key, value) -> {
            Object converted = convertValue(columnTypes.get(key), value);
            if (filterNulls) {
                if (converted != null) {
                    normalized.put(key, converted);
                }
            } else {
                normalized.put(key, converted);
            }
        });

        return normalized;
    }

    private Map<String, String> getColumnTypes(String tableName) {
        List<Map<String, Object>> rows = jdbc.queryForList("""
            SELECT column_name, data_type
            FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = ?
            """, tableName);

        Map<String, String> result = new java.util.HashMap<>();
        for (Map<String, Object> row : rows) {
            Object column = row.get("column_name");
            Object type = row.get("data_type");
            if (column != null && type != null) {
                result.put(column.toString(), type.toString());
            }
        }
        return result;
    }

    private Object convertValue(String dataType, Object value) {
        if (value == null) {
            return null;
        }
        if (!(value instanceof String text)) {
            return value;
        }

        String trimmed = text.trim();
        if (trimmed.isEmpty()) {
            return null;
        }

        if (dataType == null) {
            return trimmed;
        }

        return switch (dataType) {
            case "integer", "smallint", "bigint" -> Long.valueOf(trimmed);
            case "numeric", "real", "double precision" -> new BigDecimal(trimmed);
            case "boolean" -> parseBoolean(trimmed);
            case "date" -> LocalDate.parse(trimmed);
            case "timestamp without time zone", "timestamp with time zone" -> LocalDateTime.parse(trimmed);
            default -> trimmed;
        };
    }

    private Boolean parseBoolean(String value) {
        String normalized = value.toLowerCase();
        if (normalized.equals("true") || normalized.equals("t") || normalized.equals("1")) {
            return Boolean.TRUE;
        }
        if (normalized.equals("false") || normalized.equals("f") || normalized.equals("0")) {
            return Boolean.FALSE;
        }
        return null;
    }

    private String extractRootMessage(Throwable error) {
        Throwable root = error;
        while (root.getCause() != null && root.getCause() != root) {
            root = root.getCause();
        }
        return root.getMessage() == null ? error.getMessage() : root.getMessage();
    }

    @GetMapping("/users")
    public List<Map<String, Object>> getUsers() {
        return jdbc.queryForList("SELECT id, username, role FROM users ORDER BY username");
    }

    @PostMapping("/users")
    public void createUser(@RequestBody Map<String, Object> user) {
        jdbc.update("""
            INSERT INTO users (username, password, role, active)
            VALUES (?, ?, ?, true)
            """, user.get("username"), user.get("password"), user.get("role"));
    }

    @PutMapping("/users/{id}")
    public void updateUser(@PathVariable Long id, @RequestBody Map<String, Object> user) {
        String sql = "UPDATE users SET ";
        List<Object> params = new java.util.ArrayList<>();

        if (user.containsKey("username")) {
            sql += "username = ?, ";
            params.add(user.get("username"));
        }
        if (user.containsKey("password")) {
            sql += "password = ?, ";
            params.add(user.get("password"));
        }
        if (user.containsKey("role")) {
            sql += "role = ?, ";
            params.add(user.get("role"));
        }

        sql = sql.substring(0, sql.length() - 2) + " WHERE id = ?";
        params.add(id);

        jdbc.update(sql, params.toArray());
    }

    @DeleteMapping("/users/{id}")
    public void deleteUser(@PathVariable Long id) {
        jdbc.update("DELETE FROM users WHERE id = ?", id);
    }

    @GetMapping("/orders")
    public List<Map<String, Object>> getOrders() {
        return jdbc.queryForList("""
            SELECT o.id, o.creation_date, o.status, o.order_content, u.username as customer_name
            FROM orders o
            LEFT JOIN users u ON o.customer_id = u.id
            ORDER BY o.creation_date DESC
            """);
    }

    @GetMapping("/departments")
    public List<Map<String, Object>> getDepartments() {
        return jdbc.queryForList("SELECT id, name, type FROM departments ORDER BY name");
    }

    @PostMapping("/departments")
    public void createDepartment(@RequestBody Map<String, Object> dept) {
        jdbc.update("""
            INSERT INTO departments (name, type)
            VALUES (?, ?)
            """, dept.get("name"), dept.get("type"));
    }

    @PutMapping("/departments/{id}")
    public void updateDepartment(@PathVariable Long id, @RequestBody Map<String, Object> dept) {
        jdbc.update("""
            UPDATE departments SET name = ?, type = ? WHERE id = ?
            """, dept.get("name"), dept.get("type"), id);
    }

    @DeleteMapping("/departments/{id}")
    public void deleteDepartment(@PathVariable Long id) {
        jdbc.update("DELETE FROM departments WHERE id = ?", id);
    }

    @GetMapping("/documents")
    public List<Map<String, Object>> getDocuments() {
        return jdbc.queryForList("""
            SELECT id, name, creation_date, last_modified, content
            FROM documentation_archive
            ORDER BY creation_date DESC
            """);
    }

    @GetMapping("/plans")
    public List<Map<String, Object>> getPlans() {
        return jdbc.queryForList("""
            SELECT id, content, creation_date
            FROM production_plans_archive
            ORDER BY creation_date DESC
            """);
    }
}
