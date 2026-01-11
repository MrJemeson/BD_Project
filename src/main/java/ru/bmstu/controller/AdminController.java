package ru.bmstu.controller;

import java.util.List;
import java.util.Map;

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
    public void insert(@PathVariable String name,
                       @RequestBody Map<String, Object> body) {

        String columns = String.join(",", body.keySet());
        String values = body.keySet().stream()
                .map(k -> "?")
                .reduce((a, b) -> a + "," + b).orElse("");

        jdbc.update(
                "INSERT INTO " + name + " (" + columns + ") VALUES (" + values + ")",
                body.values().toArray()
        );
    }

    @PutMapping("/table/{name}")
    public void update(@PathVariable String name,
                       @RequestParam String idColumn,
                       @RequestParam Object idValue,
                       @RequestBody Map<String, Object> body) {

        String setClause = body.keySet().stream()
                .map(k -> k + " = ?")
                .reduce((a, b) -> a + ", " + b).orElse("");

        Object[] values = new Object[body.size() + 1];
        System.arraycopy(body.values().toArray(), 0, values, 0, body.size());
        values[body.size()] = idValue;

        jdbc.update(
                "UPDATE " + name + " SET " + setClause + " WHERE " + idColumn + " = ?",
                values
        );
    }

    @DeleteMapping("/table/{name}")
    public void delete(@PathVariable String name,
                       @RequestParam String idColumn,
                       @RequestParam Object idValue) {

        jdbc.update("DELETE FROM " + name + " WHERE " + idColumn + " = ?", idValue);
    }

    // Specific endpoints for admin panel
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
