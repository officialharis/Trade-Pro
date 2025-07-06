import React from 'react';
import { Heart, Trash2 } from 'lucide-react';
import { usePortfolio } from '../contexts/PortfolioContext';
import StockCard from '../components/StockCard';

const Watchlist = () => {
  const { watchlist, removeFromWatchlist } = usePortfolio();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Watchlist</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Keep track of stocks you're interested in</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <Heart className="w-4 h-4 text-red-500 dark:text-red-400 fill-current" />
          <span>{watchlist.length} stocks</span>
        </div>
      </div>

      {/* Watchlist Items */}
      {watchlist.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {watchlist.map((stock) => (
            <div key={stock.symbol} className="relative">
              <StockCard stock={stock} showWatchlistButton={false} />
              <button
                onClick={() => removeFromWatchlist(stock.symbol)}
                className="absolute top-4 right-4 p-2 bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                title="Remove from watchlist"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-10 h-10 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Your watchlist is empty</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Add stocks to your watchlist to keep track of companies you're interested in
          </p>
          <a
            href="/stocks"
            className="inline-flex items-center px-6 py-3 bg-groww-primary text-white rounded-lg font-semibold hover:bg-groww-dark transition-colors"
          >
            Browse Stocks
          </a>
        </div>
      )}
    </div>
  );
};

export default Watchlist;