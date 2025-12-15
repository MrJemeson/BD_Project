
INSERT INTO departments (id, name, type)
VALUES
(1, 'A', 'PRODUCTION'),
(2, 'B', 'SUPPLY');


INSERT INTO orders (id, creation_date, status, customer_id, order_content)
VALUES
(1, '2025-12-01', 'В процессе', 101, 'Заказ на изготовление детали X'),
(2, '2025-12-05', 'Запланировано', 102, 'Заказ на сборку узла Y');


INSERT INTO department_orders (id, order_id, department_id, content, creation_date, status, last_modified)
VALUES
(1, 1, 1, 'Производство детали X', '2025-12-01', 'В процессе', '2025-12-10'),
(2, 2, 2, 'Сборка узла Y', '2025-12-05', 'Запланировано', '2025-12-05');


INSERT INTO production_plans_archive (id, creation_date, last_modified, content)
VALUES
(1, '2025-11-20', '2025-12-01', 'План производства на декабрь 2025');


INSERT INTO documentation_archive (id, name, creation_date, last_modified, content)
VALUES
(1, 'Чертеж 1', '2025-11-25', '2025-11-30', 'Изображение чертежа'),
(2, 'Спецификация к чертежу 1', '2025-11-28', '2025-12-02', 'Спецификация');


INSERT INTO issued_copies (id, document_id, department_id, issue_date)
VALUES
(1, 1, 1, '2025-12-01'),
(2, 2, 2, '2025-12-02');


INSERT INTO users (id, username, password, role)
VALUES
(1, 'client1', 'pass123', 'CLIENT'),
(2, 'manager1', 'pass123', 'MANAGER'),
(3, 'dispatcher1', 'pass123', 'DISPATCHER'),
(4, 'dept_emp_A', 'pass123', 'DEPARTMENT_EMPLOYEE'),
(5, 'dept_emp_B', 'pass123', 'DEPARTMENT_EMPLOYEE'),
(6, 'doc_emp1', 'pass123', 'DOC_EMPLOYEE'),
(7, 'admin', 'admin123', 'ADMIN');
