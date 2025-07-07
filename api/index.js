import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Razorpay from 'razorpay';
import crypto from 'crypto';

// Import models
import User from '../server/models/User.js';
import Stock from '../server/models/Stock.js';
import Portfolio from '../server/models/Portfolio.js';
import Transaction from '../server/models/Transaction.js';
import Watchlist from '../server/models/Watchlist.js';
import MarketData from '../server/models/MarketData.js';

dotenv.config();

const app = express();

// Initialize Razorpay (with fallback for missing keys)
console.log('Razorpay Key ID:', process.env.RAZORPAY_KEY_ID ? 'Set' : 'Not set');
console.log('Razorpay Key Secret:', process.env.RAZORPAY_KEY_SECRET ? 'Set' : 'Not set');

let razorpay = null;
try {
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    console.log('✅ Razorpay initialized successfully');
  } else {
    console.log('⚠️  Razorpay keys not found - payment features disabled');
  }
} catch (error) {
  console.log('⚠️  Razorpay initialization failed:', error.message);
}

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is not set!');
  process.exit(1);
}

// Connect to MongoDB if not already connected
if (mongoose.connection.readyState === 0) {
  mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })
  .then(() => {
    console.log('✅ Successfully connected to MongoDB Atlas!');
    console.log('📊 Database:', mongoose.connection.db.databaseName);
  })
  .catch((error) => {
    console.error('❌ MongoDB Atlas connection failed:', error.message);
  });
}

// JWT Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Auth Routes
app.post('/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Please provide name, email, and password',
        success: false
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters long',
        success: false
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        message: 'User with this email already exists',
        success: false
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword
    });

    await user.save();
    console.log(`✅ New user registered: ${user.email} (ID: ${user._id})`);

    // Return success message without token (user needs to login separately)
    res.status(201).json({
      message: 'Account created successfully! Please login to continue.',
      success: true,
      user: {
        name: user.name,
        email: user.email,
        id: user._id
      }
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    if (error.code === 11000) {
      // Duplicate key error
      res.status(400).json({
        message: 'User with this email already exists',
        success: false
      });
    } else {
      res.status(500).json({
        message: 'Server error during registration',
        success: false
      });
    }
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        message: 'Please provide email and password',
        success: false
      });
    }

    // Find user (case insensitive email search)
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      console.log(`❌ Login attempt failed: User not found for email ${email}`);
      return res.status(400).json({
        message: 'Invalid email or password',
        success: false
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      console.log(`❌ Login attempt failed: Invalid password for email ${email}`);
      return res.status(400).json({
        message: 'Invalid email or password',
        success: false
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    console.log(`✅ User logged in successfully: ${user.email} (ID: ${user._id})`);

    res.json({
      message: 'Login successful',
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        balance: user.balance,
        joinedDate: user.joinedDate
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      message: 'Server error during login',
      success: false
    });
  }
});

// User Routes
app.get('/user/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/user/profile', authenticateToken, async (req, res) => {
  try {
    const { name, profile } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { name, profile },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Database health check
app.get('/health/db', async (req, res) => {
  try {
    const dbState = mongoose.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };

    if (dbState === 1) {
      // Test database with a simple query
      const stockCount = await mongoose.connection.db.collection('stocks').countDocuments();
      const userCount = await mongoose.connection.db.collection('users').countDocuments();

      res.json({
        status: 'OK',
        database: {
          state: states[dbState],
          name: mongoose.connection.db.databaseName,
          host: mongoose.connection.host,
          collections: {
            stocks: stockCount,
            users: userCount
          }
        },
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(503).json({
        status: 'ERROR',
        database: {
          state: states[dbState],
          error: 'Database not connected'
        },
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      database: {
        error: error.message
      },
      timestamp: new Date().toISOString()
    });
  }
});

// Basic route
app.get('/', (req, res) => {
  res.json({
    message: 'TradePro API Server is running on Vercel!',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth/*',
      stocks: '/api/stocks',
      portfolio: '/api/portfolio',
      wallet: '/api/wallet',
      payment: '/api/payment',
      user: '/api/user',
      market: '/api/market',
      transactions: '/api/transactions',
      watchlist: '/api/watchlist',
      dashboard: '/api/dashboard'
    }
  });
});

// Export for Vercel
export default app;
