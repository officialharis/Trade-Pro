const mongoose = require('mongoose');

const marketDataSchema = new mongoose.Schema({
  symbol: { 
    type: String, 
    required: true,
    uppercase: true,
    trim: true
  },
  date: { 
    type: Date, 
    required: true 
  },
  open: { 
    type: Number, 
    required: true,
    min: 0
  },
  high: { 
    type: Number, 
    required: true,
    min: 0
  },
  low: { 
    type: Number, 
    required: true,
    min: 0
  },
  close: { 
    type: Number, 
    required: true,
    min: 0
  },
  volume: { 
    type: Number, 
    required: true,
    min: 0
  },
  adjustedClose: {
    type: Number,
    min: 0
  },
  dividendAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  splitCoefficient: {
    type: Number,
    default: 1,
    min: 0
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
marketDataSchema.index({ symbol: 1, date: -1 }, { unique: true });
marketDataSchema.index({ symbol: 1 });
marketDataSchema.index({ date: -1 });
marketDataSchema.index({ volume: -1 });

// Virtual for price change
marketDataSchema.virtual('change').get(function() {
  return this.close - this.open;
});

// Virtual for price change percentage
marketDataSchema.virtual('changePercent').get(function() {
  if (this.open === 0) return 0;
  return ((this.close - this.open) / this.open) * 100;
});

// Virtual for trading range
marketDataSchema.virtual('range').get(function() {
  return this.high - this.low;
});

// Virtual for range percentage
marketDataSchema.virtual('rangePercent').get(function() {
  if (this.low === 0) return 0;
  return (this.range / this.low) * 100;
});

// Methods
marketDataSchema.methods.getOHLCData = function() {
  return {
    symbol: this.symbol,
    date: this.date,
    open: this.open,
    high: this.high,
    low: this.low,
    close: this.close,
    volume: this.volume,
    change: this.change,
    changePercent: this.changePercent
  };
};

marketDataSchema.methods.getCandlestickData = function() {
  return {
    x: this.date,
    y: [this.open, this.high, this.low, this.close]
  };
};

// Static methods
marketDataSchema.statics.getChartData = function(symbol, period = '1M', interval = 'daily') {
  const endDate = new Date();
  let startDate = new Date();
  
  switch (period) {
    case '1D':
      startDate.setDate(endDate.getDate() - 1);
      break;
    case '1W':
      startDate.setDate(endDate.getDate() - 7);
      break;
    case '1M':
      startDate.setMonth(endDate.getMonth() - 1);
      break;
    case '3M':
      startDate.setMonth(endDate.getMonth() - 3);
      break;
    case '6M':
      startDate.setMonth(endDate.getMonth() - 6);
      break;
    case '1Y':
      startDate.setFullYear(endDate.getFullYear() - 1);
      break;
    case '2Y':
      startDate.setFullYear(endDate.getFullYear() - 2);
      break;
    case '5Y':
      startDate.setFullYear(endDate.getFullYear() - 5);
      break;
  }
  
  return this.find({
    symbol: symbol.toUpperCase(),
    date: { $gte: startDate, $lte: endDate }
  }).sort({ date: 1 });
};

marketDataSchema.statics.getLatestPrice = function(symbol) {
  return this.findOne({ symbol: symbol.toUpperCase() })
    .sort({ date: -1 });
};

marketDataSchema.statics.getPriceHistory = function(symbol, days = 30) {
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));
  
  return this.find({
    symbol: symbol.toUpperCase(),
    date: { $gte: startDate, $lte: endDate }
  }).sort({ date: 1 });
};

marketDataSchema.statics.getVolumeAnalysis = async function(symbol, days = 30) {
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));
  
  const analysis = await this.aggregate([
    {
      $match: {
        symbol: symbol.toUpperCase(),
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: null,
        avgVolume: { $avg: '$volume' },
        maxVolume: { $max: '$volume' },
        minVolume: { $min: '$volume' },
        totalVolume: { $sum: '$volume' },
        count: { $sum: 1 }
      }
    }
  ]);
  
  return analysis[0] || null;
};

marketDataSchema.statics.getTechnicalIndicators = async function(symbol, period = 20) {
  const data = await this.find({ symbol: symbol.toUpperCase() })
    .sort({ date: -1 })
    .limit(period + 20); // Extra data for calculations
  
  if (data.length < period) return null;
  
  const prices = data.map(d => d.close).reverse();
  const volumes = data.map(d => d.volume).reverse();
  
  // Simple Moving Average
  const sma = prices.slice(-period).reduce((sum, price) => sum + price, 0) / period;
  
  // Volume Weighted Average Price (simplified)
  const totalValue = data.slice(-period).reduce((sum, d) => sum + (d.close * d.volume), 0);
  const totalVolume = volumes.slice(-period).reduce((sum, vol) => sum + vol, 0);
  const vwap = totalVolume > 0 ? totalValue / totalVolume : sma;
  
  // Relative Strength Index (simplified)
  let gains = 0, losses = 0;
  for (let i = 1; i < Math.min(period + 1, prices.length); i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) gains += change;
    else losses -= change;
  }
  const avgGain = gains / period;
  const avgLoss = losses / period;
  const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  const rsi = 100 - (100 / (1 + rs));
  
  return {
    symbol,
    sma: Math.round(sma * 100) / 100,
    vwap: Math.round(vwap * 100) / 100,
    rsi: Math.round(rsi * 100) / 100,
    period,
    calculatedAt: new Date()
  };
};

marketDataSchema.statics.getHighLow52Week = async function(symbol) {
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  
  const result = await this.aggregate([
    {
      $match: {
        symbol: symbol.toUpperCase(),
        date: { $gte: oneYearAgo }
      }
    },
    {
      $group: {
        _id: null,
        high52w: { $max: '$high' },
        low52w: { $min: '$low' },
        avgVolume: { $avg: '$volume' }
      }
    }
  ]);
  
  return result[0] || null;
};

module.exports = mongoose.model('MarketData', marketDataSchema);