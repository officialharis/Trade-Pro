import React, { useState } from 'react';
import { Search, Filter, TrendingUp } from 'lucide-react';
import { stocksData } from '../data/stocksData';
import StockCard from '../components/StockCard';

const Stocks = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('All');
  const [sortBy, setSortBy] = useState('name');

  const sectors = ['All', ...new Set(stocksData.map(stock => stock.sector))];

  const filteredStocks = stocksData
    .filter(stock => {
      const matchesSearch = stock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           stock.symbol.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSector = selectedSector === 'All' || stock.sector === selectedSector;
      return matchesSearch && matchesSector;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price':
          return b.price - a.price;
        case 'change':
          return b.changePercent - a.changePercent;
        case 'marketCap':
          return parseFloat(b.marketCap.replace(',', '')) - parseFloat(a.marketCap.replace(',', ''));
        default:
          return 0;
      }
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Stocks</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Discover and invest in your favorite companies</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <TrendingUp className="w-4 h-4" />
          <span>Market is Open</span>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Search stocks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-groww-primary focus:border-transparent placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="px-4 py-2 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-groww-primary focus:border-transparent"
            >
              {sectors.map(sector => (
                <option key={sector} value={sector}>{sector}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-groww-primary focus:border-transparent"
            >
              <option value="name">Sort by Name</option>
              <option value="price">Sort by Price</option>
              <option value="change">Sort by Change</option>
              <option value="marketCap">Sort by Market Cap</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {filteredStocks.length} stock{filteredStocks.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStocks.map((stock) => (
            <StockCard key={stock.symbol} stock={stock} />
          ))}
        </div>

        {filteredStocks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No stocks found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Stocks;