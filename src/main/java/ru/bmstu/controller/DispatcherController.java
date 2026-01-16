package ru.bmstu.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.bmstu.service.DispatcherService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dispatcher")
@CrossOrigin
public class DispatcherController {

    private final DispatcherService dispatcherService;

    public DispatcherController(DispatcherService dispatcherService) {
        this.dispatcherService = dispatcherService;
    }

    @GetMapping("/orders")
    public ResponseEntity<List<Map<String, Object>>> getAllOrders() {
        return ResponseEntity.ok(dispatcherService.getAllOrders());
    }

    @GetMapping("/department-orders")
    public ResponseEntity<List<Map<String, Object>>> getDepartmentOrders() {
        return ResponseEntity.ok(dispatcherService.getDepartmentOrders());
    }

    @PostMapping("/department-orders")
    public ResponseEntity<?> createDepartmentOrder(@RequestBody Map<String, Object> orderData) {
        try {
            Long orderId = Long.valueOf(orderData.get("orderId").toString());
            Long departmentId = Long.valueOf(orderData.get("departmentId").toString());
            String content = (String) orderData.get("content");

            dispatcherService.createDepartmentOrder(orderId, departmentId, content);
            return ResponseEntity.ok(Map.of("message", "Department order created successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/department-orders/{deptOrderId}")
    public ResponseEntity<?> updateDepartmentOrder(@PathVariable Long deptOrderId,
                                                  @RequestBody Map<String, Object> orderData) {
        try {
            String content = (String) orderData.get("content");
            String status = (String) orderData.get("status");

            dispatcherService.updateDepartmentOrder(deptOrderId, content, status);
            return ResponseEntity.ok(Map.of("message", "Department order updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/department-orders/{deptOrderId}")
    public ResponseEntity<?> deleteDepartmentOrder(@PathVariable Long deptOrderId) {
        try {
            dispatcherService.deleteDepartmentOrder(deptOrderId);
            return ResponseEntity.ok(Map.of("message", "Department order deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/production-plans")
    public ResponseEntity<List<Map<String, Object>>> getProductionPlans() {
        return ResponseEntity.ok(dispatcherService.getProductionPlans());
    }

    @GetMapping("/departments")
    public ResponseEntity<List<Map<String, Object>>> getDepartments() {
        return ResponseEntity.ok(dispatcherService.getDepartments());
    }
}








