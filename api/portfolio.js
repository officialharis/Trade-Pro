import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Import models
import User from '../server/models/User.js';
import Stock from '../server/models/Stock.js';
import Portfolio from '../server/models/Portfolio.js';
import Transaction from '../server/models/Transaction.js';

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
        const allPortfolioEntries = await Portfolio.find({ userId: user.userId });
        const activeHoldings = await Portfolio.find({
          userId: user.userId,
          quantity: { $gt: 0 }
        });
        const transactions = await Transaction.find({ userId: user.userId }).limit(5);

        return res.json({
          userId: user.userId,
          totalPortfolioEntries: allPortfolioEntries.length,
          activeHoldings: activeHoldings.length,
          recentTransactions: transactions.length,
          portfolioData: allPortfolioEntries,
          activeHoldingsData: activeHoldings,
          recentTransactionsData: transactions
        });
      } else {
        // Get portfolio holdings
        const holdings = await Portfolio.find({
          userId: user.userId,
          quantity: { $gt: 0 }
        });

        // Enhance holdings with current stock prices and P&L
        const enhancedHoldings = await Promise.all(
          holdings.map(async (holding) => {
            const stock = await Stock.findOne({ symbol: holding.symbol });
            const currentPrice = stock ? stock.price : holding.avgPrice;
            const currentValue = holding.quantity * currentPrice;
            const investedValue = holding.quantity * holding.avgPrice;
            const pnl = currentValue - investedValue;
            const pnlPercentage = investedValue > 0 ? (pnl / investedValue) * 100 : 0;

            return {
              ...holding.toObject(),
              currentPrice,
              currentValue,
              investedValue,
              pnl,
              pnlPercentage,
              stockName: stock ? stock.name : holding.name,
              logo: stock ? stock.logo : null
            };
          })
        );

        console.log(`Portfolio API: Found ${enhancedHoldings.length} holdings for user ${user.userId}`);
        return res.json(enhancedHoldings);
      }
    }

    if (method === 'POST') {
      const { action } = query;
      
      if (action === 'buy') {
        const { symbol, name, quantity, price } = body;
        const totalCost = quantity * price;

        // Check user wallet balance
        const userDoc = await User.findById(user.userId);

        // Initialize wallet if it doesn't exist
        if (!userDoc.wallet) {
          userDoc.wallet = {
            balance: 1000,
            currency: 'USD',
            transactions: []
          };
          await userDoc.save();
        }

        if (userDoc.wallet.balance < totalCost) {
          return res.status(400).json({ message: 'Insufficient wallet balance' });
        }

        // Check if stock exists in portfolio
        const existingHolding = await Portfolio.findOne({
          userId: user.userId,
          symbol
        });

        if (existingHolding) {
          // Update existing holding
          const totalQuantity = existingHolding.quantity + quantity;
          const avgPrice = ((existingHolding.avgPrice * existingHolding.quantity) + totalCost) / totalQuantity;

          existingHolding.quantity = totalQuantity;
          existingHolding.avgPrice = avgPrice;
          await existingHolding.save();
        } else {
          // Create new holding
          const newHolding = new Portfolio({
            userId: user.userId,
            symbol,
            name,
            quantity,
            avgPrice: price
          });
          await newHolding.save();
        }

        // Update user wallet balance
        userDoc.wallet.balance -= totalCost;

        // Add wallet transaction record
        userDoc.wallet.transactions.push({
          type: 'STOCK_PURCHASE',
          amount: -totalCost,
          description: `Purchased ${quantity} shares of ${symbol}`,
          stockSymbol: symbol,
          quantity: quantity,
          pricePerShare: price,
          date: new Date()
        });

        userDoc.markModified('wallet');
        await userDoc.save();

        // Create transaction record
        const transaction = new Transaction({
          userId: user.userId,
          type: 'BUY',
          symbol,
          name,
          quantity,
          price,
          total: totalCost
        });

        transaction.calculateFees();
        await transaction.save();

        return res.json({
          message: 'Stock purchased successfully',
          transaction,
          walletBalance: userDoc.wallet.balance
        });
      }

      if (action === 'sell') {
        const { symbol, quantity, price } = body;
        const totalRevenue = quantity * price;

        // Find holding
        const holding = await Portfolio.findOne({
          userId: user.userId,
          symbol
        });

        if (!holding || holding.quantity < quantity) {
          return res.status(400).json({ message: 'Insufficient shares to sell' });
        }

        // Update holding
        if (holding.quantity === quantity) {
          await Portfolio.deleteOne({ _id: holding._id });
        } else {
          holding.quantity -= quantity;
          await holding.save();
        }

        // Update user wallet balance
        const userDoc = await User.findById(user.userId);

        // Initialize wallet if it doesn't exist
        if (!userDoc.wallet) {
          userDoc.wallet = {
            balance: 1000,
            currency: 'USD',
            transactions: []
          };
        }

        userDoc.wallet.balance += totalRevenue;

        // Add wallet transaction record
        userDoc.wallet.transactions.push({
          type: 'STOCK_SALE',
          amount: totalRevenue,
          description: `Sold ${quantity} shares of ${symbol}`,
          stockSymbol: symbol,
          quantity: quantity,
          pricePerShare: price,
          date: new Date()
        });

        userDoc.markModified('wallet');
        await userDoc.save();

        // Create transaction record
        const transaction = new Transaction({
          userId: user.userId,
          type: 'SELL',
          symbol,
          name: holding.name,
          quantity,
          price,
          total: totalRevenue
        });

        transaction.calculateFees();
        await transaction.save();

        return res.json({
          message: 'Stock sold successfully',
          transaction,
          walletBalance: userDoc.wallet.balance
        });
      }
    }

    res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Portfolio API error:', error);
    if (error.message === 'Access token required' || error.message === 'Invalid token') {
      return res.status(401).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
}
