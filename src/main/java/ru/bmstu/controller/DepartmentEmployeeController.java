package ru.bmstu.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.bmstu.service.DepartmentEmployeeService;

import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/department-employee")
@CrossOrigin
public class DepartmentEmployeeController {

    private final DepartmentEmployeeService departmentEmployeeService;

    public DepartmentEmployeeController(DepartmentEmployeeService departmentEmployeeService) {
        this.departmentEmployeeService = departmentEmployeeService;
    }

    private Long extractDepartmentId(Map<String, Object> userInfo) {
        Object value = userInfo.get("department_id");
        if (value == null) {
            return null;
        }
        if (value instanceof Number) {
            return ((Number) value).longValue();
        }
        try {
            return Long.parseLong(value.toString());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    @GetMapping("/orders")
    public ResponseEntity<List<Map<String, Object>>> getDepartmentOrders(@RequestParam String username) {
        try {
            Map<String, Object> userInfo = departmentEmployeeService.getUserInfo(username);
            Long departmentId = extractDepartmentId(userInfo);

            if (departmentId == null) {
                return ResponseEntity.ok(List.of()); // Return empty list instead of error
            }

            return ResponseEntity.ok(departmentEmployeeService.getDepartmentOrders(departmentId));
        } catch (Exception e) {
            System.err.println("Error getting department orders: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.ok(List.of()); // Return empty list on error
        }
    }

    @GetMapping("/documentation")
    public ResponseEntity<List<Map<String, Object>>> getAvailableDocumentation(@RequestParam String username) {
        try {
            Map<String, Object> userInfo = departmentEmployeeService.getUserInfo(username);
            Long departmentId = extractDepartmentId(userInfo);

            if (departmentId == null) {
                return ResponseEntity.ok(List.of());
            }

            return ResponseEntity.ok(departmentEmployeeService.getAvailableDocumentation(departmentId));
        } catch (Exception e) {
            System.err.println("Error getting available documentation: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.ok(List.of());
        }
    }

    @GetMapping("/documentation-catalog")
    public ResponseEntity<List<Map<String, Object>>> getDocumentationCatalog(@RequestParam String username) {
        try {
            Map<String, Object> userInfo = departmentEmployeeService.getUserInfo(username);
            Long departmentId = extractDepartmentId(userInfo);

            if (departmentId == null) {
                return ResponseEntity.ok(List.of());
            }

            return ResponseEntity.ok(departmentEmployeeService.getDocumentationCatalog(departmentId));
        } catch (Exception e) {
            System.err.println("Error getting documentation catalog: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.ok(List.of());
        }
    }

    @PostMapping("/documentation-request")
    public ResponseEntity<?> createDocumentationRequest(@RequestParam String username,
                                                       @RequestBody Map<String, Object> requestData) {
        try {
            Map<String, Object> userInfo = departmentEmployeeService.getUserInfo(username);
            Long departmentId = extractDepartmentId(userInfo);

            if (departmentId == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "User not assigned to department"));
            }

            Long documentId = Long.valueOf(requestData.get("documentId").toString());
            String requestReason = (String) requestData.get("reason");

            departmentEmployeeService.createDocumentationRequest(departmentId, documentId, requestReason);
            return ResponseEntity.ok(Map.of("message", "Documentation request submitted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/orders/{deptOrderId}/status")
    public ResponseEntity<?> updateDepartmentOrderStatus(@PathVariable Long deptOrderId,
                                                         @RequestParam String username,
                                                         @RequestBody Map<String, Object> statusData) {
        try {
            Map<String, Object> userInfo = departmentEmployeeService.getUserInfo(username);
            Long departmentId = extractDepartmentId(userInfo);

            if (departmentId == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "User not assigned to department"));
            }

            Object statusValue = statusData.get("status");
            if (statusValue == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Status is required"));
            }

            String status = statusValue.toString();
            Set<String> allowedStatuses = Set.of("Новый", "В процессе", "Завершен");
            if (!allowedStatuses.contains(status)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Unsupported status"));
            }

            int updated = departmentEmployeeService.updateDepartmentOrderStatus(departmentId, deptOrderId, status);
            if (updated == 0) {
                return ResponseEntity.status(404).body(Map.of("error", "Order not found for department"));
            }

            return ResponseEntity.ok(Map.of("message", "Order status updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
