import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ExternalLink, Star, TrendingUp, TrendingDown } from 'lucide-react';

function NewsCard({ article, favorites, onToggleFavorite }) {
  const tickers = article.tickers ? article.tickers.split(',') : [];
  
  const sentimentColors = {
    Positive: 'text-green-600 bg-green-50 dark:bg-green-900/20',
    Negative: 'text-red-600 bg-red-50 dark:bg-red-900/20',
    Neutral: 'text-gray-600 bg-gray-50 dark:bg-gray-700'
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-sm text-gray-500">{article.source}</span>
            <span className="text-sm text-gray-400">•</span>
            <span className="text-sm text-gray-500">
              {formatDistanceToNow(new Date(article.published_at), { addSuffix: true })}
            </span>
          </div>
          
          <h3 className="text-lg font-semibold mb-2">
            <a 
              href={article.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-blue-600"
            >
              {article.title}
            </a>
          </h3>
          
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
            {article.summary}
          </p>
          
          <div className="flex items-center space-x-3">
            {/* Tickers */}
            <div className="flex flex-wrap gap-2">
              {tickers.map(ticker => (
                <button
                  key={ticker}
                  onClick={() => onToggleFavorite(ticker)}
                  className={`inline-flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium ${
                    favorites.some(f => f.symbol === ticker)
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600'
                  }`}
                >
                  <span>${ticker}</span>
                  <Star className={`h-3 w-3 ${
                    favorites.some(f => f.symbol === ticker) ? 'fill-current' : ''
                  }`} />
                </button>
              ))}
            </div>
            
            {/* Sentiment */}
            <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium ${sentimentColors[article.sentiment]}`}>
              {article.sentiment === 'Positive' && <TrendingUp className="h-3 w-3" />}
              {article.sentiment === 'Negative' && <TrendingDown className="h-3 w-3" />}
              <span>{article.sentiment}</span>
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
  );
}

export default NewsCard;