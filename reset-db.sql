-- Reset database script
-- Run this in PostgreSQL to completely clean the facility database

-- Connect to facility database first
\c facility;

-- Drop all tables in correct order (respecting foreign keys)
DROP TABLE IF EXISTS flyway_schema_history CASCADE;
DROP TABLE IF EXISTS issued_copies CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS documentation_archive CASCADE;
DROP TABLE IF EXISTS production_plans_archive CASCADE;
DROP TABLE IF EXISTS department_orders CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS departments CASCADE;

-- Drop all sequences
DROP SEQUENCE IF EXISTS departments_id_seq CASCADE;
DROP SEQUENCE IF EXISTS department_orders_id_seq CASCADE;
DROP SEQUENCE IF EXISTS orders_id_seq CASCADE;
DROP SEQUENCE IF EXISTS production_plans_archive_id_seq CASCADE;
DROP SEQUENCE IF EXISTS documentation_archive_id_seq CASCADE;
DROP SEQUENCE IF EXISTS users_id_seq CASCADE;
DROP SEQUENCE IF EXISTS issued_copies_id_seq CASCADE;

-- Check if any tables remain
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Check if any sequences remain
SELECT sequence_name FROM information_schema.sequences WHERE sequence_schema = 'public';

