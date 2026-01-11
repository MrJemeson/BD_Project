CREATE TABLE IF NOT EXISTS documentation_requests (
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

ALTER TABLE documentation_requests
    ADD COLUMN IF NOT EXISTS document_id INT;

ALTER TABLE documentation_requests
    ADD COLUMN IF NOT EXISTS department_id INT;

ALTER TABLE documentation_requests
    ADD COLUMN IF NOT EXISTS request_reason TEXT;

ALTER TABLE documentation_requests
    ADD COLUMN IF NOT EXISTS request_date DATE;

ALTER TABLE documentation_requests
    ADD COLUMN IF NOT EXISTS status VARCHAR(50);

ALTER TABLE documentation_requests
    ADD COLUMN IF NOT EXISTS response_date DATE;

ALTER TABLE documentation_requests
    ALTER COLUMN request_date SET DEFAULT CURRENT_DATE;

ALTER TABLE documentation_requests
    ALTER COLUMN status SET DEFAULT 'Ожидает';
