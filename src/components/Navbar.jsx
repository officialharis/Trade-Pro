import React, { useState, useEffect } from 'react';
import { Search, Bell, User, LogOut, Moon, Sun, Wallet, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useWallet } from '../contexts/WalletContext';
import { useNavigate } from 'react-router-dom';
import { stocksData } from '../data/stocksData';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const { wallet, formatCurrency, loading } = useWallet();
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleWalletClick = () => {
    navigate('/wallet');
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setSelectedIndex(-1); // Reset selection when search changes

    if (query.trim() === '') {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const results = stocksData.filter(stock =>
      stock.name.toLowerCase().includes(query.toLowerCase()) ||
      stock.symbol.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5); // Limit to 5 results

    setSearchResults(results);
    setShowSearchResults(true);
  };

  const handleSearchSelect = (stock) => {
    navigate(`/stocks/${stock.symbol}`);
    setSearchQuery('');
    setShowSearchResults(false);
  };

  const handleSearchKeyDown = (e) => {
    if (!showSearchResults || searchResults.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < searchResults.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev > 0 ? prev - 1 : searchResults.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSearchSelect(searchResults[selectedIndex]);
        } else if (searchResults.length > 0) {
          handleSearchSelect(searchResults[0]);
        }
        break;
      case 'Escape':
        setShowSearchResults(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.search-container')) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 z-50">
      <div className="px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-groww-primary to-groww-secondary rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-groww-primary to-groww-secondary bg-clip-text text-transparent">
                TradePro
              </span>
            </button>
            
            <div className="relative w-96 search-container">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
              <input
                type="text"
                placeholder="Search stocks, companies..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-groww-primary focus:border-transparent"
              />

              {/* Search Results Dropdown */}
              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                  {searchResults.map((stock, index) => (
                    <button
                      key={stock.symbol}
                      onClick={() => handleSearchSelect(stock)}
                      className={`w-full px-4 py-3 text-left border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors ${
                        index === selectedIndex
                          ? 'bg-groww-light dark:bg-groww-primary/20 text-groww-primary dark:text-groww-secondary'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={stock.logo}
                          alt={stock.name}
                          className="w-8 h-8 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 dark:text-white">{stock.symbol}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{stock.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900 dark:text-white">${stock.price}</p>
                          <p className={`text-sm ${stock.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* No Results Message */}
              {showSearchResults && searchResults.length === 0 && searchQuery.trim() !== '' && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50 p-4">
                  <p className="text-gray-500 dark:text-gray-400 text-center">No stocks found for "{searchQuery}"</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
            </button>

            <button
              onClick={toggleTheme}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            {/* Wallet Balance */}
            <button
              onClick={handleWalletClick}
              className="flex items-center space-x-2 px-3 py-2 bg-groww-light dark:bg-groww-primary/20 text-groww-primary dark:text-groww-secondary rounded-lg hover:bg-groww-primary/10 dark:hover:bg-groww-primary/30 transition-colors"
              title="View Wallet"
            >
              <Wallet className="w-4 h-4" />
              <span className="text-sm font-semibold">
                {loading ? (
                  <span className="animate-pulse">Loading...</span>
                ) : (
                  wallet.balance !== undefined ? formatCurrency(wallet.balance) : '$0.00'
                )}
              </span>
            </button>
            
            <div className="relative">
              <button
                onClick={() => setShowProfile(!showProfile)}
                className="flex items-center space-x-2 p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <User className="w-5 h-5" />
                <span className="text-sm font-medium">{user?.name}</span>
              </button>
              
              {showProfile && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2">
                  <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;