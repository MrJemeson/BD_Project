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
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (department_id) REFERENCES departments(id)
);


CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    creation_date DATE,
    status VARCHAR(50),
    customer_id BIGINT NULL,
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

CREATE TABLE documentation_requests (
    id SERIAL PRIMARY KEY,
    document_id INT NOT NULL,
    department_id INT NOT NULL,
    request_reason TEXT,
    request_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(50) DEFAULT 'Ожидает',
    response_date DATE NULL,
    FOREIGN KEY (document_id) REFERENCES documentation_archive(id),
    FOREIGN KEY (department_id) REFERENCES departments(id)
);
