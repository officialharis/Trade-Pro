import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getApiUrl } from '../config/api';

const PortfolioContext = createContext();

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
};

export const PortfolioProvider = ({ children }) => {
  const { user } = useAuth();
  const [holdings, setHoldings] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      // Fetch data from API
      fetchHoldings();
      fetchTransactions();

      // Load watchlist from localStorage (keeping this for now)
      const savedWatchlist = localStorage.getItem(`watchlist_${user.id}`);
      if (savedWatchlist) setWatchlist(JSON.parse(savedWatchlist));
    } else {
      // Clear data when user logs out
      setHoldings([]);
      setWatchlist([]);
      setTransactions([]);
    }
  }, [user]);

  const addToWatchlist = (stock) => {
    const newWatchlist = [...watchlist];
    if (!newWatchlist.find(item => item.symbol === stock.symbol)) {
      newWatchlist.push(stock);
      setWatchlist(newWatchlist);
      if (user) {
        localStorage.setItem(`watchlist_${user.id}`, JSON.stringify(newWatchlist));
      }
    }
  };

  const removeFromWatchlist = (symbol) => {
    const newWatchlist = watchlist.filter(item => item.symbol !== symbol);
    setWatchlist(newWatchlist);
    if (user) {
      localStorage.setItem(`watchlist_${user.id}`, JSON.stringify(newWatchlist));
    }
  };

  const buyStock = async (stock, quantity, price) => {
    if (!user?.token) return false;

    try {
      const response = await fetch(getApiUrl('/portfolio/buy'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          symbol: stock.symbol,
          name: stock.name,
          quantity: quantity,
          price: price
        })
      });

      if (response.ok) {
        const result = await response.json();

        // Refresh holdings and transactions
        await Promise.all([
          fetchHoldings(),
          fetchTransactions()
        ]);

        return { success: true, walletBalance: result.walletBalance };
      } else {
        const error = await response.json();
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Error buying stock:', error);
      throw error;
    }
  };

  const sellStock = async (symbol, quantity, price) => {
    if (!user?.token) return false;

    try {
      const response = await fetch(getApiUrl('/portfolio/sell'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          symbol: symbol,
          quantity: quantity,
          price: price
        })
      });

      if (response.ok) {
        const result = await response.json();

        // Refresh holdings and transactions
        await Promise.all([
          fetchHoldings(),
          fetchTransactions()
        ]);

        return { success: true, walletBalance: result.walletBalance };
      } else {
        const error = await response.json();
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Error selling stock:', error);
      throw error;
    }
  };

  // Fetch holdings from API
  const fetchHoldings = async () => {
    if (!user?.token) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(getApiUrl('/portfolio'), {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const holdingsData = await response.json();
        setHoldings(Array.isArray(holdingsData) ? holdingsData : []);
      } else {
        console.error('Failed to fetch holdings:', response.status);
        setHoldings([]); // Set empty array on error
      }
    } catch (error) {
      console.error('Error fetching holdings:', error);
      setError('Failed to load portfolio data');
      setHoldings([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Fetch transactions from API
  const fetchTransactions = async () => {
    if (!user?.token) return;

    try {
      const response = await fetch(getApiUrl('/transactions'), {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const transactionsData = await response.json();
        // Handle the API response format which includes pagination
        const transactions = transactionsData.transactions || transactionsData;
        setTransactions(Array.isArray(transactions) ? transactions : []);
      } else {
        console.error('Failed to fetch transactions:', response.status);
        setTransactions([]); // Set empty array on error
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setTransactions([]); // Set empty array on error
    }
  };

  const value = {
    holdings,
    watchlist,
    transactions,
    loading,
    error,
    addToWatchlist,
    removeFromWatchlist,
    buyStock,
    sellStock,
    refreshHoldings: fetchHoldings,
    refreshTransactions: fetchTransactions
  };

  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  );
};