package ru.bmstu.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.bmstu.model.IssuedCopies;

import java.util.List;

public interface IssuedCopiesRepository extends JpaRepository<IssuedCopies, Long> {
    List<IssuedCopies> findByDepartmentId(Long departmentId);
    List<IssuedCopies> findByDocumentId(Long documentId);
}





