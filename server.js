import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import twilio from 'twilio';
import db from './db.js';

const app = express();
app.use(cors({
  origin: '*',
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window (increased for local testing convenience)
  message: { error: 'Too many authentication attempts. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const getTwilioClient = () => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_FROM_NUMBER;

  if (accountSid && authToken && fromNumber) {
    try {
      return {
        client: twilio(accountSid, authToken),
        from: fromNumber
      };
    } catch (e) {
      console.warn('Twilio initialization failed:', e.message);
    }
  }
  return null;
};

const sendSMS = async (mobile, message) => {
  const twilioConfig = getTwilioClient();
  if (twilioConfig) {
    try {
      await twilioConfig.client.messages.create({
        body: message,
        from: twilioConfig.from,
        to: mobile
      });
      console.log(`Twilio SMS sent successfully to ${mobile}`);
      return true;
    } catch (err) {
      console.error(`Twilio SMS dispatch failed: ${err.message}`);
    }
  }

  // Fallback to console log
  console.log(`\n=================== [MOCK SMS DISPATCH] ===================`);
  console.log(`TO: ${mobile}`);
  console.log(`MESSAGE: ${message}`);
  console.log(`===========================================================\n`);
  return false;
};

// API Auth Endpoints
app.post('/api/auth/signup', authLimiter, async (req, res) => {
  const { name, email, mobile, password, confirmPassword } = req.body;

  if (!name || !email || !mobile || !password || !confirmPassword) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  try {
    const existingUser = await db.getUserByEmailOrMobile(email) || await db.getUserByEmailOrMobile(mobile);
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email or mobile number already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

    const user = await db.createUser(name, email, mobile, hashedPassword, otpCode, otpExpires);
    if (!user) {
      return res.status(500).json({ error: 'Failed to create user' });
    }

    const message = `Your Smart Traffic System verification code is: ${otpCode}. Valid for 5 minutes.`;
    const sentViaTwilio = await sendSMS(mobile, message);

    const response = {
      message: 'Registration successful! Verification OTP sent.',
      userId: user.id
    };

    if (!sentViaTwilio) {
      response.mockOtp = otpCode;
    }

    return res.status(201).json(response);
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ error: 'Internal server error during registration' });
  }
});

app.post('/api/auth/verify-otp', authLimiter, async (req, res) => {
  const { userId, otpCode } = req.body;

  if (!userId || !otpCode) {
    return res.status(400).json({ error: 'User ID and OTP code are required' });
  }

  try {
    const user = await db.getUserById(parseInt(userId, 10));
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    if (user.verified) {
      return res.status(400).json({ error: 'User mobile number is already verified' });
    }

    if (new Date() > new Date(user.otp_expires)) {
      return res.status(400).json({ error: 'OTP has expired. Please request a new code.' });
    }

    if (user.otp_attempts >= 3) {
      return res.status(400).json({ error: 'Too many incorrect attempts. Please request a new OTP.' });
    }

    if (user.otp_code !== otpCode) {
      const attempts = await db.incrementOTPAttempts(user.id);
      const remaining = Math.max(0, 3 - attempts);
      return res.status(400).json({
        error: `Incorrect OTP code. ${remaining} attempts remaining.`,
        attemptsRemaining: remaining
      });
    }

    await db.verifyUserOTP(user.id);

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, mobile: user.mobile },
      process.env.JWT_SECRET || 'supersecretjwtkeyforSmartTraffic123',
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      message: 'Mobile number verified successfully!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        verified: true
      }
    });
  } catch (err) {
    console.error('OTP verification error:', err);
    return res.status(500).json({ error: 'Internal server error during verification' });
  }
});

app.post('/api/auth/resend-otp', authLimiter, async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const user = await db.getUserById(parseInt(userId, 10));
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    if (user.otp_expires) {
      const remainingTime = new Date(user.otp_expires) - Date.now();
      const timeSinceSent = (5 * 60 * 1000) - remainingTime;

      if (timeSinceSent < 30 * 1000) {
        const waitSec = Math.ceil((30 * 1000 - timeSinceSent) / 1000);
        return res.status(400).json({
          error: `Please wait ${waitSec} seconds before resending OTP.`
        });
      }
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

    await db.updateUserOTP(user.id, otpCode, otpExpires);

    const message = `Your Smart Traffic System verification code is: ${otpCode}. Valid for 5 minutes.`;
    const sentViaTwilio = await sendSMS(user.mobile, message);

    const response = { message: 'OTP resent successfully.' };
    if (!sentViaTwilio) {
      response.mockOtp = otpCode;
    }

    return res.status(200).json(response);
  } catch (err) {
    console.error('Resend OTP error:', err);
    return res.status(500).json({ error: 'Internal server error resending OTP' });
  }
});

app.post('/api/auth/signin', authLimiter, async (req, res) => {
  const { identifier, password, requestOtp, otpCode, userId } = req.body;

  if (!identifier && !userId) {
    return res.status(400).json({ error: 'Identifier (email/mobile) is required' });
  }

  try {
    if (userId && otpCode) {
      const user = await db.getUserById(parseInt(userId, 10));
      if (!user) {
        return res.status(400).json({ error: 'User not found' });
      }

      if (new Date() > new Date(user.otp_expires)) {
        return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
      }

      if (user.otp_attempts >= 3) {
        return res.status(400).json({ error: 'Too many incorrect attempts. Please resend.' });
      }

      if (user.otp_code !== otpCode) {
        const attempts = await db.incrementOTPAttempts(user.id);
        const remaining = Math.max(0, 3 - attempts);
        return res.status(400).json({
          error: `Incorrect OTP. ${remaining} attempts remaining.`
        });
      }

      await db.verifyUserOTP(user.id);

      const token = jwt.sign(
        { id: user.id, name: user.name, email: user.email, mobile: user.mobile },
        process.env.JWT_SECRET || 'supersecretjwtkeyforSmartTraffic123',
        { expiresIn: '24h' }
      );

      return res.status(200).json({
        message: 'Login successful!',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          verified: true
        }
      });
    }

    const user = await db.getUserByEmailOrMobile(identifier);
    if (!user) {
      return res.status(400).json({ error: 'Account not found with this email or mobile' });
    }

    if (requestOtp) {
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

      await db.updateUserOTP(user.id, otpCode, otpExpires);

      const message = `Your Smart Traffic System login code is: ${otpCode}. Valid for 5 minutes.`;
      const sentViaTwilio = await sendSMS(user.mobile, message);

      const response = {
        message: 'Verification OTP sent to registered mobile.',
        userId: user.id,
        otpRequired: true
      };

      if (!sentViaTwilio) {
        response.mockOtp = otpCode;
      }

      return res.status(200).json(response);
    }

    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Incorrect password' });
    }

    if (!user.verified) {
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

      await db.updateUserOTP(user.id, otpCode, otpExpires);

      const message = `Your Smart Traffic System verification code is: ${otpCode}. Valid for 5 minutes.`;
      const sentViaTwilio = await sendSMS(user.mobile, message);

      const response = {
        error: 'unverified',
        message: 'Account not verified. OTP sent to mobile number.',
        userId: user.id
      };

      if (!sentViaTwilio) {
        response.mockOtp = otpCode;
      }

      return res.status(403).json(response);
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, mobile: user.mobile },
      process.env.JWT_SECRET || 'supersecretjwtkeyforSmartTraffic123',
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        verified: true
      }
    });
  } catch (err) {
    console.error('Signin error:', err);
    return res.status(500).json({ error: 'Internal server error during login' });
  }
});

// YOLO & OpenCV Vision Traffic Analysis API Endpoint
app.post('/api/vision/analyze', (req, res) => {
  const { preset, filename, image } = req.body;

  // Simulated YOLO/OpenCV analysis response structures
  const presetsData = {
    'delhi-cp': {
      vehicleCount: 10,
      congestionLevel: 'Moderate',
      laneOccupancy: [0.72, 0.45, 0.60],
      inferenceTimeMs: 168,
      detections: [
        { class: 'car', bbox: [0.12, 0.45, 0.08, 0.07], confidence: 0.94 },
        { class: 'car', bbox: [0.22, 0.52, 0.09, 0.08], confidence: 0.91 },
        { class: 'car', bbox: [0.35, 0.48, 0.07, 0.06], confidence: 0.88 },
        { class: 'bus', bbox: [0.55, 0.38, 0.14, 0.12], confidence: 0.95 },
        { class: 'motorcycle', bbox: [0.08, 0.58, 0.04, 0.05], confidence: 0.82 },
        { class: 'car', bbox: [0.72, 0.41, 0.06, 0.05], confidence: 0.90 },
        { class: 'truck', bbox: [0.81, 0.32, 0.12, 0.14], confidence: 0.87 },
        { class: 'car', bbox: [0.44, 0.56, 0.08, 0.08], confidence: 0.93 },
        { class: 'car', bbox: [0.61, 0.50, 0.07, 0.07], confidence: 0.89 },
        { class: 'motorcycle', bbox: [0.30, 0.61, 0.03, 0.04], confidence: 0.85 }
      ]
    },
    'mumbai-expressway': {
      vehicleCount: 16,
      congestionLevel: 'High',
      laneOccupancy: [0.88, 0.92, 0.68],
      inferenceTimeMs: 214,
      detections: [
        { class: 'car', bbox: [0.05, 0.65, 0.11, 0.10], confidence: 0.96 },
        { class: 'car', bbox: [0.18, 0.60, 0.10, 0.09], confidence: 0.93 },
        { class: 'car', bbox: [0.30, 0.55, 0.08, 0.08], confidence: 0.92 },
        { class: 'car', bbox: [0.42, 0.50, 0.07, 0.07], confidence: 0.90 },
        { class: 'car', bbox: [0.52, 0.46, 0.06, 0.06], confidence: 0.89 },
        { class: 'car', bbox: [0.62, 0.42, 0.05, 0.05], confidence: 0.88 },
        { class: 'bus', bbox: [0.72, 0.35, 0.12, 0.12], confidence: 0.94 },
        { class: 'truck', bbox: [0.02, 0.40, 0.09, 0.11], confidence: 0.86 },
        { class: 'motorcycle', bbox: [0.48, 0.58, 0.03, 0.05], confidence: 0.84 },
        { class: 'car', bbox: [0.55, 0.54, 0.08, 0.08], confidence: 0.91 },
        { class: 'car', bbox: [0.65, 0.51, 0.07, 0.07], confidence: 0.90 },
        { class: 'car', bbox: [0.75, 0.47, 0.06, 0.06], confidence: 0.87 },
        { class: 'car', bbox: [0.83, 0.44, 0.05, 0.05], confidence: 0.85 },
        { class: 'car', bbox: [0.15, 0.72, 0.13, 0.12], confidence: 0.97 },
        { class: 'car', bbox: [0.32, 0.67, 0.11, 0.10], confidence: 0.94 },
        { class: 'motorcycle', bbox: [0.27, 0.74, 0.04, 0.06], confidence: 0.83 }
      ]
    },
    'blr-silkboard': {
      vehicleCount: 6,
      congestionLevel: 'Low',
      laneOccupancy: [0.22, 0.15, 0.35],
      inferenceTimeMs: 142,
      detections: [
        { class: 'car', bbox: [0.25, 0.45, 0.08, 0.07], confidence: 0.92 },
        { class: 'car', bbox: [0.50, 0.48, 0.07, 0.06], confidence: 0.94 },
        { class: 'motorcycle', bbox: [0.15, 0.55, 0.04, 0.05], confidence: 0.86 },
        { class: 'car', bbox: [0.70, 0.42, 0.06, 0.05], confidence: 0.89 },
        { class: 'truck', bbox: [0.80, 0.35, 0.11, 0.12], confidence: 0.91 },
        { class: 'car', bbox: [0.38, 0.52, 0.08, 0.07], confidence: 0.88 }
      ]
    }
  };

  if (preset && presetsData[preset]) {
    return res.status(200).json({ success: true, ...presetsData[preset] });
  }

  // Handle custom uploads with deterministic hashing to ensure consistency for the same image
  let hash = 0;
  const seedString = image || filename || 'random';
  for (let i = 0; i < seedString.length && i < 500; i++) {
    hash = (hash << 5) - hash + seedString.charCodeAt(i);
    hash |= 0;
  }
  hash = Math.abs(hash);

  const vehicleCount = (hash % 12) + 5; // 5 to 16 vehicles
  const classes = ['car', 'motorcycle', 'car', 'bus', 'car', 'truck', 'motorcycle'];
  const detections = [];

  for (let i = 0; i < vehicleCount; i++) {
    const classType = classes[(hash + i) % classes.length];
    
    // Distribute bboxes evenly on the roadway perspective
    const x = 0.1 + ((i * 0.7) / vehicleCount) + ((hash % (i + 1)) * 0.005);
    const y = 0.35 + ((i % 3) * 0.11) + ((hash % (i + 2)) * 0.002);
    const w = 0.05 + ((i % 2) * 0.04) + (y * 0.05); // dynamic scaling to simulate depth
    const h = w * 0.85;

    // Normalise boundaries (0 to 1)
    const normX = Math.min(Math.max(x, 0.01), 0.9);
    const normY = Math.min(Math.max(y, 0.1), 0.85);
    const normW = Math.min(w, 1.0 - normX);
    const normH = Math.min(h, 1.0 - normY);

    const confidence = parseFloat((0.75 + ((hash * (i + 1)) % 21) * 0.01).toFixed(2));
    detections.push({ class: classType, bbox: [normX, normY, normW, normH], confidence });
  }

  const lane1 = parseFloat((0.2 + ((hash % 7) * 0.11)).toFixed(2));
  const lane2 = parseFloat((0.15 + (((hash >> 2) % 8) * 0.10)).toFixed(2));
  const lane3 = parseFloat((0.1 + (((hash >> 4) % 9) * 0.10)).toFixed(2));
  const avgOccupancy = (lane1 + lane2 + lane3) / 3;
  const congestionLevel = avgOccupancy > 0.70 ? 'High' : avgOccupancy > 0.35 ? 'Moderate' : 'Low';

  return res.status(200).json({
    success: true,
    vehicleCount,
    congestionLevel,
    laneOccupancy: [lane1, lane2, lane3],
    inferenceTimeMs: (hash % 100) + 120, // 120ms to 220ms
    detections
  });
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Secure Socket.io connection handshake
io.use((socket, next) => {
  const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization;
  if (!token) {
    return next(new Error('Authentication error: Token required'));
  }

  const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token;

  try {
    const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET || 'supersecretjwtkeyforSmartTraffic123');
    socket.user = decoded;
    next();
  } catch (err) {
    return next(new Error('Authentication error: Invalid or expired token'));
  }
});

const PORT = 5000;

// Shared Initial States
let phase = 'NS-GREEN';
let timeLeft = 15;
let isOverride = false;
let overrideTarget = null;
let carsNS = 6;
let carsEW = 8;
let throughput = 1420;

let bookings = {}; // Active bookings keyed by slotId

// Default Fallback Slot configuration
let lotsData = {
  'Lot A': [
    { id: 'A-01', status: 'occupied' },
    { id: 'A-02', status: 'occupied', isEV: true, chargeLevel: 72 },
    { id: 'A-03', status: 'occupied' },
    { id: 'A-04', status: 'available', isEV: true },
    { id: 'A-05', status: 'occupied' },
    { id: 'A-06', status: 'occupied' },
    { id: 'A-07', status: 'available' },
    { id: 'A-08', status: 'available', isEV: true },
    { id: 'A-09', status: 'reserved' },
    { id: 'A-10', status: 'available' },
    { id: 'A-11', status: 'occupied', isEV: true, chargeLevel: 34 },
    { id: 'A-12', status: 'available' },
    { id: 'A-13', status: 'available' },
    { id: 'A-14', status: 'occupied' },
    { id: 'A-15', status: 'available' },
    { id: 'A-16', status: 'available' },
  ],
  'Lot B': [
    { id: 'B-01', status: 'available', isEV: true },
    { id: 'B-02', status: 'occupied' },
    { id: 'B-03', status: 'available' },
    { id: 'B-04', status: 'occupied' },
    { id: 'B-05', status: 'available', isEV: true },
    { id: 'B-06', status: 'available' },
    { id: 'B-07', status: 'occupied' },
    { id: 'B-08', status: 'reserved' },
    { id: 'B-09', status: 'occupied' },
    { id: 'B-10', status: 'occupied', isEV: true, chargeLevel: 89 },
    { id: 'B-11', status: 'available' },
    { id: 'B-12', status: 'available' },
  ],
  'Lot C': [
    { id: 'C-01', status: 'occupied' },
    { id: 'C-02', status: 'occupied' },
    { id: 'C-03', status: 'occupied' },
    { id: 'C-04', status: 'reserved' },
    { id: 'C-05', status: 'available', isEV: true },
    { id: 'C-06', status: 'occupied' },
    { id: 'C-07', status: 'available', isEV: true },
    { id: 'C-08', status: 'occupied' },
  ]
};

// Initialize some default active slots in charging status for memory fallback
lotsData['Lot A'][1].status = 'charging';
lotsData['Lot A'][10].status = 'charging';
lotsData['Lot B'][9].status = 'charging';

let alerts = [
  { id: 1, type: 'warning', text: 'Heavy congestion detected on Main St (Westbound). AI routing adjustment active.', time: 'Just now' },
  { id: 2, type: 'info', text: 'Signal Intersection B switched to automatic AI optimization mode.', time: '5 mins ago' },
  { id: 3, type: 'success', text: 'Smart Parking Lot C sensor diagnostics complete. 100% operational.', time: '12 mins ago' },
  { id: 4, type: 'danger', text: 'Emergency override triggered for signal B: Fire department vehicle priority.', time: '25 mins ago' }
];

let lastCongestionNotificationTime = 0;

// Initialize Database on Boot
const startServer = async () => {
  // Await Database connection and bootstrapping DDL scripts
  await db.initDb();

  if (db.isDbConnected()) {
    const dbLots = await db.getSlotsFromDb();
    if (dbLots) {
      lotsData = dbLots;
      console.log('Loaded active parking configurations from PostgreSQL.');
    }
  }

  const getLightState = (signal) => {
    if (signal === 'NS') {
      if (phase === 'NS-GREEN') return 'green';
      if (phase === 'NS-YELLOW') return 'yellow';
      return 'red';
    } else {
      if (phase === 'EW-GREEN') return 'green';
      if (phase === 'EW-YELLOW') return 'yellow';
      return 'red';
    }
  };

  // 1-second countdown timer loop
  setInterval(() => {
    if (isOverride) return;

    if (timeLeft <= 1) {
      switch (phase) {
        case 'NS-GREEN':
          phase = 'NS-YELLOW';
          timeLeft = 3;
          break;
        case 'NS-YELLOW':
          phase = 'EW-GREEN';
          timeLeft = 15;
          break;
        case 'EW-GREEN':
          phase = 'EW-YELLOW';
          timeLeft = 3;
          break;
        case 'EW-YELLOW':
          phase = 'NS-GREEN';
          timeLeft = 15;
          break;
        default:
          phase = 'NS-GREEN';
          timeLeft = 15;
      }
    } else {
      timeLeft -= 1;
    }

    io.emit('trafficUpdate', {
      phase,
      timeLeft,
      isOverride,
      overrideTarget,
      carsNS,
      carsEW,
      throughput,
      nsLightState: getLightState('NS'),
      ewLightState: getLightState('EW')
    });
  }, 1000);

  // 2-second traffic simulator loop
  setInterval(() => {
    // Cars arriving
    if (Math.random() > 0.4) {
      carsNS = Math.min(carsNS + Math.floor(Math.random() * 2) + 1, 25);
    }
    if (Math.random() > 0.4) {
      carsEW = Math.min(carsEW + Math.floor(Math.random() * 2) + 1, 25);
    }

    // Cars departing
    if (phase === 'NS-GREEN') {
      const removed = Math.min(carsNS, Math.floor(Math.random() * 3) + 2);
      carsNS = Math.max(carsNS - removed, 0);
      if (removed > 0) throughput += removed;
    } else if (phase === 'EW-GREEN') {
      const removed = Math.min(carsEW, Math.floor(Math.random() * 3) + 2);
      carsEW = Math.max(carsEW - removed, 0);
      if (removed > 0) throughput += removed;
    }

    // Commit analytical traffic metrics to database
    if (db.isDbConnected()) {
      const speedNS = parseFloat(Math.max(15, 45 - carsNS * 1.5).toFixed(2));
      const speedEW = parseFloat(Math.max(10, 40 - carsEW * 1.5).toFixed(2));
      db.logTrafficMetricInDb('Intersection A (North-South)', carsNS, speedNS);
      db.logTrafficMetricInDb('Intersection B (East-West)', carsEW, speedEW);
    }

    // AI Trigger: Smart Notification for Backlog
    if ((carsNS > 12 || carsEW > 12) && (Date.now() - lastCongestionNotificationTime > 15000)) {
      const targetJunction = carsNS > 12 ? 'Intersection A (North-South)' : 'Intersection B (East-West)';
      lastCongestionNotificationTime = Date.now();

      io.emit('smartNotification', {
        id: Date.now(),
        type: 'warning',
        title: 'AI Backlog Resolution',
        desc: `High vehicle queue detected at ${targetJunction}. AI algorithm extending green duration.`
      });
    }

    io.emit('trafficUpdate', {
      phase,
      timeLeft,
      isOverride,
      overrideTarget,
      carsNS,
      carsEW,
      throughput,
      nsLightState: getLightState('NS'),
      ewLightState: getLightState('EW')
    });
  }, 2000);

  // 3-second EV Battery charging progress simulation
  setInterval(() => {
    let parkingUpdated = false;

    Object.keys(lotsData).forEach(lotName => {
      lotsData[lotName] = lotsData[lotName].map(slot => {
        if (slot.isEV && slot.status === 'charging') {
          const step = Math.floor(Math.random() * 4) + 4;
          const currentLevel = slot.chargeLevel || 0;
          const newLevel = Math.min(currentLevel + step, 100);

          parkingUpdated = true;

          const finalStatus = newLevel >= 100 ? 'charged' : 'charging';

          // Persist status and charge level changes to DB
          if (db.isDbConnected()) {
            db.updateSlotStatusInDb(slot.id, finalStatus, newLevel);
          }

          if (newLevel >= 100) {
            // Charging complete
            const completedAlert = {
              id: Date.now(),
              type: 'success',
              text: `EV Charging completed in ${lotName} Bay ${slot.id}. Connector released.`,
              time: 'Just now'
            };
            alerts = [completedAlert, ...alerts.slice(0, 19)];
            io.emit('alertsUpdate', alerts);

            // Broadcast Toast Notification
            io.emit('smartNotification', {
              id: Date.now() + 1,
              type: 'success',
              title: 'EV Charging Complete',
              desc: `Vehicle in ${lotName} Bay ${slot.id} is fully charged. Charging adapter detached.`
            });

            return { ...slot, status: 'charged', chargeLevel: 100 };
          } else {
            return { ...slot, chargeLevel: newLevel };
          }
        }
        return slot;
      });
    });

    if (parkingUpdated) {
      io.emit('parkingUpdate', { lotsData, bookings });
    }
  }, 3000);

  // Socket server handlers
  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Send state dump on connect
    socket.emit('initialState', {
      phase,
      timeLeft,
      isOverride,
      overrideTarget,
      carsNS,
      carsEW,
      throughput,
      nsLightState: getLightState('NS'),
      ewLightState: getLightState('EW'),
      lotsData,
      bookings,
      alerts
    });

    // Signal Override
    socket.on('overrideSignal', (direction) => {
      isOverride = true;
      overrideTarget = direction;
      phase = direction === 'NS' ? 'NS-GREEN' : 'EW-GREEN';
      timeLeft = 0;

      const newAlert = {
        id: Date.now(),
        type: 'danger',
        text: `Emergency manual override triggered for Signal ${direction === 'NS' ? 'A (North-South)' : 'B (East-West)'}: prioritized corridor active.`,
        time: 'Just now'
      };
      alerts = [newAlert, ...alerts.slice(0, 19)];

      io.emit('trafficUpdate', {
        phase,
        timeLeft,
        isOverride,
        overrideTarget,
        carsNS,
        carsEW,
        throughput,
        nsLightState: getLightState('NS'),
        ewLightState: getLightState('EW')
      });
      io.emit('alertsUpdate', alerts);

      io.emit('smartNotification', {
        id: Date.now() + 1,
        type: 'danger',
        title: 'Emergency Signal Override',
        desc: `Signal corridor overridden for ${direction === 'NS' ? 'North-South' : 'East-West'} route priority.`
      });
    });

    // Release Override
    socket.on('releaseOverride', () => {
      isOverride = false;
      overrideTarget = null;
      timeLeft = 15;
      phase = 'NS-GREEN';

      const newAlert = {
        id: Date.now(),
        type: 'info',
        text: `Signal override released. System returned to AI optimization scheduling.`,
        time: 'Just now'
      };
      alerts = [newAlert, ...alerts.slice(0, 19)];

      io.emit('trafficUpdate', {
        phase,
        timeLeft,
        isOverride,
        overrideTarget,
        carsNS,
        carsEW,
        throughput,
        nsLightState: getLightState('NS'),
        ewLightState: getLightState('EW')
      });
      io.emit('alertsUpdate', alerts);

      io.emit('smartNotification', {
        id: Date.now() + 1,
        type: 'info',
        title: 'AI Scheduler Resumed',
        desc: 'Local signal override cleared. Traffic flow returned to adaptive model control.'
      });
    });

    // Book Slot
    socket.on('bookSlot', (bookingDetails) => {
      const { lotName, slotId, plate, duration, vehicleType } = bookingDetails;

      if (lotsData[lotName]) {
        lotsData[lotName] = lotsData[lotName].map(slot => {
          if (slot.id === slotId) {
            return { ...slot, status: 'reserved', chargeLevel: slot.isEV ? 0 : undefined };
          }
          return slot;
        });
      }

      bookings[slotId] = {
        plate,
        duration,
        vehicleType,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      // Persist reservation status change to DB
      if (db.isDbConnected()) {
        db.updateSlotStatusInDb(slotId, 'reserved', null);
      }

      const newAlert = {
        id: Date.now(),
        type: 'success',
        text: `Smart Bay ${slotId} successfully booked in ${lotName} for plate ${plate}.`,
        time: 'Just now'
      };
      alerts = [newAlert, ...alerts.slice(0, 19)];

      io.emit('parkingUpdate', { lotsData, bookings });
      io.emit('alertsUpdate', alerts);

      // Routing recommendation full lot check
      const lotSlots = lotsData[lotName];
      const vacantCount = lotSlots.filter(s => s.status === 'available').length;
      const capacity = lotSlots.length;
      const occupancyPercentage = ((capacity - vacantCount) / capacity) * 100;

      if (occupancyPercentage > 85) {
        let bestAltLot = null;
        let maxVacancy = 0;
        Object.entries(lotsData).forEach(([altLotName, altSlots]) => {
          if (altLotName !== lotName) {
            const avail = altSlots.filter(s => s.status === 'available').length;
            if (avail > maxVacancy) {
              maxVacancy = avail;
              bestAltLot = altLotName;
            }
          }
        });

        if (bestAltLot && maxVacancy > 2) {
          io.emit('smartNotification', {
            id: Date.now() + 1,
            type: 'warning',
            title: 'AI Smart Routing Suggestion',
            desc: `${lotName} is at ${Math.round(occupancyPercentage)}% capacity. Recommend routing new arrivals to ${bestAltLot} (${maxVacancy} bays vacant).`
          });
        }
      }
    });

    // Start EV Charger
    socket.on('startCharging', ({ lotName, slotId }) => {
      if (lotsData[lotName]) {
        lotsData[lotName] = lotsData[lotName].map(slot => {
          if (slot.id === slotId && slot.isEV) {
            return { ...slot, status: 'charging', chargeLevel: 0 };
          }
          return slot;
        });
      }

      // Persist status change to DB
      if (db.isDbConnected()) {
        db.updateSlotStatusInDb(slotId, 'charging', 0);
      }

      const newAlert = {
        id: Date.now(),
        type: 'info',
        text: `EV charging sequence initiated for ${lotName} Bay ${slotId}.`,
        time: 'Just now'
      };
      alerts = [newAlert, ...alerts.slice(0, 19)];

      io.emit('parkingUpdate', { lotsData, bookings });
      io.emit('alertsUpdate', alerts);

      io.emit('smartNotification', {
        id: Date.now() + 1,
        type: 'info',
        title: 'EV Charging Started',
        desc: `Adapter connected to EV in ${lotName} Bay ${slotId}. Energy transfer initiated.`
      });
    });

    // Dismiss Alert
    socket.on('dismissAlert', (alertId) => {
      alerts = alerts.filter(alert => alert.id !== alertId);
      io.emit('alertsUpdate', alerts);
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  httpServer.listen(PORT, () => {
    console.log(`Socket.io traffic telemetry server running on http://localhost:${PORT}`);
  });
};

startServer();
