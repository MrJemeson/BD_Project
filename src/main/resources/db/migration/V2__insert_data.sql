
INSERT INTO departments (name, type)
VALUES
('A', 'PRODUCTION'),
('B', 'SUPPLY');


-- Insert orders first (customer_id will be set to NULL for now, can be updated later)
INSERT INTO orders (creation_date, status, order_content)
VALUES
('2025-12-01', 'В процессе', 'Заказ на изготовление детали X'),
('2025-12-05', 'Запланировано', 'Заказ на сборку узла Y');

-- Insert department orders with correct order_id references
INSERT INTO department_orders (order_id, department_id, content, creation_date, status, last_modified)
VALUES
(1, 1, 'Производство детали X', '2025-12-01', 'В процессе', '2025-12-10'),
(2, 2, 'Сборка узла Y', '2025-12-05', 'Запланировано', '2025-12-05');


INSERT INTO production_plans_archive (creation_date, last_modified, content)
VALUES
('2025-11-20', '2025-12-01', 'План производства на декабрь 2025'),
('2025-12-01', '2025-12-01', 'План производства на январь 2026');


INSERT INTO documentation_archive (name, creation_date, last_modified, content)
VALUES
('Чертеж 1', '2025-11-25', '2025-11-30', 'Изображение чертежа'),
('Спецификация к чертежу 1', '2025-11-28', '2025-12-02', 'Спецификация');


INSERT INTO issued_copies (document_id, department_id, issue_date)
VALUES
(1, 1, '2025-12-01'),
(2, 2, '2025-12-02');


INSERT INTO users (username, password, role, department_id, active)
VALUES
('client1',       'pass123',  'ROLE_CLIENT',               NULL, TRUE),
('manager1',      'pass123',  'ROLE_MANAGER',              NULL, TRUE),
('dispatcher1',   'pass123',  'ROLE_DISPATCHER',           NULL, TRUE),
('dept_emp_A',    'pass123',  'ROLE_DEPARTMENT_EMPLOYEE',  1,    TRUE),
('dept_emp_B',    'pass123',  'ROLE_DEPARTMENT_EMPLOYEE',  2,    TRUE),
('doc_emp1',      'pass123',  'ROLE_DOC_EMPLOYEE',         NULL, TRUE),
('admin',         'admin123', 'ROLE_ADMIN',                NULL, TRUE);
