import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

function TrendingStocks({ stocks }) {
  const getSentimentIcon = (avgSentiment) => {
    if (avgSentiment > 0.1) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (avgSentiment < -0.1) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4">Trending Stocks</h3>
      <div className="space-y-3">
        {stocks.map((stock, index) => (
          <div
            key={stock.symbol}
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
          >
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-gray-400">#{index + 1}</span>
                <span className="font-semibold">${stock.symbol}</span>
                {getSentimentIcon(stock.avg_sentiment)}
              </div>
              <p className="text-xs text-gray-500 mt-1">{stock.company_name}</p>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold">{stock.mention_count}</div>
              <div className="text-xs text-gray-500">mentions</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TrendingStocks;