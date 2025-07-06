import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 100
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  password: { 
    type: String, 
    required: true,
    minlength: 6
  },
  wallet: {
    balance: {
      type: Number,
      default: 1000, // $1000 USD for new accounts
      min: 0
    },
    currency: {
      type: String,
      default: 'USD'
    },
    transactions: [{
      type: {
        type: String,
        enum: ['DEPOSIT', 'WITHDRAWAL', 'STOCK_PURCHASE', 'STOCK_SALE', 'DIVIDEND'],
        required: true
      },
      amount: {
        type: Number,
        required: true
      },
      description: {
        type: String,
        required: true
      },
      date: {
        type: Date,
        default: Date.now
      },
      stockSymbol: String, // For stock-related transactions
      quantity: Number,    // For stock-related transactions
      pricePerShare: Number // For stock-related transactions
    }]
  },
  joinedDate: { 
    type: Date, 
    default: Date.now 
  },
  isVerified: { 
    type: Boolean, 
    default: true 
  },
  profile: {
    phone: {
      type: String,
      trim: true
    },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: 'India' }
    },
    panCard: {
      type: String,
      uppercase: true,
      trim: true
    },
    bankAccount: {
      accountNumber: String,
      ifscCode: String,
      bankName: String,
      accountType: { type: String, enum: ['Savings', 'Current'] }
    },
    kycStatus: {
      type: String,
      enum: ['PENDING', 'VERIFIED', 'REJECTED'],
      default: 'PENDING'
    },
    riskProfile: {
      type: String,
      enum: ['CONSERVATIVE', 'MODERATE', 'AGGRESSIVE'],
      default: 'MODERATE'
    }
  },
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true }
    },
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light'
    },
    language: {
      type: String,
      default: 'en'
    }
  },
  lastLogin: Date,
  loginAttempts: { type: Number, default: 0 },
  lockUntil: Date
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });

// Virtual for account lock status
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Methods
userSchema.methods.toSafeObject = function() {
  const user = this.toObject();
  delete user.password;
  delete user.loginAttempts;
  delete user.lockUntil;
  return user;
};

userSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }
  
  return this.updateOne(updates);
};

userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

// Pre-save middleware
userSchema.pre('save', async function(next) {
  // Hash password if modified
  if (this.isModified('password')) {
    try {
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
      return next(error);
    }
  }

  // Initialize wallet if it doesn't exist (for existing users)
  if (!this.wallet) {
    this.wallet = {
      balance: 1000, // $1000 USD for new accounts
      currency: 'USD',
      transactions: []
    };
  }

  // Migrate old balance field to wallet (for existing users)
  if (this.balance !== undefined && this.wallet.balance === 1000) {
    this.wallet.balance = this.balance;
    this.balance = undefined; // Remove old field
  }

  next();
});

export default mongoose.model('User', userSchema);