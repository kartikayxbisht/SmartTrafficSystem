-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  mobile VARCHAR(20) UNIQUE,
  verified BOOLEAN DEFAULT FALSE,
  otp_code VARCHAR(6),
  otp_expires TIMESTAMP,
  otp_attempts INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Parking Slots Table
CREATE TABLE IF NOT EXISTS parking_slots (
  slot_id VARCHAR(10) PRIMARY KEY,
  location VARCHAR(50) NOT NULL, -- e.g., 'Lot A', 'Lot B', 'Lot C'
  status VARCHAR(20) NOT NULL, -- 'available', 'occupied', 'reserved', 'charging', 'charged'
  price DECIMAL(10, 2) NOT NULL DEFAULT 5.00,
  is_ev BOOLEAN DEFAULT FALSE,
  charge_level INTEGER DEFAULT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Traffic Data Table (analytical logging)
CREATE TABLE IF NOT EXISTS traffic_data (
  id SERIAL PRIMARY KEY,
  road_name VARCHAR(100) NOT NULL, -- e.g., 'Intersection A (North-South)', 'Intersection B (East-West)'
  traffic_density INTEGER NOT NULL, -- Queue count (number of cars)
  avg_speed DECIMAL(5, 2) NOT NULL, -- Average speed (e.g. in mph/kph)
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Initial Users (password is hashed or mock text)
INSERT INTO users (name, email, password)
VALUES 
  ('Traffic Controller Admin', 'admin@municipal.gov', 'adminpass123'),
  ('Parking Logistics Operator', 'parking@municipal.gov', 'parkingpass123')
ON CONFLICT (email) DO NOTHING;

-- Seed Initial Parking Slots (Lot A, B, C)
INSERT INTO parking_slots (slot_id, location, status, price, is_ev, charge_level)
VALUES 
  -- Lot A
  ('A-01', 'Lot A', 'occupied', 5.00, FALSE, NULL),
  ('A-02', 'Lot A', 'charging', 8.00, TRUE, 72),
  ('A-03', 'Lot A', 'occupied', 5.00, FALSE, NULL),
  ('A-04', 'Lot A', 'available', 8.00, TRUE, NULL),
  ('A-05', 'Lot A', 'occupied', 5.00, FALSE, NULL),
  ('A-06', 'Lot A', 'occupied', 5.00, FALSE, NULL),
  ('A-07', 'Lot A', 'available', 5.00, FALSE, NULL),
  ('A-08', 'Lot A', 'available', 8.00, TRUE, NULL),
  ('A-09', 'Lot A', 'reserved', 5.00, FALSE, NULL),
  ('A-10', 'Lot A', 'available', 5.00, FALSE, NULL),
  ('A-11', 'Lot A', 'charging', 8.00, TRUE, 34),
  ('A-12', 'Lot A', 'available', 5.00, FALSE, NULL),
  ('A-13', 'Lot A', 'available', 5.00, FALSE, NULL),
  ('A-14', 'Lot A', 'occupied', 5.00, FALSE, NULL),
  ('A-15', 'Lot A', 'available', 5.00, FALSE, NULL),
  ('A-16', 'Lot A', 'available', 5.00, FALSE, NULL),
  -- Lot B
  ('B-01', 'Lot B', 'available', 8.00, TRUE, NULL),
  ('B-02', 'Lot B', 'occupied', 5.00, FALSE, NULL),
  ('B-03', 'Lot B', 'available', 5.00, FALSE, NULL),
  ('B-04', 'Lot B', 'occupied', 5.00, FALSE, NULL),
  ('B-05', 'Lot B', 'available', 8.00, TRUE, NULL),
  ('B-06', 'Lot B', 'available', 5.00, FALSE, NULL),
  ('B-07', 'Lot B', 'occupied', 5.00, FALSE, NULL),
  ('B-08', 'Lot B', 'reserved', 5.00, FALSE, NULL),
  ('B-09', 'Lot B', 'occupied', 5.00, FALSE, NULL),
  ('B-10', 'Lot B', 'charging', 8.00, TRUE, 89),
  ('B-11', 'Lot B', 'available', 5.00, FALSE, NULL),
  ('B-12', 'Lot B', 'available', 5.00, FALSE, NULL),
  -- Lot C
  ('C-01', 'Lot C', 'occupied', 6.00, FALSE, NULL),
  ('C-02', 'Lot C', 'occupied', 6.00, FALSE, NULL),
  ('C-03', 'Lot C', 'occupied', 6.00, FALSE, NULL),
  ('C-04', 'Lot C', 'reserved', 6.00, FALSE, NULL),
  ('C-05', 'Lot C', 'available', 9.00, TRUE, NULL),
  ('C-06', 'Lot C', 'occupied', 6.00, FALSE, NULL),
  ('C-07', 'Lot C', 'available', 9.00, TRUE, NULL),
  ('C-08', 'Lot C', 'occupied', 6.00, FALSE, NULL)
ON CONFLICT (slot_id) DO NOTHING;

-- Seed Initial Traffic Data Logs
INSERT INTO traffic_data (road_name, traffic_density, avg_speed)
VALUES 
  ('Intersection A (North-South)', 4, 35.50),
  ('Intersection B (East-West)', 6, 28.20),
  ('Intersection A (North-South)', 7, 24.10),
  ('Intersection B (East-West)', 9, 18.40);
