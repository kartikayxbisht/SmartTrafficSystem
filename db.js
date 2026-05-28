import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Programmatically parse .env file if it exists
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const equalsIdx = trimmed.indexOf('=');
      if (equalsIdx !== -1) {
        const key = trimmed.substring(0, equalsIdx).trim();
        const value = trimmed.substring(equalsIdx + 1).trim();
        process.env[key] = value;
      }
    }
  });
}

const { Pool } = pg;

// Read config from environment variables
const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: parseInt(process.env.PGPORT || '5432', 10),
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'password',
  database: process.env.PGDATABASE || 'smart_traffic',
  // Low timeout so fallback occurs quickly
  connectionTimeoutMillis: 3000,
});

let dbConnected = false;

// Initialize Database Tables and Seeds
export const initDb = async () => {
  try {
    const client = await pool.connect();
    console.log('Successfully connected to PostgreSQL database server.');
    
    // Read and run schema.sql
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const sql = fs.readFileSync(schemaPath, 'utf8');
      await client.query(sql);
      console.log('Database tables bootstrapped and seeded successfully.');
    }
    
    client.release();
    dbConnected = true;
  } catch (err) {
    console.log('Database Info: Running in memory-only simulated mode.');
    dbConnected = false;
  }
};

// Check if database is connected
export const isDbConnected = () => dbConnected;

// SQL query wrapper
export const dbQuery = async (text, params) => {
  if (!dbConnected) return null;
  try {
    return await pool.query(text, params);
  } catch (err) {
    console.error(`Database query error: ${err.message}`);
    return null;
  }
};

// Fetch slots from DB and group them by Lot
export const getSlotsFromDb = async () => {
  if (!dbConnected) return null;
  try {
    const res = await pool.query('SELECT slot_id, location, status, price, is_ev, charge_level FROM parking_slots ORDER BY slot_id');
    const dbSlots = res.rows;
    
    // Group slots back to Lot A, Lot B, Lot C structure
    const grouped = {
      'Lot A': [],
      'Lot B': [],
      'Lot C': []
    };
    
    dbSlots.forEach(row => {
      const slot = {
        id: row.slot_id,
        status: row.status,
      };
      if (row.is_ev) {
        slot.isEV = true;
        slot.chargeLevel = row.charge_level;
      }
      if (grouped[row.location]) {
        grouped[row.location].push(slot);
      }
    });
    
    return grouped;
  } catch (err) {
    console.error(`Failed to fetch slots: ${err.message}`);
    return null;
  }
};

// Update parking slot status in DB
export const updateSlotStatusInDb = async (slotId, status, chargeLevel = null) => {
  if (!dbConnected) return false;
  try {
    await pool.query(
      'UPDATE parking_slots SET status = $1, charge_level = $2, updated_at = NOW() WHERE slot_id = $3',
      [status, chargeLevel, slotId]
    );
    return true;
  } catch (err) {
    console.error(`Failed to update slot ${slotId} status: ${err.message}`);
    return false;
  }
};

// Log analytical traffic metrics
export const logTrafficMetricInDb = async (roadName, density, avgSpeed) => {
  if (!dbConnected) return false;
  try {
    await pool.query(
      'INSERT INTO traffic_data (road_name, traffic_density, avg_speed) VALUES ($1, $2, $3)',
      [roadName, density, avgSpeed]
    );
    return true;
  } catch (err) {
    console.error(`Failed to log traffic data for ${roadName}: ${err.message}`);
    return false;
  }
};

// In-Memory user storage fallback
let usersMemory = [
  {
    id: 1,
    name: 'Traffic Controller Admin',
    email: 'admin@municipal.gov',
    password: '$2a$10$wN3tVqVqVqVqVqVqVqVqVuV6/2N.1n1n1n1n1n1n1n1n1n1n1n1n1', // Hashed mock password "adminpass123"
    mobile: '1234567890',
    verified: true,
    otp_code: null,
    otp_expires: null,
    otp_attempts: 0
  }
];

export const createUser = async (name, email, mobile, password, otpCode, otpExpires) => {
  if (dbConnected) {
    try {
      const res = await pool.query(
        'INSERT INTO users (name, email, mobile, password, otp_code, otp_expires) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, mobile, verified',
        [name, email, mobile, password, otpCode, otpExpires]
      );
      return res.rows[0];
    } catch (err) {
      console.error(`Failed to create user in DB: ${err.message}`);
      return null;
    }
  } else {
    // Memory fallback
    const newUser = {
      id: usersMemory.length + 1,
      name,
      email,
      mobile,
      password,
      verified: false,
      otp_code: otpCode,
      otp_expires: otpExpires,
      otp_attempts: 0
    };
    usersMemory.push(newUser);
    return {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      mobile: newUser.mobile,
      verified: newUser.verified
    };
  }
};

export const getUserByEmailOrMobile = async (identifier) => {
  if (dbConnected) {
    try {
      const res = await pool.query(
        'SELECT * FROM users WHERE email = $1 OR mobile = $1',
        [identifier]
      );
      return res.rows[0] || null;
    } catch (err) {
      console.error(`Failed to fetch user from DB: ${err.message}`);
      return null;
    }
  } else {
    // Memory fallback
    return usersMemory.find(u => u.email === identifier || u.mobile === identifier) || null;
  }
};

export const getUserById = async (id) => {
  if (dbConnected) {
    try {
      const res = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
      return res.rows[0] || null;
    } catch (err) {
      console.error(`Failed to fetch user by id from DB: ${err.message}`);
      return null;
    }
  } else {
    return usersMemory.find(u => u.id === id) || null;
  }
};

export const updateUserOTP = async (id, otpCode, otpExpires) => {
  if (dbConnected) {
    try {
      await pool.query(
        'UPDATE users SET otp_code = $1, otp_expires = $2, otp_attempts = 0 WHERE id = $3',
        [otpCode, otpExpires, id]
      );
      return true;
    } catch (err) {
      console.error(`Failed to update user OTP in DB: ${err.message}`);
      return false;
    }
  } else {
    const user = usersMemory.find(u => u.id === id);
    if (user) {
      user.otp_code = otpCode;
      user.otp_expires = otpExpires;
      user.otp_attempts = 0;
      return true;
    }
    return false;
  }
};

export const verifyUserOTP = async (id) => {
  if (dbConnected) {
    try {
      await pool.query(
        'UPDATE users SET verified = TRUE, otp_code = NULL, otp_attempts = 0 WHERE id = $1',
        [id]
      );
      return true;
    } catch (err) {
      console.error(`Failed to verify user OTP in DB: ${err.message}`);
      return false;
    }
  } else {
    const user = usersMemory.find(u => u.id === id);
    if (user) {
      user.verified = true;
      user.otp_code = null;
      user.otp_attempts = 0;
      return true;
    }
    return false;
  }
};

export const incrementOTPAttempts = async (id) => {
  if (dbConnected) {
    try {
      const res = await pool.query(
        'UPDATE users SET otp_attempts = otp_attempts + 1 WHERE id = $1 RETURNING otp_attempts',
        [id]
      );
      return res.rows[0] ? res.rows[0].otp_attempts : 0;
    } catch (err) {
      console.error(`Failed to increment OTP attempts in DB: ${err.message}`);
      return 0;
    }
  } else {
    const user = usersMemory.find(u => u.id === id);
    if (user) {
      user.otp_attempts += 1;
      return user.otp_attempts;
    }
    return 0;
  }
};

export default {
  initDb,
  isDbConnected,
  dbQuery,
  getSlotsFromDb,
  updateSlotStatusInDb,
  logTrafficMetricInDb,
  createUser,
  getUserByEmailOrMobile,
  getUserById,
  updateUserOTP,
  verifyUserOTP,
  incrementOTPAttempts
};
