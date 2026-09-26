-- Telecom Fault Tracker & Churn Prediction System - Seed Data

USE telecom_fault_tracker;

-- Insert Plans
INSERT INTO plans (plan_id, plan_name, monthly_fee, data_allowance_gb, voice_minutes) VALUES
    (1, 'Essential Connect', 39.99, 10.00, 500),
    (2, 'Everyday Unlimited', 59.99, 40.00, 1500),
    (3, 'Business Premier', 89.99, 100.00, 5000),
    (4, 'Ultra Fiber Mobile', 119.99, 250.00, 10000)
ON DUPLICATE KEY UPDATE
    plan_name = VALUES(plan_name),
    monthly_fee = VALUES(monthly_fee),
    data_allowance_gb = VALUES(data_allowance_gb),
    voice_minutes = VALUES(voice_minutes);

-- Insert Cell Towers
INSERT INTO towers (tower_id, tower_name, latitude, longitude, is_faulty) VALUES
    (1, 'Central Exchange', 40.712800, -74.006000, FALSE),
    (2, 'North Ridge', 40.730610, -73.935242, FALSE),
    (3, 'East Market', 40.721319, -73.977692, TRUE),
    (4, 'South Point', 40.689247, -74.044502, FALSE),
    (5, 'West Park', 40.735863, -74.172366, FALSE),
    (6, 'Harbor View', 40.700292, -73.996891, FALSE),
    (7, 'Metro Station', 40.758896, -73.985130, TRUE),
    (8, 'Tech Hub', 40.748817, -73.985428, FALSE)
ON DUPLICATE KEY UPDATE
    tower_name = VALUES(tower_name),
    latitude = VALUES(latitude),
    longitude = VALUES(longitude),
    is_faulty = VALUES(is_faulty);

-- Insert Undirected Network Topology Graph Edges (stored in both directions)
INSERT INTO tower_connections (tower_id, connected_tower_id) VALUES
    (1, 2), (2, 1),
    (1, 4), (4, 1),
    (1, 6), (6, 1),
    (2, 3), (3, 2),
    (2, 5), (5, 2),
    (3, 6), (6, 3),
    (3, 7), (7, 3),
    (4, 6), (6, 4),
    (5, 6), (6, 5),
    (7, 8), (8, 7),
    (8, 2), (2, 8)
ON DUPLICATE KEY UPDATE connected_tower_id = VALUES(connected_tower_id);

-- Insert Subscribers
INSERT INTO subscribers (
    subscriber_id, first_name, last_name, email, phone_number,
    plan_id, connected_tower_id, tenure_months, call_drops, churned, churn_prob
) VALUES
    (1, 'Ava', 'Morgan', 'ava.morgan@telecom.example.com', '+15550001001', 2, 1, 34, 2, FALSE, 0.12000),
    (2, 'Noah', 'Bennett', 'noah.bennett@telecom.example.com', '+15550001002', 1, 2, 8, 17, TRUE, 0.91000),
    (3, 'Mia', 'Patel', 'mia.patel@telecom.example.com', '+15550001003', 3, 3, 19, 14, TRUE, 0.84000),
    (4, 'Liam', 'Reed', 'liam.reed@telecom.example.com', '+15550001004', 2, 4, 52, 1, FALSE, 0.06000),
    (5, 'Sofia', 'Kim', 'sofia.kim@telecom.example.com', '+15550001005', 1, 5, 5, 21, TRUE, 0.96000),
    (6, 'Ethan', 'Brooks', 'ethan.brooks@telecom.example.com', '+15550001006', 3, 6, 27, 4, FALSE, 0.23000),
    (7, 'Isabella', 'Diaz', 'isabella.diaz@telecom.example.com', '+15550001007', 2, 2, 13, 9, TRUE, 0.77000),
    (8, 'Lucas', 'Chen', 'lucas.chen@telecom.example.com', '+15550001008', 1, 4, 41, 0, FALSE, 0.03000),
    (9, 'Emma', 'Watson', 'emma.watson@telecom.example.com', '+15550001009', 4, 7, 3, 28, TRUE, 0.98000),
    (10, 'Oliver', 'Taylor', 'oliver.taylor@telecom.example.com', '+15550001010', 3, 8, 48, 3, FALSE, 0.08000),
    (11, 'Amelia', 'Anderson', 'amelia.anderson@telecom.example.com', '+15550001011', 2, 3, 11, 19, TRUE, 0.89000),
    (12, 'James', 'Wilson', 'james.wilson@telecom.example.com', '+15550001012', 1, 7, 4, 25, TRUE, 0.95000)
ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone_number = VALUES(phone_number),
    plan_id = VALUES(plan_id),
    connected_tower_id = VALUES(connected_tower_id),
    tenure_months = VALUES(tenure_months),
    call_drops = VALUES(call_drops),
    churned = VALUES(churned),
    churn_prob = VALUES(churn_prob);

-- Insert Customer Complaints
INSERT INTO complaints (
    complaint_id, subscriber_id, tower_id, category, description, severity, status
) VALUES
    (1, 2, 3, 'network_fault', 'Repeated dropped calls near the East Market tower.', 'high', 'open'),
    (2, 3, 3, 'network_fault', 'Intermittent service and slow data around the East Market area.', 'critical', 'in_progress'),
    (3, 5, 3, 'call_drops', 'Calls disconnect several times each day.', 'high', 'open'),
    (4, 7, 3, 'network_fault', 'No reliable signal during evening commute.', 'medium', 'open'),
    (5, 1, 2, 'billing', 'Question about an international usage charge.', 'low', 'resolved'),
    (6, 4, 4, 'call_drops', 'Two calls dropped this week near South Point.', 'low', 'closed'),
    (7, 6, 3, 'network_fault', 'Data service degrades near the East Market tower.', 'medium', 'in_progress'),
    (8, 8, 1, 'coverage', 'Would like to confirm coverage at a new address.', 'low', 'open'),
    (9, 9, 7, 'network_fault', 'Complete outage in Metro Station area during rush hour.', 'critical', 'open'),
    (10, 12, 7, 'call_drops', 'Persistent disconnects whenever entering Metro Station.', 'high', 'in_progress')
ON DUPLICATE KEY UPDATE
    subscriber_id = VALUES(subscriber_id),
    tower_id = VALUES(tower_id),
    category = VALUES(category),
    description = VALUES(description),
    severity = VALUES(severity),
    status = VALUES(status);