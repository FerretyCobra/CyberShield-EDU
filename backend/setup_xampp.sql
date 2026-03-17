-- Create database for CyberShield-EDU
CREATE DATABASE IF NOT EXISTS cybershield;
USE cybershield;

-- Tables will be created automatically by SQLAlchemy on first run, 
-- but here is the manual schema if needed for phpMyAdmin:

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    role ENUM('student', 'admin') DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Scan Records Table
CREATE TABLE IF NOT EXISTS scan_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    scan_type VARCHAR(20) NOT NULL,
    input_data TEXT,
    prediction VARCHAR(20),
    confidence FLOAT,
    reasoning TEXT,
    user_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Scam Keywords Table
CREATE TABLE IF NOT EXISTS scam_keywords (
    id INT AUTO_INCREMENT PRIMARY KEY,
    keyword VARCHAR(100) UNIQUE NOT NULL,
    risk_level VARCHAR(20) DEFAULT 'high',
    added_by INT,
    FOREIGN KEY (added_by) REFERENCES users(id)
);

-- Awareness Content Table
CREATE TABLE IF NOT EXISTS awareness_content (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(255),
    category VARCHAR(50),
    link_url VARCHAR(255),
    video_url VARCHAR(255)
);

-- Insert Default Admin (Password: admin123 - bcrypt hash)
INSERT IGNORE INTO users (username, email, hashed_password, role) 
VALUES ('admin', 'admin@cybershield.edu', '$2b$12$R9h/lIPzHZ8hJ1vp.Yq.8u.8m8.Mh8qU5m8i8qU5m8i8qU5m8i8qU', 'admin');
