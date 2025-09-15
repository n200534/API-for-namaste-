-- Initialize the database for NAMASTE Healthcare API
CREATE DATABASE namaste_healthcare;

-- Create extensions
\c namaste_healthcare;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create audit logs table (will be managed by Prisma)
-- This is just for reference - Prisma will handle the actual schema
