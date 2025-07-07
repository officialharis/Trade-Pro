import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Import models
import Stock from '../server/models/Stock.js';
import MarketData from '../server/models/MarketData.js';

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
    const { symbol } = query;

    if (method === 'GET') {
      if (symbol) {
        // Get specific stock
        if (symbol.includes('chart')) {
          // Handle chart data request
          const stockSymbol = symbol.replace('/chart', '');
          const { period = '1M' } = query;

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
            symbol: stockSymbol.toUpperCase(),
            date: { $gte: startDate, $lte: endDate }
          }).sort({ date: 1 });

          return res.json(chartData);
        } else {
          // Get single stock
          const stock = await Stock.findOne({ symbol: symbol.toUpperCase() });
          
          if (!stock) {
            return res.status(404).json({ message: 'Stock not found' });
          }

          return res.json(stock);
        }
      } else {
        // Get all stocks with filters
        const { search, sector, sortBy, limit = 50 } = query;
        let mongoQuery = {};

        if (search) {
          mongoQuery.$or = [
            { name: { $regex: search, $options: 'i' } },
            { symbol: { $regex: search, $options: 'i' } }
          ];
        }

        if (sector && sector !== 'All') {
          mongoQuery.sector = sector;
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

        const stocks = await Stock.find(mongoQuery)
          .sort(sortOptions)
          .limit(parseInt(limit));

        return res.json(stocks);
      }
    }

    res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Stocks API error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}
