package ru.bmstu.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.bmstu.service.ClientService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/client")
@CrossOrigin
public class ClientController {

    private final ClientService clientService;

    public ClientController(ClientService clientService) {
        this.clientService = clientService;
    }

    @GetMapping("/orders")
    public ResponseEntity<List<Map<String, Object>>> getMyOrders(@RequestParam String username) {
        return ResponseEntity.ok(clientService.getOrdersByClient(username));
    }

    @PostMapping("/orders")
    public ResponseEntity<?> createOrder(@RequestParam String username,
                                         @RequestBody Map<String, Object> orderData) {
        try {
            String content = (String) orderData.get("content");
            System.out.println("Creating order for user: " + username + ", content: " + content);

            clientService.createOrder(username, content);
            return ResponseEntity.ok(Map.of("message", "Order created successfully"));
        } catch (Exception e) {
            System.err.println("Error creating order: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}

