import React from 'react';
import { TrendingUp, TrendingDown, Plus, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePortfolio } from '../contexts/PortfolioContext';

const StockCard = ({ stock, showWatchlistButton = true }) => {
  const navigate = useNavigate();
  const { addToWatchlist, watchlist } = usePortfolio();
  
  const isPositive = stock.change >= 0;
  const isInWatchlist = watchlist.some(item => item.symbol === stock.symbol);

  const handleStockClick = () => {
    navigate(`/stocks/${stock.symbol}`);
  };

  const handleWatchlistClick = (e) => {
    e.stopPropagation();
    if (!isInWatchlist) {
      addToWatchlist(stock);
    }
  };

  return (
    <div
      onClick={handleStockClick}
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg dark:hover:shadow-gray-900/20 transition-all duration-200 cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <img
            src={stock.logo}
            alt={stock.name}
            className="w-12 h-12 rounded-lg object-cover"
          />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-groww-primary dark:group-hover:text-groww-secondary transition-colors">
              {stock.symbol}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{stock.name}</p>
          </div>
        </div>

        {showWatchlistButton && (
          <button
            onClick={handleWatchlistClick}
            className={`p-2 rounded-lg transition-colors ${
              isInWatchlist
                ? 'bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400'
                : 'bg-gray-50 dark:bg-gray-700 text-gray-400 dark:text-gray-500 hover:bg-groww-light dark:hover:bg-groww-primary/20 hover:text-groww-primary dark:hover:text-groww-secondary'
            }`}
          >
            <Heart className={`w-4 h-4 ${isInWatchlist ? 'fill-current' : ''}`} />
          </button>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">${stock.price.toLocaleString()}</p>
            <div className={`flex items-center space-x-1 ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {isPositive ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">
                {isPositive ? '+' : ''}${Math.abs(stock.change).toFixed(2)} ({isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>MCap: ${stock.marketCap}B</span>
          <span>P/E: {stock.pe}</span>
        </div>
      </div>
    </div>
  );
};

export default StockCard;