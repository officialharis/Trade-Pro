import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';

// Import models
import User from '../server/models/User.js';

dotenv.config();

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
  })
  .catch((error) => {
    console.error('❌ MongoDB Atlas connection failed:', error.message);
  });
}

// Initialize Razorpay
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

// JWT Middleware
const authenticateToken = (req) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    throw new Error('Access token required');
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    return user;
  } catch (err) {
    throw new Error('Invalid token');
  }
};

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Authenticate user
    const user = authenticateToken(req);
    const { method, query, body } = req;

    if (method === 'POST') {
      const { action } = query;
      
      if (action === 'create-order') {
        console.log('Creating Razorpay order for user:', user.userId);
        const { amount } = body;
        console.log('Requested amount:', amount);

        if (!amount || amount <= 0) {
          console.log('Invalid amount provided:', amount);
          return res.status(400).json({ message: 'Invalid amount' });
        }

        // Check if Razorpay credentials are available
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET ||
            process.env.RAZORPAY_KEY_ID.includes('your_key_id_here')) {
          console.log('Razorpay credentials not configured, using mock mode');

          // Mock payment order for testing
          const mockOrder = {
            id: `order_mock_${Date.now()}`,
            amount: Math.round(amount * 100),
            currency: 'INR',
            receipt: `receipt_${Date.now()}`,
            status: 'created'
          };

          return res.json({
            orderId: mockOrder.id,
            amount: mockOrder.amount,
            currency: mockOrder.currency,
            key: 'rzp_test_mock_key',
            isMockMode: true
          });
        }

        // Convert amount to paise (Razorpay expects amount in smallest currency unit)
        const amountInPaise = Math.round(amount * 100);
        console.log('Amount in paise:', amountInPaise);

        const options = {
          amount: amountInPaise,
          currency: 'INR',
          receipt: `receipt_${Date.now()}`,
          payment_capture: 1
        };

        console.log('Creating order with options:', options);
        const order = await razorpay.orders.create(options);
        console.log('Order created successfully:', order.id);

        return res.json({
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
          key: process.env.RAZORPAY_KEY_ID
        });
      }

      if (action === 'verify') {
        const {
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
          amount,
          isMockPayment
        } = body;

        console.log('Verifying payment:', { razorpay_order_id, razorpay_payment_id, isMockPayment });

        // Handle mock payments (for testing without real Razorpay credentials)
        if (isMockPayment || razorpay_order_id?.includes('mock')) {
          console.log('Processing mock payment');

          // Payment verified, add funds to wallet
          const userDoc = await User.findById(user.userId);
          if (!userDoc) {
            return res.status(404).json({ message: 'User not found' });
          }

          // Convert amount from paise to dollars (for consistency with wallet currency)
          const amountInDollars = amount / 100;

          // Initialize wallet if it doesn't exist
          if (!userDoc.wallet) {
            userDoc.wallet = {
              balance: 1000,
              currency: 'USD',
              transactions: []
            };
          }

          // Add to balance
          userDoc.wallet.balance += amountInDollars;

          // Add transaction record
          userDoc.wallet.transactions.push({
            type: 'DEPOSIT',
            amount: amountInDollars,
            description: `Mock payment - ${razorpay_payment_id || 'mock_payment_' + Date.now()}`,
            date: new Date(),
            paymentId: razorpay_payment_id || 'mock_payment_' + Date.now(),
            orderId: razorpay_order_id
          });

          userDoc.markModified('wallet');
          await userDoc.save();

          return res.json({
            message: 'Mock payment processed successfully',
            balance: userDoc.wallet.balance,
            transaction: userDoc.wallet.transactions[userDoc.wallet.transactions.length - 1]
          });
        }

        // Real Razorpay payment verification
        if (!process.env.RAZORPAY_KEY_SECRET) {
          return res.status(500).json({ message: 'Payment gateway not configured' });
        }

        // Verify payment signature
        const body_str = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
          .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
          .update(body_str.toString())
          .digest('hex');

        if (expectedSignature !== razorpay_signature) {
          return res.status(400).json({ message: 'Invalid payment signature' });
        }

        // Payment verified, add funds to wallet
        const userDoc = await User.findById(user.userId);
        if (!userDoc) {
          return res.status(404).json({ message: 'User not found' });
        }

        // Convert amount from paise to dollars
        const amountInDollars = amount / 100;

        // Initialize wallet if it doesn't exist
        if (!userDoc.wallet) {
          userDoc.wallet = {
            balance: 1000,
            currency: 'USD',
            transactions: []
          };
        }

        // Add to balance
        userDoc.wallet.balance += amountInDollars;

        // Add transaction record
        userDoc.wallet.transactions.push({
          type: 'DEPOSIT',
          amount: amountInDollars,
          description: `Razorpay payment - ${razorpay_payment_id}`,
          date: new Date(),
          paymentId: razorpay_payment_id,
          orderId: razorpay_order_id
        });

        userDoc.markModified('wallet');
        await userDoc.save();

        return res.json({
          message: 'Payment verified and funds added successfully',
          balance: userDoc.wallet.balance,
          transaction: userDoc.wallet.transactions[userDoc.wallet.transactions.length - 1]
        });
      }
    }

    res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Payment API error:', error);
    if (error.message === 'Access token required' || error.message === 'Invalid token') {
      return res.status(401).json({ message: error.message });
    }
    
    // Fallback to mock mode if Razorpay fails
    if (req.method === 'POST' && req.query.action === 'create-order') {
      console.log('Falling back to mock payment mode');
      const mockOrder = {
        id: `order_mock_${Date.now()}`,
        amount: Math.round(req.body.amount * 100),
        currency: 'INR'
      };

      return res.json({
        orderId: mockOrder.id,
        amount: mockOrder.amount,
        currency: mockOrder.currency,
        key: 'rzp_test_mock_key',
        isMockMode: true
      });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
}
