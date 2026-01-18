package ru.bmstu.model;

import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "department_orders")
public class DepartmentOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long orderId;
    private Long departmentId;
    private String content;
    private LocalDate creationDate;
    private String status;
    private LocalDate lastModified;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }

    public Long getDepartmentId() { return departmentId; }
    public void setDepartmentId(Long departmentId) { this.departmentId = departmentId; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public LocalDate getCreationDate() { return creationDate; }
    public void setCreationDate(LocalDate creationDate) { this.creationDate = creationDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDate getLastModified() { return lastModified; }
    public void setLastModified(LocalDate lastModified) { this.lastModified = lastModified; }
}









