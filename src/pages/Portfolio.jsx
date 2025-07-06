import React from 'react';
import { TrendingUp, TrendingDown, ArrowUpRight, Calendar, Briefcase, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePortfolio } from '../contexts/PortfolioContext';
import { stocksData } from '../data/stocksData';

const Portfolio = () => {
  const navigate = useNavigate();
  const { holdings, transactions, loading, error } = usePortfolio();

  // Ensure arrays are properly initialized
  const safeHoldings = Array.isArray(holdings) ? holdings : [];
  const safeTransactions = Array.isArray(transactions) ? transactions : [];

  const portfolioValue = safeHoldings.reduce((total, holding) => {
    const currentStock = stocksData.find(s => s.symbol === holding.symbol);
    return total + (currentStock ? currentStock.price * holding.quantity : 0);
  }, 0);

  const totalInvestment = safeHoldings.reduce((total, holding) => {
    return total + (holding.avgPrice * holding.quantity);
  }, 0);

  const totalGain = portfolioValue - totalInvestment;
  const gainPercentage = totalInvestment > 0 ? (totalGain / totalInvestment) * 100 : 0;

  const holdingsWithCurrentPrice = safeHoldings.map(holding => {
    const currentStock = stocksData.find(s => s.symbol === holding.symbol);
    const currentValue = currentStock ? currentStock.price * holding.quantity : 0;
    const investedValue = holding.avgPrice * holding.quantity;
    const pnl = currentValue - investedValue;
    const pnlPercentage = investedValue > 0 ? (pnl / investedValue) * 100 : 0;

    return {
      ...holding,
      currentPrice: currentStock?.price || 0,
      currentValue,
      investedValue,
      pnl,
      pnlPercentage,
      logo: currentStock?.logo
    };
  });

  const handleHoldingClick = (symbol) => {
    navigate(`/stocks/${symbol}`);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Portfolio</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Track your investments and performance</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-groww-primary"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading portfolio...</span>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Portfolio</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Track your investments and performance</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
          <h3 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">Error Loading Portfolio</h3>
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Portfolio</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Track your investments and performance</p>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Total Portfolio Value</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">${portfolioValue.toLocaleString()}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Total Investment</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">${totalInvestment.toLocaleString()}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Total P&L</h3>
          <div className="flex items-center space-x-2">
            <p className={`text-3xl font-bold ${totalGain >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {totalGain >= 0 ? '+' : ''}${Math.abs(totalGain).toLocaleString()}
            </p>
            {totalGain >= 0 ? (
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            ) : (
              <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
            )}
          </div>
          <p className={`text-sm ${totalGain >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {totalGain >= 0 ? '+' : ''}{gainPercentage.toFixed(2)}%
          </p>
        </div>
      </div>

      {/* Holdings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Your Holdings</h2>
        </div>

        {holdingsWithCurrentPrice.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Avg Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Current Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Current Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    P&L
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {holdingsWithCurrentPrice.map((holding) => (
                  <tr
                    key={holding.symbol}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                    onClick={() => handleHoldingClick(holding.symbol)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <img
                          src={holding.logo}
                          alt={holding.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{holding.symbol}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{holding.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {holding.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      ${holding.avgPrice.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      ${holding.currentPrice.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      ${holding.currentValue.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${holding.pnl >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {holding.pnl >= 0 ? '+' : ''}${Math.abs(holding.pnl).toFixed(2)}
                        <br />
                        <span className="text-xs">
                          ({holding.pnl >= 0 ? '+' : ''}{holding.pnlPercentage.toFixed(2)}%)
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <Briefcase className="w-10 h-10 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">No holdings yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Start your investment journey by purchasing stocks. Your portfolio will appear here once you make your first trade.
            </p>
            <button
              onClick={() => navigate('/stocks')}
              className="inline-flex items-center px-6 py-3 bg-groww-primary hover:bg-groww-primary/90 text-white font-semibold rounded-lg transition-colors"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Browse Stocks
            </button>
          </div>
        )}
      </div>

      {/* Recent Transactions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Transactions</h2>
        </div>

        {safeTransactions.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {safeTransactions.slice(0, 10).map((transaction) => (
              <div key={transaction._id || transaction.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      transaction.type === 'BUY' ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'
                    }`}>
                      {transaction.type === 'BUY' ? (
                        <TrendingUp className={`w-5 h-5 text-green-600 dark:text-green-400`} />
                      ) : (
                        <TrendingDown className={`w-5 h-5 text-red-600 dark:text-red-400`} />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {transaction.type} {transaction.symbol}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {transaction.quantity} shares at ${transaction.price}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      ${transaction.total.toLocaleString()}
                    </p>
                    <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(transaction.executedAt || transaction.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <ArrowUpRight className="w-10 h-10 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">No transactions yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Your trading history will appear here once you start buying and selling stocks.
            </p>
            <button
              onClick={() => navigate('/stocks')}
              className="inline-flex items-center px-6 py-3 bg-groww-primary hover:bg-groww-primary/90 text-white font-semibold rounded-lg transition-colors"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Start Trading
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Portfolio;