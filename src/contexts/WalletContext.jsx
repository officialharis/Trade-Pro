import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getApiUrl } from '../config/api';

const WalletContext = createContext();

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

export const WalletProvider = ({ children }) => {
  const { user } = useAuth();
  const [wallet, setWallet] = useState({
    balance: 0,
    currency: 'USD',
    transactions: [],
    lastUpdated: null
  });
  const [loading, setLoading] = useState(false);

  // Fetch wallet data
  const fetchWallet = async (forceRefresh = false) => {
    if (!user?.token) return;

    try {
      setLoading(true);
      // Add cache busting parameter for force refresh
      const url = forceRefresh
        ? `${getApiUrl('/wallet')}?t=${Date.now()}`
        : getApiUrl('/wallet');

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const walletData = await response.json();
        console.log('Fetched wallet data:', walletData); // Debug log
        console.log('Setting wallet state with:', walletData); // Debug log
        setWallet({
          balance: walletData.balance,
          currency: walletData.currency,
          transactions: walletData.transactions || [],
          lastUpdated: new Date().toISOString()
        });

        // If wallet balance is 0 or undefined, try to initialize it
        if (walletData.balance === 0 || walletData.balance === undefined) {
          console.log('Wallet balance is 0 or undefined, initializing...'); // Debug log
          await initializeWallet();
        }
      } else {
        console.error('Failed to fetch wallet:', response.status, response.statusText);
        // Try to initialize wallet
        await initializeWallet();
      }
    } catch (error) {
      console.error('Error fetching wallet:', error);
      // Try to initialize wallet
      await initializeWallet();
    } finally {
      setLoading(false);
    }
  };

  // Initialize wallet for existing users
  const initializeWallet = async () => {
    if (!user?.token) return;

    try {
      const response = await fetch(getApiUrl('/wallet/initialize'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const walletData = await response.json();
        console.log('Wallet initialized with data:', walletData); // Debug log
        setWallet(prev => ({
          ...prev,
          balance: walletData.balance,
          currency: walletData.currency,
          transactions: walletData.transactions || [],
          lastUpdated: new Date().toISOString()
        }));
      } else {
        // Fallback to default wallet
        console.log('Wallet initialization failed, using default'); // Debug log
        setWallet(prev => ({
          ...prev,
          balance: 1000,
          currency: 'USD',
          transactions: []
        }));
      }
    } catch (error) {
      console.error('Error initializing wallet:', error);
      // Fallback to default wallet
      setWallet({
        balance: 1000,
        currency: 'USD',
        transactions: []
      });
    }
  };

  // Deposit funds (traditional method)
  const deposit = async (amount, description = 'Wallet deposit') => {
    if (!user?.token) return false;

    try {
      const response = await fetch(getApiUrl('/wallet/deposit'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount, description })
      });

      if (response.ok) {
        const result = await response.json();
        setWallet(prev => ({
          ...prev,
          balance: result.balance,
          transactions: [result.transaction, ...prev.transactions]
        }));
        return true;
      } else {
        const error = await response.json();
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Error depositing funds:', error);
      throw error;
    }
  };

  // Create Razorpay order
  const createRazorpayOrder = async (amount) => {
    if (!user?.token) return null;

    try {
      const response = await fetch(getApiUrl('/payment/create-order'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount })
      });

      if (response.ok) {
        const result = await response.json();
        return result;
      } else {
        const error = await response.json();
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      throw error;
    }
  };

  // Verify Razorpay payment
  const verifyRazorpayPayment = async (paymentData) => {
    if (!user?.token) return false;

    try {
      const response = await fetch(getApiUrl('/payment/verify'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentData)
      });

      if (response.ok) {
        const result = await response.json();
        setWallet(prev => ({
          ...prev,
          balance: result.balance,
          transactions: [result.transaction, ...prev.transactions]
        }));
        return result;
      } else {
        const error = await response.json();
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  };

  // Withdraw funds
  const withdraw = async (amount, description = 'Wallet withdrawal') => {
    if (!user?.token) return false;

    try {
      const response = await fetch(getApiUrl('/wallet/withdraw'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount, description })
      });

      if (response.ok) {
        const result = await response.json();
        setWallet(prev => ({
          ...prev,
          balance: result.balance,
          transactions: [result.transaction, ...prev.transactions]
        }));
        return true;
      } else {
        const error = await response.json();
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Error withdrawing funds:', error);
      throw error;
    }
  };

  // Update wallet balance after stock transactions
  const updateBalance = (newBalance, transaction) => {
    setWallet(prev => ({
      ...prev,
      balance: newBalance,
      transactions: transaction ? [transaction, ...prev.transactions] : prev.transactions
    }));
  };

  // Update balance from external source (like after stock purchase)
  const updateBalanceFromTransaction = (newBalance) => {
    console.log('Updating wallet balance from transaction:', newBalance); // Debug log
    setWallet(prev => {
      console.log('Previous wallet balance:', prev.balance); // Debug log
      return {
        ...prev,
        balance: newBalance
      };
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: wallet.currency
    }).format(amount);
  };

  useEffect(() => {
    if (user) {
      fetchWallet();
    } else {
      setWallet({
        balance: 0,
        currency: 'USD',
        transactions: []
      });
    }
  }, [user]);

  const value = {
    wallet,
    loading,
    deposit,
    withdraw,
    updateBalance,
    updateBalanceFromTransaction,
    formatCurrency,
    refreshWallet: fetchWallet,
    createRazorpayOrder,
    verifyRazorpayPayment
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};
