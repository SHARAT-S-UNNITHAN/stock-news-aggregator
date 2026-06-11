import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Filter, Star, X } from 'lucide-react';

function FilterPanel({ filters, setFilters, favorites, onToggleFavorite }) {
  const [availableFilters, setAvailableFilters] = useState({
    sources: [],
    sectors: [],
    tickers: []
  });

  useEffect(() => {
    fetchAvailableFilters();
  }, []);

  const fetchAvailableFilters = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/filters');
      setAvailableFilters(response.data);
    } catch (error) {
      console.error('Error fetching filters:', error);
    }
  };

  const clearFilters = () => {
    setFilters({
      ticker: '',
      source: '',
      sector: '',
      sentiment: '',
      search: ''
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center">
          <Filter className="h-5 w-5 mr-2" />
          Filters
        </h3>
        <button
          onClick={clearFilters}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Clear all
        </button>
      </div>

      {/* Ticker Filter */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Stock Ticker</label>
        <select
          value={filters.ticker}
          onChange={(e) => setFilters({ ...filters, ticker: e.target.value })}
          className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
        >
          <option value="">All Tickers</option>
          {availableFilters.tickers.map(ticker => (
            <option key={ticker.symbol} value={ticker.symbol}>
              {ticker.symbol} - {ticker.company_name}
            </option>
          ))}
        </select>
      </div>

      {/* Source Filter */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Source</label>
        <select
          value={filters.source}
          onChange={(e) => setFilters({ ...filters, source: e.target.value })}
          className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
        >
          <option value="">All Sources</option>
          {availableFilters.sources.map(source => (
            <option key={source} value={source}>{source}</option>
          ))}
        </select>
      </div>

      {/* Sector Filter */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Sector</label>
        <select
          value={filters.sector}
          onChange={(e) => setFilters({ ...filters, sector: e.target.value })}
          className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
        >
          <option value="">All Sectors</option>
          {availableFilters.sectors.map(sector => (
            <option key={sector} value={sector}>{sector}</option>
          ))}
        </select>
      </div>

      {/* Sentiment Filter */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Sentiment</label>
        <select
          value={filters.sentiment}
          onChange={(e) => setFilters({ ...filters, sentiment: e.target.value })}
          className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
        >
          <option value="">All Sentiments</option>
          <option value="Positive">Positive</option>
          <option value="Neutral">Neutral</option>
          <option value="Negative">Negative</option>
        </select>
      </div>

      {/* Favorite Stocks */}
      <div className="mt-6">
        <h4 className="text-sm font-semibold mb-3 flex items-center">
          <Star className="h-4 w-4 mr-2 fill-yellow-500 text-yellow-500" />
          My Watchlist
        </h4>
        <div className="space-y-2">
          {favorites.map(fav => (
            <div
              key={fav.symbol}
              className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded"
            >
              <button
                onClick={() => setFilters({ ...filters, ticker: fav.symbol })}
                className="text-sm font-medium hover:text-blue-600"
              >
                ${fav.symbol}
              </button>
              <button
                onClick={() => onToggleFavorite(fav.symbol)}
                className="text-gray-400 hover:text-red-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          {favorites.length === 0 && (
            <p className="text-sm text-gray-500">No stocks in watchlist</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default FilterPanel;