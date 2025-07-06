const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get wallet balance and transactions
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('wallet');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      balance: user.wallet.balance,
      currency: user.wallet.currency,
      transactions: user.wallet.transactions.sort((a, b) => new Date(b.date) - new Date(a.date))
    });
  } catch (error) {
    console.error('Error fetching wallet:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add funds to wallet
router.post('/deposit', auth, async (req, res) => {
  try {
    const { amount, description = 'Wallet deposit' } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const user = await User.findById(req.user.id);
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

// Withdraw funds from wallet
router.post('/withdraw', auth, async (req, res) => {
  try {
    const { amount, description = 'Wallet withdrawal' } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const user = await User.findById(req.user.id);
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

// Process stock purchase (internal use)
router.post('/stock-purchase', auth, async (req, res) => {
  try {
    const { stockSymbol, quantity, pricePerShare, totalAmount } = req.body;

    if (!stockSymbol || !quantity || !pricePerShare || !totalAmount) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.wallet.balance < totalAmount) {
      return res.status(400).json({ message: 'Insufficient funds' });
    }

    // Deduct from balance
    user.wallet.balance -= totalAmount;

    // Add transaction record
    user.wallet.transactions.push({
      type: 'STOCK_PURCHASE',
      amount: -totalAmount,
      description: `Purchased ${quantity} shares of ${stockSymbol}`,
      stockSymbol: stockSymbol,
      quantity: quantity,
      pricePerShare: pricePerShare,
      date: new Date()
    });

    await user.save();

    res.json({
      message: 'Stock purchase processed',
      balance: user.wallet.balance,
      transaction: user.wallet.transactions[user.wallet.transactions.length - 1]
    });
  } catch (error) {
    console.error('Error processing stock purchase:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Process stock sale (internal use)
router.post('/stock-sale', auth, async (req, res) => {
  try {
    const { stockSymbol, quantity, pricePerShare, totalAmount } = req.body;

    if (!stockSymbol || !quantity || !pricePerShare || !totalAmount) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Add to balance
    user.wallet.balance += totalAmount;

    // Add transaction record
    user.wallet.transactions.push({
      type: 'STOCK_SALE',
      amount: totalAmount,
      description: `Sold ${quantity} shares of ${stockSymbol}`,
      stockSymbol: stockSymbol,
      quantity: quantity,
      pricePerShare: pricePerShare,
      date: new Date()
    });

    await user.save();

    res.json({
      message: 'Stock sale processed',
      balance: user.wallet.balance,
      transaction: user.wallet.transactions[user.wallet.transactions.length - 1]
    });
  } catch (error) {
    console.error('Error processing stock sale:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
