import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { TrendingUp, Search, Star, Sun, Moon, RefreshCw, ExternalLink, TrendingDown, Minus } from 'lucide-react';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [ticker, setTicker] = useState('');
  const [sentiment, setSentiment] = useState('');

  useEffect(() => {
    fetchNews();
  }, [ticker, sentiment]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {};
      if (ticker) params.ticker = ticker;
      if (sentiment) params.sentiment = sentiment;
      
      const response = await axios.get('http://localhost:3001/api/news', { params });
      setArticles(response.data.articles || []);
    } catch (err) {
      console.error('Error fetching news:', err);
      setError('Failed to fetch news. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!search.trim()) {
      fetchNews();
      return;
    }
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3001/api/search', {
        params: { q: search }
      });
      setArticles(response.data || []);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getSentimentIcon = (sentiment) => {
    if (sentiment === 'Positive') return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (sentiment === 'Negative') return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const getSentimentColor = (sentiment) => {
    if (sentiment === 'Positive') return 'bg-green-50 text-green-700 border-green-200';
    if (sentiment === 'Negative') return 'bg-red-50 text-red-700 border-red-200';
    return 'bg-gray-50 text-gray-700 border-gray-200';
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <div className="dark:bg-gray-900 dark:text-white min-h-screen">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-3">
                <TrendingUp className="h-8 w-8 text-blue-600" />
                <h1 className="text-2xl font-bold">StockNews</h1>
              </div>
              
              <div className="flex items-center space-x-4 flex-1 max-w-xl">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search news..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Search
                </button>
              </div>
              
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8">
          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
            <div className="flex flex-wrap gap-4 items-center">
              <select
                value={ticker}
                onChange={(e) => setTicker(e.target.value)}
                className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="">All Tickers</option>
                <option value="AAPL">AAPL - Apple</option>
                <option value="TSLA">TSLA - Tesla</option>
                <option value="NVDA">NVDA - NVIDIA</option>
                <option value="MSFT">MSFT - Microsoft</option>
                <option value="GOOGL">GOOGL - Alphabet</option>
                <option value="AMZN">AMZN - Amazon</option>
                <option value="META">META - Meta</option>
              </select>
              
              <select
                value={sentiment}
                onChange={(e) => setSentiment(e.target.value)}
                className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="">All Sentiments</option>
                <option value="Positive">Positive</option>
                <option value="Neutral">Neutral</option>
                <option value="Negative">Negative</option>
              </select>

              <button
                onClick={fetchNews}
                className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            /* News Cards */
            <div className="space-y-4">
              {articles.length === 0 && !loading && (
                <div className="text-center py-12 text-gray-500">
                  No articles found. Try different filters.
                </div>
              )}
              {articles.map((article) => (
                <div
                  key={article.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {article.source}
                        </span>
                        <span className="text-gray-400">•</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {article.published_at && formatDistanceToNow(new Date(article.published_at), { addSuffix: true })}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-semibold mb-2">
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-blue-600 dark:hover:text-blue-400"
                        >
                          {article.title}
                        </a>
                      </h3>
                      
                      {article.summary && (
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                          {article.summary.substring(0, 200)}...
                        </p>
                      )}
                      
                      <div className="flex items-center space-x-3 flex-wrap gap-2">
                        {article.tickers && article.tickers.split(',').map(t => (
                          <button
                            key={t}
                            onClick={() => setTicker(t)}
                            className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-medium hover:bg-gray-200 dark:hover:bg-gray-600"
                          >
                            ${t}
                          </button>
                        ))}
                        
                        <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium border ${getSentimentColor(article.sentiment)}`}>
                          {getSentimentIcon(article.sentiment)}
                          <span>{article.sentiment || 'Neutral'}</span>
                        </span>
                      </div>
                    </div>
                    
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-4 text-gray-400 hover:text-gray-600"
                    >
                      <ExternalLink className="h-5 w-5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;