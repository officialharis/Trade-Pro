import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Import models
import Stock from '../server/models/Stock.js';

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
    const { method, query } = req;
    const { type } = query;

    if (method === 'GET') {
      if (type === 'indices') {
        // Market indices data
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

        return res.json(indices);
      }

      if (type === 'trending') {
        // Trending stocks
        const { category = 'gainers', limit = 10 } = query;
        
        let sortOptions = {};
        if (category === 'gainers') {
          sortOptions = { changePercent: -1 };
        } else if (category === 'losers') {
          sortOptions = { changePercent: 1 };
        } else {
          sortOptions = { volume: -1 };
        }

        const stocks = await Stock.find({})
          .sort(sortOptions)
          .limit(parseInt(limit));

        return res.json(stocks);
      }
    }

    res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Market API error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}
