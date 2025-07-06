const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  symbol: { 
    type: String, 
    required: true, 
    unique: true,
    uppercase: true,
    trim: true
  },
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  price: { 
    type: Number, 
    required: true,
    min: 0
  },
  change: { 
    type: Number, 
    required: true 
  },
  changePercent: { 
    type: Number, 
    required: true 
  },
  marketCap: { 
    type: String, 
    required: true 
  },
  sector: { 
    type: String, 
    required: true,
    trim: true
  },
  pe: { 
    type: Number, 
    required: true,
    min: 0
  },
  logo: { 
    type: String, 
    required: true 
  },
  volume: { 
    type: Number, 
    default: 0,
    min: 0
  },
  high52w: {
    type: Number,
    min: 0
  },
  low52w: {
    type: Number,
    min: 0
  },
  dividend: {
    type: Number,
    min: 0,
    default: 0
  },
  eps: {
    type: Number,
    default: 0
  },
  bookValue: {
    type: Number,
    min: 0
  },
  beta: {
    type: Number,
    default: 1
  },
  faceValue: {
    type: Number,
    min: 0,
    default: 10
  },
  industry: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    maxlength: 1000
  },
  website: {
    type: String,
    trim: true
  },
  ceo: {
    type: String,
    trim: true
  },
  employees: {
    type: Number,
    min: 0
  },
  founded: {
    type: Number,
    min: 1800
  },
  headquarters: {
    type: String,
    trim: true
  },
  exchange: {
    type: String,
    enum: ['NSE', 'BSE', 'BOTH'],
    default: 'NSE'
  },
  isin: {
    type: String,
    trim: true,
    uppercase: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
stockSchema.index({ symbol: 1 });
stockSchema.index({ sector: 1 });
stockSchema.index({ name: 'text', symbol: 'text' });
stockSchema.index({ changePercent: -1 });
stockSchema.index({ volume: -1 });
stockSchema.index({ marketCap: -1 });

// Virtual for market cap in numbers
stockSchema.virtual('marketCapNumber').get(function() {
  if (!this.marketCap) return 0;
  const value = parseFloat(this.marketCap.replace(/,/g, ''));
  return value * 10000000; // Convert crores to actual number
});

// Virtual for price change direction
stockSchema.virtual('priceDirection').get(function() {
  return this.change >= 0 ? 'up' : 'down';
});

// Methods
stockSchema.methods.updatePrice = function(newPrice) {
  const oldPrice = this.price;
  const change = newPrice - oldPrice;
  const changePercent = (change / oldPrice) * 100;
  
  this.price = newPrice;
  this.change = change;
  this.changePercent = changePercent;
  this.lastUpdated = new Date();
  
  return this.save();
};

stockSchema.methods.getPerformanceMetrics = function() {
  return {
    symbol: this.symbol,
    name: this.name,
    currentPrice: this.price,
    change: this.change,
    changePercent: this.changePercent,
    volume: this.volume,
    marketCap: this.marketCapNumber,
    pe: this.pe,
    dividend: this.dividend,
    eps: this.eps,
    beta: this.beta
  };
};

// Static methods
stockSchema.statics.getTopGainers = function(limit = 10) {
  return this.find({ changePercent: { $gt: 0 } })
    .sort({ changePercent: -1 })
    .limit(limit);
};

stockSchema.statics.getTopLosers = function(limit = 10) {
  return this.find({ changePercent: { $lt: 0 } })
    .sort({ changePercent: 1 })
    .limit(limit);
};

stockSchema.statics.getMostActive = function(limit = 10) {
  return this.find({})
    .sort({ volume: -1 })
    .limit(limit);
};

stockSchema.statics.searchStocks = function(query, limit = 20) {
  return this.find({
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { symbol: { $regex: query, $options: 'i' } }
    ],
    isActive: true
  }).limit(limit);
};

module.exports = mongoose.model('Stock', stockSchema);