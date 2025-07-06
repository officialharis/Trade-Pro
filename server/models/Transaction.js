import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['BUY', 'SELL', 'DIVIDEND', 'BONUS', 'SPLIT'], 
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
  price: { 
    type: Number, 
    required: true,
    min: 0
  },
  total: { 
    type: Number, 
    required: true 
  },
  fees: {
    brokerage: { type: Number, default: 0 },
    stt: { type: Number, default: 0 },
    exchangeCharges: { type: Number, default: 0 },
    gst: { type: Number, default: 0 },
    stampDuty: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  },
  status: { 
    type: String, 
    enum: ['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'], 
    default: 'COMPLETED' 
  },
  orderType: {
    type: String,
    enum: ['MARKET', 'LIMIT', 'SL', 'SL-M'],
    default: 'MARKET'
  },
  exchange: {
    type: String,
    enum: ['NSE', 'BSE'],
    default: 'NSE'
  },
  orderId: {
    type: String,
    unique: true,
    default: function() {
      return 'ORD' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
    }
  },
  executedAt: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    maxlength: 500
  },
  tags: [{
    type: String,
    trim: true
  }]
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ symbol: 1 });
transactionSchema.index({ type: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ orderId: 1 }, { unique: true });
transactionSchema.index({ executedAt: -1 });

// Virtual for net amount (total + fees for BUY, total - fees for SELL)
transactionSchema.virtual('netAmount').get(function() {
  if (this.type === 'BUY') {
    return this.total + (this.fees.total || 0);
  } else {
    return this.total - (this.fees.total || 0);
  }
});

// Virtual for transaction direction
transactionSchema.virtual('direction').get(function() {
  return ['BUY', 'DIVIDEND', 'BONUS'].includes(this.type) ? 'credit' : 'debit';
});

// Methods
transactionSchema.methods.calculateFees = function() {
  const total = this.total;
  const isBuy = this.type === 'BUY';
  
  // Simplified fee calculation (actual fees vary by broker)
  const brokerage = Math.min(total * 0.0003, 20); // 0.03% or ₹20, whichever is lower
  const stt = isBuy ? 0 : total * 0.001; // 0.1% on sell side
  const exchangeCharges = total * 0.0000345; // 0.00345%
  const gst = (brokerage + exchangeCharges) * 0.18; // 18% GST
  const stampDuty = isBuy ? total * 0.00003 : 0; // 0.003% on buy side
  
  this.fees = {
    brokerage: Math.round(brokerage * 100) / 100,
    stt: Math.round(stt * 100) / 100,
    exchangeCharges: Math.round(exchangeCharges * 100) / 100,
    gst: Math.round(gst * 100) / 100,
    stampDuty: Math.round(stampDuty * 100) / 100,
    total: Math.round((brokerage + stt + exchangeCharges + gst + stampDuty) * 100) / 100
  };
  
  return this.fees;
};

transactionSchema.methods.getTransactionSummary = function() {
  return {
    orderId: this.orderId,
    type: this.type,
    symbol: this.symbol,
    name: this.name,
    quantity: this.quantity,
    price: this.price,
    total: this.total,
    fees: this.fees.total,
    netAmount: this.netAmount,
    status: this.status,
    executedAt: this.executedAt
  };
};

// Static methods
transactionSchema.statics.getUserTransactions = function(userId, options = {}) {
  const { 
    limit = 50, 
    page = 1, 
    type, 
    symbol, 
    status = 'COMPLETED',
    startDate,
    endDate 
  } = options;
  
  const skip = (page - 1) * limit;
  let query = { userId };
  
  if (type) query.type = type;
  if (symbol) query.symbol = symbol.toUpperCase();
  if (status) query.status = status;
  
  if (startDate || endDate) {
    query.executedAt = {};
    if (startDate) query.executedAt.$gte = new Date(startDate);
    if (endDate) query.executedAt.$lte = new Date(endDate);
  }
  
  return this.find(query)
    .sort({ executedAt: -1 })
    .skip(skip)
    .limit(limit);
};

transactionSchema.statics.getTransactionStats = async function(userId, period = '1M') {
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
    case '1Y':
      startDate.setFullYear(endDate.getFullYear() - 1);
      break;
  }
  
  const stats = await this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        status: 'COMPLETED',
        executedAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        totalAmount: { $sum: '$total' },
        totalFees: { $sum: '$fees.total' }
      }
    }
  ]);
  
  return stats;
};

transactionSchema.statics.getMonthlyTransactionVolume = async function(userId, year = new Date().getFullYear()) {
  const stats = await this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        status: 'COMPLETED',
        executedAt: {
          $gte: new Date(year, 0, 1),
          $lt: new Date(year + 1, 0, 1)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$executedAt' },
        buyVolume: {
          $sum: {
            $cond: [{ $eq: ['$type', 'BUY'] }, '$total', 0]
          }
        },
        sellVolume: {
          $sum: {
            $cond: [{ $eq: ['$type', 'SELL'] }, '$total', 0]
          }
        },
        totalTransactions: { $sum: 1 }
      }
    },
    { $sort: { '_id': 1 } }
  ]);
  
  return stats;
};

export default mongoose.model('Transaction', transactionSchema);