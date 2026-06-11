import { formatDistanceToNow, format, isValid } from 'date-fns';

/**
 * Format date to relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date) {
  const parsedDate = new Date(date);
  if (!isValid(parsedDate)) return 'Unknown date';
  return formatDistanceToNow(parsedDate, { addSuffix: true });
}

/**
 * Format date to standard format
 */
export function formatDate(date, formatStr = 'MMM dd, yyyy HH:mm') {
  const parsedDate = new Date(date);
  if (!isValid(parsedDate)) return 'Unknown date';
  return format(parsedDate, formatStr);
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text, maxLength = 150) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

/**
 * Get sentiment configuration
 */
export function getSentimentConfig(sentiment) {
  const configs = {
    Positive: {
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800'
    },
    Negative: {
      color: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-800'
    },
    Neutral: {
      color: 'text-gray-600',
      bgColor: 'bg-gray-50 dark:bg-gray-700',
      borderColor: 'border-gray-200 dark:border-gray-600'
    }
  };
  
  return configs[sentiment] || configs.Neutral;
}

/**
 * Group articles by date
 */
export function groupArticlesByDate(articles) {
  const groups = {};
  
  articles.forEach(article => {
    const date = format(new Date(article.published_at), 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(article);
  });
  
  return Object.entries(groups).map(([date, articles]) => ({
    date,
    articles
  }));
}

/**
 * Debounce function
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Calculate market sentiment from articles
 */
export function calculateMarketSentiment(articles) {
  if (!articles.length) return { bullish: 0, bearish: 0, neutral: 0 };
  
  const counts = articles.reduce((acc, article) => {
    if (article.sentiment === 'Positive') acc.bullish++;
    else if (article.sentiment === 'Negative') acc.bearish++;
    else acc.neutral++;
    return acc;
  }, { bullish: 0, bearish: 0, neutral: 0 });
  
  const total = articles.length;
  return {
    bullish: ((counts.bullish / total) * 100).toFixed(1),
    bearish: ((counts.bearish / total) * 100).toFixed(1),
    neutral: ((counts.neutral / total) * 100).toFixed(1)
  };
}