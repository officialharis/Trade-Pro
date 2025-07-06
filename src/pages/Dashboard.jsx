import React from 'react';
import { TrendingUp, TrendingDown, Eye, Plus, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePortfolio } from '../contexts/PortfolioContext';
import { useWallet } from '../contexts/WalletContext';
import { stocksData, marketIndices } from '../data/stocksData';
import StockCard from '../components/StockCard';
import Wallet from '../components/Wallet';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { holdings, watchlist } = usePortfolio();
  const { wallet, formatCurrency } = useWallet();

  const portfolioValue = holdings.reduce((total, holding) => {
    const currentStock = stocksData.find(s => s.symbol === holding.symbol);
    return total + (currentStock ? currentStock.price * holding.quantity : 0);
  }, 0);

  const totalInvestment = holdings.reduce((total, holding) => {
    return total + (holding.avgPrice * holding.quantity);
  }, 0);

  const totalGain = portfolioValue - totalInvestment;
  const gainPercentage = totalInvestment > 0 ? (totalGain / totalInvestment) * 100 : 0;

  // Debug logging
  console.log('Dashboard P&L Debug:', {
    holdings: holdings.length,
    portfolioValue,
    totalInvestment,
    totalGain,
    gainPercentage
  });

  const topGainers = stocksData
    .filter(stock => stock.changePercent > 0)
    .sort((a, b) => b.changePercent - a.changePercent)
    .slice(0, 3);

  const topLosers = stocksData
    .filter(stock => stock.changePercent < 0)
    .sort((a, b) => a.changePercent - b.changePercent)
    .slice(0, 3);

  const handleStockClick = (symbol) => {
    navigate(`/stocks/${symbol}`);
  };

  const handlePortfolioClick = () => {
    navigate('/portfolio');
  };

  const handleWatchlistClick = () => {
    navigate('/watchlist');
  };

  const handleWalletClick = () => {
    navigate('/wallet');
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-groww-primary to-groww-secondary rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Good morning, {user?.name}! 👋</h1>
        <p className="text-groww-light">Here's what's happening with your investments today</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={handlePortfolioClick}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Portfolio Value</h3>
            <Eye className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">${portfolioValue.toLocaleString()}</p>
            <div className={`flex items-center space-x-1 text-sm ${totalGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalGain >= 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span>
                {totalGain >= 0 ? '+' : ''}${Math.abs(totalGain).toLocaleString()} ({totalGain >= 0 ? '+' : ''}{gainPercentage.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total P&L</h3>
            <TrendingUp className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          </div>
          <div className="space-y-1">
            <p className={`text-2xl font-bold ${totalGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalGain >= 0 ? '+' : ''}${Math.abs(totalGain).toFixed(2)}
            </p>
            <div className={`flex items-center space-x-1 text-sm ${totalGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalGain >= 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              <span>{totalGain >= 0 ? '+' : ''}{gainPercentage.toFixed(2)}%</span>
            </div>
          </div>
        </div>

        <div
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={handleWalletClick}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Available Balance</h3>
            <Plus className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {wallet.balance !== undefined ? formatCurrency(wallet.balance) : '$0.00'}
            </p>
            {/* Debug info */}
            <p className="text-xs text-gray-500">Debug: {wallet.balance}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Ready to invest</p>
          </div>
        </div>

        <div
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={handlePortfolioClick}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Holdings</h3>
            <ArrowUpRight className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{holdings.length}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Active positions</p>
          </div>
        </div>

        <div
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={handleWatchlistClick}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Watchlist</h3>
            <Eye className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{watchlist.length}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Stocks tracked</p>
          </div>
        </div>
      </div>

      {/* Market Indices */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Market Indices</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {marketIndices.map((index) => (
            <div key={index.name} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white">{index.name}</h3>
              <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                {index.value.toLocaleString()}
              </p>
              <div className={`flex items-center space-x-1 text-sm mt-1 ${
                index.changePercent >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {index.changePercent >= 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                <span>
                  {index.changePercent >= 0 ? '+' : ''}{index.change.toFixed(2)} ({index.changePercent >= 0 ? '+' : ''}{index.changePercent.toFixed(2)}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Gainers and Losers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Top Gainers</h2>
          <div className="space-y-3">
            {topGainers.map((stock) => (
              <div
                key={stock.symbol}
                className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg cursor-pointer hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                onClick={() => handleStockClick(stock.symbol)}
              >
                <div className="flex items-center space-x-3">
                  <img src={stock.logo} alt={stock.name} className="w-8 h-8 rounded" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{stock.symbol}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{stock.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white">${stock.price}</p>
                  <p className="text-sm text-green-600 dark:text-green-400">+{stock.changePercent.toFixed(2)}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Top Losers</h2>
          <div className="space-y-3">
            {topLosers.map((stock) => (
              <div
                key={stock.symbol}
                className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                onClick={() => handleStockClick(stock.symbol)}
              >
                <div className="flex items-center space-x-3">
                  <img src={stock.logo} alt={stock.name} className="w-8 h-8 rounded" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{stock.symbol}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{stock.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white">${stock.price}</p>
                  <p className="text-sm text-red-600 dark:text-red-400">{stock.changePercent.toFixed(2)}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Wallet Section */}
      <Wallet />
    </div>
  );
};

export default Dashboard;