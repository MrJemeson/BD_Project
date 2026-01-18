package ru.bmstu.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.bmstu.model.DepartmentOrder;

import java.util.List;

public interface DepartmentOrderRepository extends JpaRepository<DepartmentOrder, Long> {
    List<DepartmentOrder> findByDepartmentId(Long departmentId);
    List<DepartmentOrder> findByOrderId(Long orderId);
}









