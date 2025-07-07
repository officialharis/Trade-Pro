import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Razorpay from 'razorpay';
import crypto from 'crypto';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Razorpay
console.log('Razorpay Key ID:', process.env.RAZORPAY_KEY_ID ? 'Set' : 'Not set');
console.log('Razorpay Key Secret:', process.env.RAZORPAY_KEY_SECRET ? 'Set' : 'Not set');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection with explicit Atlas configuration
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is not set!');
  process.exit(1);
}

const isLocal = MONGODB_URI.includes('localhost');
console.log(`🔗 Connecting to ${isLocal ? 'Local MongoDB' : 'MongoDB Atlas'}...`);
console.log('📍 Database URI:', MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')); // Hide credentials in logs

mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
})
.then(() => {
  console.log(`✅ Successfully connected to ${isLocal ? 'Local MongoDB' : 'MongoDB Atlas'}!`);
  console.log('📊 Database:', mongoose.connection.db.databaseName);
  console.log('🌐 Host:', mongoose.connection.host);
})
.catch((error) => {
  console.error(`❌ ${isLocal ? 'Local MongoDB' : 'MongoDB Atlas'} connection failed:`, error.message);
  process.exit(1);
});

const db = mongoose.connection;
db.on('error', (error) => {
  console.error('❌ MongoDB connection error:', error);
});
db.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected');
});
db.on('reconnected', () => {
  console.log('✅ MongoDB reconnected');
});



// Stock Schema
const stockSchema = new mongoose.Schema({
  symbol: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  change: { type: Number, required: true },
  changePercent: { type: Number, required: true },
  marketCap: { type: String, required: true },
  sector: { type: String, required: true },
  pe: { type: Number, required: true },
  logo: { type: String, required: true },
  volume: { type: Number, default: 0 },
  high52w: Number,
  low52w: Number,
  dividend: Number,
  eps: Number,
  bookValue: Number
}, { timestamps: true });

const Stock = mongoose.model('Stock', stockSchema);

// Portfolio Schema
const portfolioSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  symbol: { type: String, required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  avgPrice: { type: Number, required: true },
  purchaseDate: { type: Date, default: Date.now }
}, { timestamps: true });

const Portfolio = mongoose.model('Portfolio', portfolioSchema);

// Import models
import Transaction from './models/Transaction.js';
import User from './models/User.js';

// Watchlist Schema
const watchlistSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  symbol: { type: String, required: true },
  name: { type: String, required: true },
  addedDate: { type: Date, default: Date.now }
}, { timestamps: true });

const Watchlist = mongoose.model('Watchlist', watchlistSchema);

// Market Data Schema
const marketDataSchema = new mongoose.Schema({
  symbol: { type: String, required: true },
  date: { type: Date, required: true },
  open: { type: Number, required: true },
  high: { type: Number, required: true },
  low: { type: Number, required: true },
  close: { type: Number, required: true },
  volume: { type: Number, required: true }
}, { timestamps: true });

const MarketData = mongoose.model('MarketData', marketDataSchema);

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
app.post('/api/auth/register', async (req, res) => {
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

app.post('/api/auth/login', async (req, res) => {
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
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/user/profile', authenticateToken, async (req, res) => {
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

// Stock Routes
app.get('/api/stocks', async (req, res) => {
  try {
    const { search, sector, sortBy, limit = 50 } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { symbol: { $regex: search, $options: 'i' } }
      ];
    }

    if (sector && sector !== 'All') {
      query.sector = sector;
    }

    let sortOptions = {};
    switch (sortBy) {
      case 'price':
        sortOptions = { price: -1 };
        break;
      case 'change':
        sortOptions = { changePercent: -1 };
        break;
      case 'marketCap':
        sortOptions = { marketCap: -1 };
        break;
      default:
        sortOptions = { name: 1 };
    }

    const stocks = await Stock.find(query)
      .sort(sortOptions)
      .limit(parseInt(limit));

    res.json(stocks);
  } catch (error) {
    console.error('Stocks fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/stocks/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const stock = await Stock.findOne({ symbol: symbol.toUpperCase() });
    
    if (!stock) {
      return res.status(404).json({ message: 'Stock not found' });
    }

    res.json(stock);
  } catch (error) {
    console.error('Stock fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/stocks/:symbol/chart', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { period = '1M' } = req.query;

    let days = 30;
    switch (period) {
      case '1D': days = 1; break;
      case '1W': days = 7; break;
      case '1M': days = 30; break;
      case '3M': days = 90; break;
      case '1Y': days = 365; break;
    }

    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));

    const chartData = await MarketData.find({
      symbol: symbol.toUpperCase(),
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 });

    res.json(chartData);
  } catch (error) {
    console.error('Chart data fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Portfolio Routes
app.get('/api/portfolio', authenticateToken, async (req, res) => {
  try {
    const holdings = await Portfolio.find({
      userId: req.user.userId,
      quantity: { $gt: 0 } // Only return holdings with positive quantity
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

    console.log(`Portfolio API: Found ${enhancedHoldings.length} holdings for user ${req.user.userId}`);
    res.json(enhancedHoldings);
  } catch (error) {
    console.error('Portfolio fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Debug endpoint to check portfolio data
app.get('/api/portfolio/debug', authenticateToken, async (req, res) => {
  try {
    const allPortfolioEntries = await Portfolio.find({ userId: req.user.userId });
    const activeHoldings = await Portfolio.find({
      userId: req.user.userId,
      quantity: { $gt: 0 }
    });
    const transactions = await Transaction.find({ userId: req.user.userId }).limit(5);

    res.json({
      userId: req.user.userId,
      totalPortfolioEntries: allPortfolioEntries.length,
      activeHoldings: activeHoldings.length,
      recentTransactions: transactions.length,
      portfolioData: allPortfolioEntries,
      activeHoldingsData: activeHoldings,
      recentTransactionsData: transactions
    });
  } catch (error) {
    console.error('Portfolio debug error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/portfolio/buy', authenticateToken, async (req, res) => {
  try {
    const { symbol, name, quantity, price } = req.body;
    const totalCost = quantity * price;

    // Check user wallet balance
    const user = await User.findById(req.user.userId);

    // Initialize wallet if it doesn't exist
    if (!user.wallet) {
      user.wallet = {
        balance: 1000,
        currency: 'USD',
        transactions: []
      };
      await user.save();
    }

    if (user.wallet.balance < totalCost) {
      return res.status(400).json({ message: 'Insufficient wallet balance' });
    }

    // Check if stock exists in portfolio
    const existingHolding = await Portfolio.findOne({
      userId: req.user.userId,
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
        userId: req.user.userId,
        symbol,
        name,
        quantity,
        avgPrice: price
      });
      await newHolding.save();
    }

    // Update user wallet balance
    console.log('Before buy - wallet balance:', user.wallet.balance); // Debug log
    user.wallet.balance -= totalCost;
    console.log('After buy - wallet balance:', user.wallet.balance); // Debug log

    // Add wallet transaction record
    user.wallet.transactions.push({
      type: 'STOCK_PURCHASE',
      amount: -totalCost,
      description: `Purchased ${quantity} shares of ${symbol}`,
      stockSymbol: symbol,
      quantity: quantity,
      pricePerShare: price,
      date: new Date()
    });

    // Mark wallet as modified to ensure it saves
    user.markModified('wallet');
    await user.save();
    console.log('User saved with new wallet balance:', user.wallet.balance); // Debug log

    // Create transaction record
    const transaction = new Transaction({
      userId: req.user.userId,
      type: 'BUY',
      symbol,
      name,
      quantity,
      price,
      total: totalCost
    });

    // Calculate fees
    transaction.calculateFees();
    await transaction.save();

    res.json({
      message: 'Stock purchased successfully',
      transaction,
      walletBalance: user.wallet.balance
    });
  } catch (error) {
    console.error('Buy stock error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/portfolio/sell', authenticateToken, async (req, res) => {
  try {
    const { symbol, quantity, price } = req.body;
    const totalRevenue = quantity * price;

    // Find holding
    const holding = await Portfolio.findOne({
      userId: req.user.userId,
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
    const user = await User.findById(req.user.userId);

    // Initialize wallet if it doesn't exist
    if (!user.wallet) {
      user.wallet = {
        balance: 1000,
        currency: 'USD',
        transactions: []
      };
    }

    user.wallet.balance += totalRevenue;

    // Add wallet transaction record
    user.wallet.transactions.push({
      type: 'STOCK_SALE',
      amount: totalRevenue,
      description: `Sold ${quantity} shares of ${symbol}`,
      stockSymbol: symbol,
      quantity: quantity,
      pricePerShare: price,
      date: new Date()
    });

    // Mark wallet as modified to ensure it saves
    user.markModified('wallet');
    await user.save();

    // Create transaction record
    const transaction = new Transaction({
      userId: req.user.userId,
      type: 'SELL',
      symbol,
      name: holding.name,
      quantity,
      price,
      total: totalRevenue
    });

    // Calculate fees
    transaction.calculateFees();
    await transaction.save();

    res.json({
      message: 'Stock sold successfully',
      transaction,
      walletBalance: user.wallet.balance
    });
  } catch (error) {
    console.error('Sell stock error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Transaction Routes
app.get('/api/transactions', authenticateToken, async (req, res) => {
  try {
    const { limit = 50, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    const transactions = await Transaction.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Transaction.countDocuments({ userId: req.user.userId });

    res.json({
      transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Transactions fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Watchlist Routes
app.get('/api/watchlist', authenticateToken, async (req, res) => {
  try {
    const watchlist = await Watchlist.find({ userId: req.user.userId });
    res.json(watchlist);
  } catch (error) {
    console.error('Watchlist fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/watchlist', authenticateToken, async (req, res) => {
  try {
    const { symbol, name } = req.body;

    // Check if already in watchlist
    const existing = await Watchlist.findOne({
      userId: req.user.userId,
      symbol
    });

    if (existing) {
      return res.status(400).json({ message: 'Stock already in watchlist' });
    }

    const watchlistItem = new Watchlist({
      userId: req.user.userId,
      symbol,
      name
    });

    await watchlistItem.save();
    res.json({ message: 'Stock added to watchlist', watchlistItem });
  } catch (error) {
    console.error('Add to watchlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/watchlist/:symbol', authenticateToken, async (req, res) => {
  try {
    const { symbol } = req.params;
    
    await Watchlist.deleteOne({
      userId: req.user.userId,
      symbol: symbol.toUpperCase()
    });

    res.json({ message: 'Stock removed from watchlist' });
  } catch (error) {
    console.error('Remove from watchlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Wallet Routes
app.get('/api/wallet', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('wallet balance');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('Fetching wallet for user:', req.user.userId); // Debug log
    console.log('User wallet:', user.wallet); // Debug log
    console.log('User balance (old field):', user.balance); // Debug log

    // Initialize wallet if it doesn't exist (for existing users)
    if (!user.wallet) {
      console.log('Initializing wallet for existing user'); // Debug log
      user.wallet = {
        balance: user.balance || 1000, // Use old balance or default $1000
        currency: 'USD',
        transactions: []
      };
      await user.save();
    }

    const walletResponse = {
      balance: user.wallet.balance,
      currency: user.wallet.currency,
      transactions: user.wallet.transactions.sort((a, b) => new Date(b.date) - new Date(a.date))
    };

    console.log('Sending wallet response:', walletResponse); // Debug log
    res.json(walletResponse);
  } catch (error) {
    console.error('Error fetching wallet:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/wallet/deposit', authenticateToken, async (req, res) => {
  try {
    const { amount, description = 'Wallet deposit' } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Add to balance
    user.wallet.balance += amount;

    // Add transaction record
    user.wallet.transactions.push({
      type: 'DEPOSIT',
      amount: amount,
      description: description,
      date: new Date()
    });

    await user.save();

    res.json({
      message: 'Funds added successfully',
      balance: user.wallet.balance,
      transaction: user.wallet.transactions[user.wallet.transactions.length - 1]
    });
  } catch (error) {
    console.error('Error depositing funds:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/wallet/withdraw', authenticateToken, async (req, res) => {
  try {
    const { amount, description = 'Wallet withdrawal' } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.wallet.balance < amount) {
      return res.status(400).json({ message: 'Insufficient funds' });
    }

    // Deduct from balance
    user.wallet.balance -= amount;

    // Add transaction record
    user.wallet.transactions.push({
      type: 'WITHDRAWAL',
      amount: -amount,
      description: description,
      date: new Date()
    });

    await user.save();

    res.json({
      message: 'Funds withdrawn successfully',
      balance: user.wallet.balance,
      transaction: user.wallet.transactions[user.wallet.transactions.length - 1]
    });
  } catch (error) {
    console.error('Error withdrawing funds:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Initialize wallet for existing users
app.post('/api/wallet/initialize', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('Initializing wallet for user:', user.email);
    console.log('Current user wallet:', user.wallet);
    console.log('Current user balance (old field):', user.balance);

    // Force initialize wallet
    const initialBalance = user.balance || 1000;
    user.wallet = {
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
    if (user.balance !== undefined) {
      user.balance = undefined;
    }

    await user.save();
    console.log('Wallet initialized with balance:', user.wallet.balance);

    res.json({
      message: 'Wallet initialized successfully',
      balance: user.wallet.balance,
      currency: user.wallet.currency,
      transactions: user.wallet.transactions
    });
  } catch (error) {
    console.error('Error initializing wallet:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Debug wallet endpoint
app.get('/api/wallet/debug', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    res.json({
      userId: user._id,
      email: user.email,
      wallet: user.wallet,
      oldBalance: user.balance,
      walletExists: !!user.wallet,
      transactionCount: user.wallet?.transactions?.length || 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Razorpay Payment Routes
// Create Razorpay order
app.post('/api/payment/create-order', authenticateToken, async (req, res) => {
  try {
    console.log('Creating Razorpay order for user:', req.user.userId);
    const { amount } = req.body;
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

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);

    // Fallback to mock mode if Razorpay fails
    console.log('Falling back to mock payment mode');
    const mockOrder = {
      id: `order_mock_${Date.now()}`,
      amount: Math.round(req.body.amount * 100),
      currency: 'INR'
    };

    res.json({
      orderId: mockOrder.id,
      amount: mockOrder.amount,
      currency: mockOrder.currency,
      key: 'rzp_test_mock_key',
      isMockMode: true
    });
  }
});

// Verify Razorpay payment and add funds to wallet
app.post('/api/payment/verify', authenticateToken, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount,
      isMockPayment
    } = req.body;

    console.log('Verifying payment:', { razorpay_order_id, razorpay_payment_id, isMockPayment });

    // Handle mock payments (for testing without real Razorpay credentials)
    if (isMockPayment || razorpay_order_id?.includes('mock')) {
      console.log('Processing mock payment');

      // Payment verified, add funds to wallet
      const user = await User.findById(req.user.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Convert amount from paise to dollars (for consistency with wallet currency)
      const amountInDollars = amount / 100;

      // Initialize wallet if it doesn't exist
      if (!user.wallet) {
        user.wallet = {
          balance: 1000,
          currency: 'USD',
          transactions: []
        };
      }

      // Add to balance
      user.wallet.balance += amountInDollars;

      // Add transaction record
      user.wallet.transactions.push({
        type: 'DEPOSIT',
        amount: amountInDollars,
        description: `Mock payment - ${razorpay_payment_id || 'mock_payment_' + Date.now()}`,
        date: new Date(),
        paymentId: razorpay_payment_id || 'mock_payment_' + Date.now(),
        orderId: razorpay_order_id
      });

      user.markModified('wallet');
      await user.save();

      return res.json({
        message: 'Mock payment processed successfully',
        balance: user.wallet.balance,
        transaction: user.wallet.transactions[user.wallet.transactions.length - 1]
      });
    }

    // Real Razorpay payment verification
    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ message: 'Payment gateway not configured' });
    }

    // Verify payment signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    // Payment verified, add funds to wallet
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Convert amount from paise to dollars
    const amountInDollars = amount / 100;

    // Initialize wallet if it doesn't exist
    if (!user.wallet) {
      user.wallet = {
        balance: 1000,
        currency: 'USD',
        transactions: []
      };
    }

    // Add to balance
    user.wallet.balance += amountInDollars;

    // Add transaction record
    user.wallet.transactions.push({
      type: 'DEPOSIT',
      amount: amountInDollars,
      description: `Razorpay payment - ${razorpay_payment_id}`,
      date: new Date(),
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id
    });

    user.markModified('wallet');
    await user.save();

    res.json({
      message: 'Payment verified and funds added successfully',
      balance: user.wallet.balance,
      transaction: user.wallet.transactions[user.wallet.transactions.length - 1]
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ message: 'Payment verification failed' });
  }
});

// Market Data Routes
app.get('/api/market/indices', async (req, res) => {
  try {
    const indices = [
      {
        name: "NIFTY 50",
        value: 19865.20,
        change: 245.30,
        changePercent: 1.25
      },
      {
        name: "SENSEX",
        value: 66589.93,
        change: 503.27,
        changePercent: 0.76
      },
      {
        name: "NIFTY BANK",
        value: 44732.85,
        change: -123.45,
        changePercent: -0.28
      },
      {
        name: "NIFTY IT",
        value: 30456.70,
        change: 892.15,
        changePercent: 3.02
      }
    ];

    res.json(indices);
  } catch (error) {
    console.error('Market indices fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/market/trending', async (req, res) => {
  try {
    const { type = 'gainers', limit = 10 } = req.query;
    
    let sortOptions = {};
    if (type === 'gainers') {
      sortOptions = { changePercent: -1 };
    } else if (type === 'losers') {
      sortOptions = { changePercent: 1 };
    } else {
      sortOptions = { volume: -1 };
    }

    const stocks = await Stock.find({})
      .sort(sortOptions)
      .limit(parseInt(limit));

    res.json(stocks);
  } catch (error) {
    console.error('Trending stocks fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Dashboard Routes
app.get('/api/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get portfolio holdings
    const holdings = await Portfolio.find({ userId });
    
    // Get user balance
    const user = await User.findById(userId);
    
    // Get recent transactions
    const recentTransactions = await Transaction.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5);

    // Get watchlist count
    const watchlistCount = await Watchlist.countDocuments({ userId });

    // Calculate portfolio value (would need current stock prices)
    let portfolioValue = 0;
    let totalInvestment = 0;

    for (const holding of holdings) {
      const stock = await Stock.findOne({ symbol: holding.symbol });
      if (stock) {
        portfolioValue += stock.price * holding.quantity;
        totalInvestment += holding.avgPrice * holding.quantity;
      }
    }

    const totalGain = portfolioValue - totalInvestment;
    const gainPercentage = totalInvestment > 0 ? (totalGain / totalInvestment) * 100 : 0;

    // Initialize wallet if it doesn't exist (for existing users)
    if (!user.wallet) {
      user.wallet = {
        balance: user.balance || 1000, // Use old balance or default $1000
        currency: 'USD',
        transactions: []
      };
      await user.save();
    }

    res.json({
      portfolioValue,
      totalInvestment,
      totalGain,
      gainPercentage,
      availableBalance: user.wallet.balance,
      currency: user.wallet.currency,
      totalHoldings: holdings.length,
      watchlistCount,
      recentTransactions
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Database health check
app.get('/api/health/db', async (req, res) => {
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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Health check endpoint for Railway/Vercel
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Basic route
app.get('/', (req, res) => {
  res.json({
    message: 'TradePro API Server is running!',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth/*',
      stocks: '/api/stocks',
      portfolio: '/api/portfolio',
      wallet: '/api/wallet',
      payment: '/api/payment'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// For local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`💳 Razorpay: ${process.env.RAZORPAY_KEY_ID ? 'Configured' : 'Mock Mode'}`);
    console.log(`🌐 CORS Origin: ${process.env.CORS_ORIGIN}`);
  });
}

// Export for Vercel
export default app;