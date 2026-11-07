CREATE DATABASE calculator_db;

-- Connect to calculator_db, then run the table definition below.
-- Spring Boot JPA also creates/updates this table automatically.
CREATE TABLE IF NOT EXISTS calculations (
    id BIGSERIAL PRIMARY KEY,
    first_number DOUBLE PRECISION NOT NULL,
    second_number DOUBLE PRECISION NOT NULL,
    operator VARCHAR(16) NOT NULL,
    result DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE
);
