package ru.bmstu.model;

import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "production_plans_archive")
public class ProductionPlansArchive {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate creationDate;
    private LocalDate lastModified;
    private String content;

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LocalDate getCreationDate() { return creationDate; }
    public void setCreationDate(LocalDate creationDate) { this.creationDate = creationDate; }

    public LocalDate getLastModified() { return lastModified; }
    public void setLastModified(LocalDate lastModified) { this.lastModified = lastModified; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
}





