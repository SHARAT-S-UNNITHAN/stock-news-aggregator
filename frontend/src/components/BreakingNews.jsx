import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';

function BreakingNews({ news }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % news.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [news.length]);

  if (!news.length) return null;

  return (
    <div className="bg-red-600 text-white">
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex items-center space-x-3">
          <Bell className="h-5 w-5 animate-pulse" />
          <span className="font-semibold text-sm">BREAKING</span>
          <a
            href={news[currentIndex].url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm hover:underline"
          >
            {news[currentIndex].title}
          </a>
          {news[currentIndex].tickers && (
            <span className="text-xs bg-red-700 px-2 py-1 rounded">
              {news[currentIndex].tickers}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default BreakingNews;