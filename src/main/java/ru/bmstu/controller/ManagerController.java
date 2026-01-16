package ru.bmstu.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.bmstu.service.ManagerService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/manager")
@CrossOrigin
public class ManagerController {

    private final ManagerService managerService;

    public ManagerController(ManagerService managerService) {
        this.managerService = managerService;
    }

    @GetMapping("/active-orders")
    public ResponseEntity<List<Map<String, Object>>> getActiveOrders() {
        return ResponseEntity.ok(managerService.getActiveOrders());
    }

    @GetMapping("/all-orders")
    public ResponseEntity<List<Map<String, Object>>> getAllOrders() {
        return ResponseEntity.ok(managerService.getAllOrders());
    }

    @PostMapping("/orders/{orderId}/approve")
    public ResponseEntity<?> approveOrder(@PathVariable Long orderId) {
        try {
            managerService.approveOrder(orderId);
            return ResponseEntity.ok(Map.of("message", "Order approved successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/orders/{orderId}/reject")
    public ResponseEntity<?> rejectOrder(@PathVariable Long orderId) {
        try {
            managerService.rejectOrder(orderId);
            return ResponseEntity.ok(Map.of("message", "Order rejected successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/orders/{orderId}/complete")
    public ResponseEntity<?> completeOrder(@PathVariable Long orderId) {
        try {
            managerService.completeOrder(orderId);
            return ResponseEntity.ok(Map.of("message", "Order completed successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/production-plans")
    public ResponseEntity<List<Map<String, Object>>> getProductionPlans() {
        return ResponseEntity.ok(managerService.getProductionPlans());
    }

    @PostMapping("/production-plans")
    public ResponseEntity<?> createProductionPlan(@RequestBody Map<String, String> planData) {
        try {
            managerService.createProductionPlan(planData.get("content"));
            return ResponseEntity.ok(Map.of("message", "Production plan created successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/production-plans/{planId}")
    public ResponseEntity<?> updateProductionPlan(@PathVariable Long planId,
                                                 @RequestBody Map<String, String> planData) {
        try {
            managerService.updateProductionPlan(planId, planData.get("content"));
            return ResponseEntity.ok(Map.of("message", "Production plan updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/production-plans/{planId}")
    public ResponseEntity<?> deleteProductionPlan(@PathVariable Long planId) {
        try {
            managerService.deleteProductionPlan(planId);
            return ResponseEntity.ok(Map.of("message", "Production plan deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}

