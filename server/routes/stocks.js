const express = require('express');
const Stock = require('../models/Stock');
const MarketData = require('../models/MarketData');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Get all stocks with filtering and pagination
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { 
      search, 
      sector, 
      sortBy = 'name', 
      order = 'asc',
      limit = 50, 
      page = 1,
      minPrice,
      maxPrice,
      minMarketCap,
      maxMarketCap
    } = req.query;

    const skip = (page - 1) * limit;
    let query = { isActive: true };

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { symbol: { $regex: search, $options: 'i' } }
      ];
    }

    // Sector filter
    if (sector && sector !== 'All') {
      query.sector = sector;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Market cap filter (simplified - would need proper conversion)
    if (minMarketCap || maxMarketCap) {
      // This is a simplified implementation
      // In reality, you'd need to convert marketCap string to number
    }

    // Sort options
    let sortOptions = {};
    const sortOrder = order === 'desc' ? -1 : 1;
    
    switch (sortBy) {
      case 'price':
        sortOptions = { price: sortOrder };
        break;
      case 'change':
        sortOptions = { changePercent: sortOrder };
        break;
      case 'volume':
        sortOptions = { volume: sortOrder };
        break;
      case 'marketCap':
        sortOptions = { marketCap: sortOrder };
        break;
      case 'pe':
        sortOptions = { pe: sortOrder };
        break;
      default:
        sortOptions = { name: sortOrder };
    }

    const stocks = await Stock.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Stock.countDocuments(query);

    res.json({
      stocks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Stocks fetch error:', error);
    res.status(500).json({ message: 'Server error fetching stocks' });
  }
});

// Get stock by symbol
router.get('/:symbol', optionalAuth, async (req, res) => {
  try {
    const { symbol } = req.params;
    const stock = await Stock.findOne({ 
      symbol: symbol.toUpperCase(),
      isActive: true 
    });
    
    if (!stock) {
      return res.status(404).json({ message: 'Stock not found' });
    }

    // Get 52-week high/low data
    const highLowData = await MarketData.getHighLow52Week(symbol);
    if (highLowData) {
      stock.high52w = highLowData.high52w;
      stock.low52w = highLowData.low52w;
    }

    res.json(stock);
  } catch (error) {
    console.error('Stock fetch error:', error);
    res.status(500).json({ message: 'Server error fetching stock' });
  }
});

// Get stock chart data
router.get('/:symbol/chart', optionalAuth, async (req, res) => {
  try {
    const { symbol } = req.params;
    const { period = '1M', interval = 'daily' } = req.query;

    const chartData = await MarketData.getChartData(symbol, period, interval);
    
    if (!chartData || chartData.length === 0) {
      return res.status(404).json({ message: 'Chart data not found' });
    }

    // Format data for frontend
    const formattedData = chartData.map(data => ({
      date: data.date.toISOString().split('T')[0],
      price: data.close,
      open: data.open,
      high: data.high,
      low: data.low,
      volume: data.volume
    }));

    res.json(formattedData);
  } catch (error) {
    console.error('Chart data fetch error:', error);
    res.status(500).json({ message: 'Server error fetching chart data' });
  }
});

// Get stock technical indicators
router.get('/:symbol/indicators', optionalAuth, async (req, res) => {
  try {
    const { symbol } = req.params;
    const { period = 20 } = req.query;

    const indicators = await MarketData.getTechnicalIndicators(symbol, parseInt(period));
    
    if (!indicators) {
      return res.status(404).json({ message: 'Insufficient data for technical indicators' });
    }

    res.json(indicators);
  } catch (error) {
    console.error('Technical indicators fetch error:', error);
    res.status(500).json({ message: 'Server error fetching technical indicators' });
  }
});

// Get stock price history
router.get('/:symbol/history', optionalAuth, async (req, res) => {
  try {
    const { symbol } = req.params;
    const { days = 30 } = req.query;

    const history = await MarketData.getPriceHistory(symbol, parseInt(days));
    
    const formattedHistory = history.map(data => ({
      date: data.date,
      price: data.close,
      change: data.change,
      changePercent: data.changePercent,
      volume: data.volume
    }));

    res.json(formattedHistory);
  } catch (error) {
    console.error('Price history fetch error:', error);
    res.status(500).json({ message: 'Server error fetching price history' });
  }
});

// Get sectors
router.get('/meta/sectors', async (req, res) => {
  try {
    const sectors = await Stock.distinct('sector', { isActive: true });
    res.json(sectors.sort());
  } catch (error) {
    console.error('Sectors fetch error:', error);
    res.status(500).json({ message: 'Server error fetching sectors' });
  }
});

// Search stocks
router.get('/search/:query', optionalAuth, async (req, res) => {
  try {
    const { query } = req.params;
    const { limit = 10 } = req.query;

    const stocks = await Stock.searchStocks(query, parseInt(limit));
    
    res.json(stocks);
  } catch (error) {
    console.error('Stock search error:', error);
    res.status(500).json({ message: 'Server error searching stocks' });
  }
});

// Get top gainers
router.get('/trending/gainers', optionalAuth, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const gainers = await Stock.getTopGainers(parseInt(limit));
    res.json(gainers);
  } catch (error) {
    console.error('Top gainers fetch error:', error);
    res.status(500).json({ message: 'Server error fetching top gainers' });
  }
});

// Get top losers
router.get('/trending/losers', optionalAuth, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const losers = await Stock.getTopLosers(parseInt(limit));
    res.json(losers);
  } catch (error) {
    console.error('Top losers fetch error:', error);
    res.status(500).json({ message: 'Server error fetching top losers' });
  }
});

// Get most active stocks
router.get('/trending/active', optionalAuth, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const active = await Stock.getMostActive(parseInt(limit));
    res.json(active);
  } catch (error) {
    console.error('Most active stocks fetch error:', error);
    res.status(500).json({ message: 'Server error fetching most active stocks' });
  }
});

module.exports = router;