import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
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

    if (method === 'GET') {
      if (query.debug) {
        // Debug endpoint
        const userDoc = await User.findById(user.userId);
        return res.json({
          userId: userDoc._id,
          email: userDoc.email,
          wallet: userDoc.wallet,
          oldBalance: userDoc.balance,
          walletExists: !!userDoc.wallet,
          transactionCount: userDoc.wallet?.transactions?.length || 0
        });
      } else {
        // Get wallet info
        const userDoc = await User.findById(user.userId).select('wallet balance');
        if (!userDoc) {
          return res.status(404).json({ message: 'User not found' });
        }

        console.log('Fetching wallet for user:', user.userId);
        console.log('User wallet:', userDoc.wallet);
        console.log('User balance (old field):', userDoc.balance);

        // Initialize wallet if it doesn't exist (for existing users)
        if (!userDoc.wallet) {
          console.log('Initializing wallet for existing user');
          userDoc.wallet = {
            balance: userDoc.balance || 1000, // Use old balance or default $1000
            currency: 'USD',
            transactions: []
          };
          await userDoc.save();
        }

        const walletResponse = {
          balance: userDoc.wallet.balance,
          currency: userDoc.wallet.currency,
          transactions: userDoc.wallet.transactions.sort((a, b) => new Date(b.date) - new Date(a.date))
        };

        console.log('Sending wallet response:', walletResponse);
        return res.json(walletResponse);
      }
    }

    if (method === 'POST') {
      const { action } = query;
      
      if (action === 'deposit') {
        const { amount, description = 'Wallet deposit' } = body;

        if (!amount || amount <= 0) {
          return res.status(400).json({ message: 'Invalid amount' });
        }

        const userDoc = await User.findById(user.userId);
        if (!userDoc) {
          return res.status(404).json({ message: 'User not found' });
        }

        // Initialize wallet if it doesn't exist
        if (!userDoc.wallet) {
          userDoc.wallet = {
            balance: 1000,
            currency: 'USD',
            transactions: []
          };
        }

        // Add to balance
        userDoc.wallet.balance += amount;

        // Add transaction record
        userDoc.wallet.transactions.push({
          type: 'DEPOSIT',
          amount: amount,
          description: description,
          date: new Date()
        });

        userDoc.markModified('wallet');
        await userDoc.save();

        return res.json({
          message: 'Funds added successfully',
          balance: userDoc.wallet.balance,
          transaction: userDoc.wallet.transactions[userDoc.wallet.transactions.length - 1]
        });
      }

      if (action === 'withdraw') {
        const { amount, description = 'Wallet withdrawal' } = body;

        if (!amount || amount <= 0) {
          return res.status(400).json({ message: 'Invalid amount' });
        }

        const userDoc = await User.findById(user.userId);
        if (!userDoc) {
          return res.status(404).json({ message: 'User not found' });
        }

        // Initialize wallet if it doesn't exist
        if (!userDoc.wallet) {
          userDoc.wallet = {
            balance: 1000,
            currency: 'USD',
            transactions: []
          };
        }

        if (userDoc.wallet.balance < amount) {
          return res.status(400).json({ message: 'Insufficient funds' });
        }

        // Deduct from balance
        userDoc.wallet.balance -= amount;

        // Add transaction record
        userDoc.wallet.transactions.push({
          type: 'WITHDRAWAL',
          amount: -amount,
          description: description,
          date: new Date()
        });

        userDoc.markModified('wallet');
        await userDoc.save();

        return res.json({
          message: 'Funds withdrawn successfully',
          balance: userDoc.wallet.balance,
          transaction: userDoc.wallet.transactions[userDoc.wallet.transactions.length - 1]
        });
      }

      if (action === 'initialize') {
        const userDoc = await User.findById(user.userId);
        if (!userDoc) {
          return res.status(404).json({ message: 'User not found' });
        }

        console.log('Initializing wallet for user:', userDoc.email);
        console.log('Current user wallet:', userDoc.wallet);
        console.log('Current user balance (old field):', userDoc.balance);

        // Force initialize wallet
        const initialBalance = userDoc.balance || 1000;
        userDoc.wallet = {
          balance: initialBalance,
          currency: 'USD',
          transactions: [{
            type: 'DEPOSIT',
            amount: initialBalance,
            description: 'Initial wallet setup - $1000 welcome bonus',
            date: new Date()
          }]
        };

        // Clear old balance field
        if (userDoc.balance !== undefined) {
          userDoc.balance = undefined;
        }

        await userDoc.save();
        console.log('Wallet initialized with balance:', userDoc.wallet.balance);

        return res.json({
          message: 'Wallet initialized successfully',
          balance: userDoc.wallet.balance,
          currency: userDoc.wallet.currency,
          transactions: userDoc.wallet.transactions
        });
      }
    }

    res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Wallet API error:', error);
    if (error.message === 'Access token required' || error.message === 'Invalid token') {
      return res.status(401).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
}
