const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  symbol: { 
    type: String, 
    required: true,
    uppercase: true,
    trim: true
  },
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  quantity: { 
    type: Number, 
    required: true,
    min: 0
  },
  avgPrice: { 
    type: Number, 
    required: true,
    min: 0
  },
  purchaseDate: { 
    type: Date, 
    default: Date.now 
  },
  totalInvested: {
    type: Number,
    default: function() {
      return this.quantity * this.avgPrice;
    }
  },
  notes: {
    type: String,
    maxlength: 500
  },
  tags: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
portfolioSchema.index({ userId: 1, symbol: 1 }, { unique: true });
portfolioSchema.index({ userId: 1 });
portfolioSchema.index({ symbol: 1 });
portfolioSchema.index({ createdAt: -1 });

// Virtual for current value (requires current stock price)
portfolioSchema.virtual('currentValue').get(function() {
  // This would be populated when fetching with current stock price
  return this._currentValue || 0;
});

// Virtual for P&L
portfolioSchema.virtual('pnl').get(function() {
  return this.currentValue - this.totalInvested;
});

// Virtual for P&L percentage
portfolioSchema.virtual('pnlPercentage').get(function() {
  if (this.totalInvested === 0) return 0;
  return (this.pnl / this.totalInvested) * 100;
});

// Methods
portfolioSchema.methods.updateHolding = function(quantity, price, type = 'BUY') {
  if (type === 'BUY') {
    const totalCost = quantity * price;
    const newTotalQuantity = this.quantity + quantity;
    const newAvgPrice = ((this.avgPrice * this.quantity) + totalCost) / newTotalQuantity;
    
    this.quantity = newTotalQuantity;
    this.avgPrice = newAvgPrice;
    this.totalInvested = newTotalQuantity * newAvgPrice;
  } else if (type === 'SELL') {
    if (quantity > this.quantity) {
      throw new Error('Cannot sell more shares than owned');
    }
    
    this.quantity -= quantity;
    this.totalInvested = this.quantity * this.avgPrice;
    
    if (this.quantity === 0) {
      this.isActive = false;
    }
  }
  
  return this.save();
};

portfolioSchema.methods.calculateMetrics = function(currentPrice) {
  const currentValue = this.quantity * currentPrice;
  const pnl = currentValue - this.totalInvested;
  const pnlPercentage = this.totalInvested > 0 ? (pnl / this.totalInvested) * 100 : 0;
  
  return {
    symbol: this.symbol,
    name: this.name,
    quantity: this.quantity,
    avgPrice: this.avgPrice,
    currentPrice,
    totalInvested: this.totalInvested,
    currentValue,
    pnl,
    pnlPercentage,
    purchaseDate: this.purchaseDate
  };
};

// Static methods
portfolioSchema.statics.getUserPortfolio = function(userId) {
  return this.find({ userId, isActive: true, quantity: { $gt: 0 } })
    .sort({ createdAt: -1 });
};

portfolioSchema.statics.getPortfolioValue = async function(userId, stockPrices = {}) {
  const holdings = await this.find({ userId, isActive: true, quantity: { $gt: 0 } });
  
  let totalInvested = 0;
  let currentValue = 0;
  
  holdings.forEach(holding => {
    totalInvested += holding.totalInvested;
    const currentPrice = stockPrices[holding.symbol] || holding.avgPrice;
    currentValue += holding.quantity * currentPrice;
  });
  
  const totalPnl = currentValue - totalInvested;
  const totalPnlPercentage = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;
  
  return {
    totalInvested,
    currentValue,
    totalPnl,
    totalPnlPercentage,
    holdingsCount: holdings.length
  };
};

portfolioSchema.statics.getTopHoldings = function(userId, limit = 5) {
  return this.find({ userId, isActive: true, quantity: { $gt: 0 } })
    .sort({ totalInvested: -1 })
    .limit(limit);
};

module.exports = mongoose.model('Portfolio', portfolioSchema);