package ru.bmstu.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.bmstu.service.DocEmployeeService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/doc-employee")
@CrossOrigin
public class DocEmployeeController {

    private final DocEmployeeService docEmployeeService;

    public DocEmployeeController(DocEmployeeService docEmployeeService) {
        this.docEmployeeService = docEmployeeService;
    }

    @GetMapping("/documents")
    public ResponseEntity<List<Map<String, Object>>> getDocumentationArchive() {
        return ResponseEntity.ok(docEmployeeService.getDocumentationArchive());
    }

    @PostMapping("/documents")
    public ResponseEntity<?> createDocument(@RequestBody Map<String, String> documentData) {
        try {
            docEmployeeService.createDocument(documentData.get("name"), documentData.get("content"));
            return ResponseEntity.ok(Map.of("message", "Document created successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/documents/{documentId}")
    public ResponseEntity<?> updateDocument(@PathVariable Long documentId,
                                           @RequestBody Map<String, String> documentData) {
        try {
            docEmployeeService.updateDocument(documentId, documentData.get("name"), documentData.get("content"));
            return ResponseEntity.ok(Map.of("message", "Document updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/documents/{documentId}")
    public ResponseEntity<?> deleteDocument(@PathVariable Long documentId) {
        try {
            docEmployeeService.deleteDocument(documentId);
            return ResponseEntity.ok(Map.of("message", "Document deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/issued-copies")
    public ResponseEntity<List<Map<String, Object>>> getIssuedCopies() {
        return ResponseEntity.ok(docEmployeeService.getIssuedCopies());
    }

    @GetMapping("/documentation-requests")
    public ResponseEntity<List<Map<String, Object>>> getDocumentationRequests() {
        return ResponseEntity.ok(docEmployeeService.getDocumentationRequests());
    }

    @PostMapping("/issue-copy")
    public ResponseEntity<?> issueDocumentCopy(@RequestBody Map<String, Object> issueData) {
        try {
            Long documentId = Long.valueOf(issueData.get("documentId").toString());
            Long departmentId = Long.valueOf(issueData.get("departmentId").toString());

            docEmployeeService.issueDocumentCopy(documentId, departmentId);
            return ResponseEntity.ok(Map.of("message", "Document copy issued successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/documentation-requests/{requestId}/approve")
    public ResponseEntity<?> approveDocumentationRequest(@PathVariable Long requestId) {
        try {
            docEmployeeService.approveDocumentationRequest(requestId);
            return ResponseEntity.ok(Map.of("message", "Documentation request approved"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/documentation-requests/{requestId}/reject")
    public ResponseEntity<?> rejectDocumentationRequest(@PathVariable Long requestId) {
        try {
            docEmployeeService.rejectDocumentationRequest(requestId);
            return ResponseEntity.ok(Map.of("message", "Documentation request rejected"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/issued-copies/{issuedCopyId}")
    public ResponseEntity<?> revokeDocumentCopy(@PathVariable Long issuedCopyId) {
        try {
            docEmployeeService.revokeDocumentCopy(issuedCopyId);
            return ResponseEntity.ok(Map.of("message", "Document copy revoked successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/departments")
    public ResponseEntity<List<Map<String, Object>>> getDepartments() {
        return ResponseEntity.ok(docEmployeeService.getDepartments());
    }
}



