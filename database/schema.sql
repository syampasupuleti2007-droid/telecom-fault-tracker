-- Telecom Fault Tracker & Churn Prediction System - Database Schema
-- Compatible with MySQL 8.0+ / MariaDB 10.5+

CREATE DATABASE IF NOT EXISTS telecom_fault_tracker
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE telecom_fault_tracker;

-- Table: Plans
CREATE TABLE IF NOT EXISTS plans (
    plan_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    plan_name VARCHAR(100) NOT NULL UNIQUE,
    monthly_fee DECIMAL(10, 2) NOT NULL,
    data_allowance_gb DECIMAL(8, 2) NOT NULL DEFAULT 0,
    voice_minutes INT UNSIGNED NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_plans_monthly_fee CHECK (monthly_fee >= 0),
    CONSTRAINT chk_plans_data_allowance CHECK (data_allowance_gb >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: Cell Towers
CREATE TABLE IF NOT EXISTS towers (
    tower_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tower_name VARCHAR(100) NOT NULL UNIQUE,
    latitude DECIMAL(9, 6) NOT NULL,
    longitude DECIMAL(9, 6) NOT NULL,
    is_faulty BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_towers_faulty (is_faulty)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: Tower Connections (Network Graph Mesh Topology)
CREATE TABLE IF NOT EXISTS tower_connections (
    tower_id BIGINT UNSIGNED NOT NULL,
    connected_tower_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (tower_id, connected_tower_id),
    CONSTRAINT chk_tower_connection_not_self CHECK (tower_id <> connected_tower_id),
    CONSTRAINT fk_tower_connections_tower
        FOREIGN KEY (tower_id) REFERENCES towers (tower_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_tower_connections_connected_tower
        FOREIGN KEY (connected_tower_id) REFERENCES towers (tower_id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: Subscribers
CREATE TABLE IF NOT EXISTS subscribers (
    subscriber_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone_number VARCHAR(30) NOT NULL UNIQUE,
    plan_id BIGINT UNSIGNED NOT NULL,
    connected_tower_id BIGINT UNSIGNED NOT NULL,
    tenure_months SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    call_drops INT UNSIGNED NOT NULL DEFAULT 0,
    churned BOOLEAN NOT NULL DEFAULT FALSE,
    churn_prob DECIMAL(6, 5) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_subscribers_plan (plan_id),
    INDEX idx_subscribers_tower (connected_tower_id),
    INDEX idx_subscribers_churn_prob (churn_prob),
    INDEX idx_subscribers_churned (churned),
    CONSTRAINT chk_subscribers_churn_prob CHECK (churn_prob IS NULL OR churn_prob BETWEEN 0 AND 1),
    CONSTRAINT fk_subscribers_plan
        FOREIGN KEY (plan_id) REFERENCES plans (plan_id)
        ON DELETE RESTRICT,
    CONSTRAINT fk_subscribers_tower
        FOREIGN KEY (connected_tower_id) REFERENCES towers (tower_id)
        ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: Customer Complaints
CREATE TABLE IF NOT EXISTS complaints (
    complaint_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    subscriber_id BIGINT UNSIGNED NOT NULL,
    tower_id BIGINT UNSIGNED NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    severity ENUM('low', 'medium', 'high', 'critical') NOT NULL DEFAULT 'medium',
    status ENUM('open', 'in_progress', 'resolved', 'closed') NOT NULL DEFAULT 'open',
    logged_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    INDEX idx_complaints_subscriber_logged (subscriber_id, logged_at),
    INDEX idx_complaints_tower_status (tower_id, status),
    INDEX idx_complaints_severity (severity),
    CONSTRAINT fk_complaints_subscriber
        FOREIGN KEY (subscriber_id) REFERENCES subscribers (subscriber_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_complaints_tower
        FOREIGN KEY (tower_id) REFERENCES towers (tower_id)
        ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;