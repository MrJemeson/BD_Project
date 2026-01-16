-- Test script to check database connection and create tables manually
-- Run this in PostgreSQL to verify everything works

-- Check current database
SELECT current_database();

-- Create tables from V1_init.sql
CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50)
);

CREATE TABLE department_orders (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL,
    department_id INT NOT NULL,
    content TEXT,
    creation_date DATE,
    status VARCHAR(50),
    last_modified DATE,
    FOREIGN KEY (department_id) REFERENCES departments(id)
);

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    creation_date DATE,
    status VARCHAR(50),
    customer_id BIGINT,
    order_content TEXT
);

CREATE TABLE production_plans_archive (
    id SERIAL PRIMARY KEY,
    creation_date DATE,
    last_modified DATE,
    content TEXT
);

CREATE TABLE documentation_archive (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    creation_date DATE,
    last_modified DATE,
    content TEXT
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(50) NOT NULL,
    role VARCHAR(50) NOT NULL,
    department_id BIGINT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_users_department
        FOREIGN KEY (department_id)
        REFERENCES departments(id)
        ON DELETE SET NULL
);

CREATE TABLE issued_copies (
    id SERIAL PRIMARY KEY,
    document_id INT NOT NULL,
    department_id INT NOT NULL,
    issue_date DATE,
    FOREIGN KEY (document_id) REFERENCES documentation_archive(id),
    FOREIGN KEY (department_id) REFERENCES departments(id)
);

-- Insert test data from V2_insert_data.sql
INSERT INTO departments (name, type)
VALUES
('A', 'PRODUCTION'),
('B', 'SUPPLY');

INSERT INTO orders (creation_date, status, customer_id, order_content)
VALUES
('2025-12-01', 'В процессе', 101, 'Заказ на изготовление детали X'),
('2025-12-05', 'Запланировано', 102, 'Заказ на сборку узла Y');

INSERT INTO department_orders (order_id, department_id, content, creation_date, status, last_modified)
VALUES
(1, 1, 'Производство детали X', '2025-12-01', 'В процессе', '2025-12-10'),
(1, 2, 'Сборка узла Y', '2025-12-05', 'Запланировано', '2025-12-05');

INSERT INTO production_plans_archive (creation_date, last_modified, content)
VALUES
('2025-11-20', '2025-12-01', 'План производства на декабрь 2025');

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

-- Check if tables were created
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';








