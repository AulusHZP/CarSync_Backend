-- Initialize PostgreSQL database for CarSync

-- Create database if not exists (handled by docker-compose environment)
-- This is just for reference/additional setup

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Grant permissions to user
GRANT ALL PRIVILEGES ON DATABASE carsync_expenses_db TO carsync_user;
