const mongoose = require('mongoose');

const watchlistSchema = new mongoose.Schema({
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
  addedDate: { 
    type: Date, 
    default: Date.now 
  },
  notes: {
    type: String,
    maxlength: 500
  },
  targetPrice: {
    type: Number,
    min: 0
  },
  alertPrice: {
    type: Number,
    min: 0
  },
  tags: [{
    type: String,
    trim: true
  }],
  priority: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH'],
    default: 'MEDIUM'
  },
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
watchlistSchema.index({ userId: 1, symbol: 1 }, { unique: true });
watchlistSchema.index({ userId: 1 });
watchlistSchema.index({ symbol: 1 });
watchlistSchema.index({ addedDate: -1 });
watchlistSchema.index({ priority: 1 });

// Virtual for days since added
watchlistSchema.virtual('daysSinceAdded').get(function() {
  const diffTime = Math.abs(new Date() - this.addedDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Methods
watchlistSchema.methods.updateTargetPrice = function(targetPrice) {
  this.targetPrice = targetPrice;
  return this.save();
};

watchlistSchema.methods.updateAlertPrice = function(alertPrice) {
  this.alertPrice = alertPrice;
  return this.save();
};

watchlistSchema.methods.addNote = function(note) {
  this.notes = note;
  return this.save();
};

watchlistSchema.methods.addTag = function(tag) {
  if (!this.tags.includes(tag)) {
    this.tags.push(tag);
    return this.save();
  }
  return this;
};

watchlistSchema.methods.removeTag = function(tag) {
  this.tags = this.tags.filter(t => t !== tag);
  return this.save();
};

watchlistSchema.methods.setPriority = function(priority) {
  this.priority = priority;
  return this.save();
};

// Static methods
watchlistSchema.statics.getUserWatchlist = function(userId, options = {}) {
  const { sortBy = 'addedDate', order = -1, priority, tags } = options;
  
  let query = { userId, isActive: true };
  
  if (priority) {
    query.priority = priority;
  }
  
  if (tags && tags.length > 0) {
    query.tags = { $in: tags };
  }
  
  const sortOptions = {};
  sortOptions[sortBy] = order;
  
  return this.find(query).sort(sortOptions);
};

watchlistSchema.statics.getWatchlistWithPrices = async function(userId, stockPrices = {}) {
  const watchlist = await this.find({ userId, isActive: true });
  
  return watchlist.map(item => {
    const currentPrice = stockPrices[item.symbol];
    const targetReached = item.targetPrice && currentPrice && currentPrice >= item.targetPrice;
    const alertTriggered = item.alertPrice && currentPrice && 
      (currentPrice <= item.alertPrice || currentPrice >= item.alertPrice);
    
    return {
      ...item.toObject(),
      currentPrice,
      targetReached,
      alertTriggered,
      priceChange: currentPrice && item.targetPrice ? 
        ((currentPrice - item.targetPrice) / item.targetPrice * 100) : null
    };
  });
};

watchlistSchema.statics.getWatchlistStats = async function(userId) {
  const stats = await this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId), isActive: true } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        highPriority: {
          $sum: { $cond: [{ $eq: ['$priority', 'HIGH'] }, 1, 0] }
        },
        mediumPriority: {
          $sum: { $cond: [{ $eq: ['$priority', 'MEDIUM'] }, 1, 0] }
        },
        lowPriority: {
          $sum: { $cond: [{ $eq: ['$priority', 'LOW'] }, 1, 0] }
        },
        withTargetPrice: {
          $sum: { $cond: [{ $ne: ['$targetPrice', null] }, 1, 0] }
        },
        withAlertPrice: {
          $sum: { $cond: [{ $ne: ['$alertPrice', null] }, 1, 0] }
        }
      }
    }
  ]);
  
  return stats[0] || {
    total: 0,
    highPriority: 0,
    mediumPriority: 0,
    lowPriority: 0,
    withTargetPrice: 0,
    withAlertPrice: 0
  };
};

watchlistSchema.statics.getPopularStocks = async function(limit = 10) {
  const popular = await this.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: '$symbol',
        name: { $first: '$name' },
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } },
    { $limit: limit }
  ]);
  
  return popular;
};

module.exports = mongoose.model('Watchlist', watchlistSchema);