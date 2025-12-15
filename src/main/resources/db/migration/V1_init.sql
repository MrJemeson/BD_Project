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
    customer_id INT,
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


CREATE TABLE issued_copies (
    id SERIAL PRIMARY KEY,
    document_id INT NOT NULL,
    department_id INT NOT NULL,
    issue_date DATE,
    FOREIGN KEY (document_id) REFERENCES documentation_archive(id),
    FOREIGN KEY (department_id) REFERENCES departments(id)
);


CREATE OR REPLACE VIEW view_department_a AS
SELECT d.document_id,
       d.document_name,
       d.document_type,
       ic.issue_date,
       ic.recipient_department_id
FROM documents d
JOIN issued_copies ic
  ON d.document_id = ic.document_id
WHERE ic.recipient_department_id = 'A';

CREATE OR REPLACE VIEW view_department_b AS
SELECT d.document_id,
       d.document_name,
       d.document_type,
       ic.issue_date,
       ic.recipient_department_id
FROM documents d
JOIN issued_copies ic
  ON d.document_id = ic.document_id
WHERE ic.recipient_department_id = 'B';
