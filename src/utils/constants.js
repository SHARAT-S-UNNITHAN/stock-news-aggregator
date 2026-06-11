export const SENTIMENT_CONFIG = {
  Positive: {
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    icon: 'TrendingUp',
    label: 'Positive'
  },
  Negative: {
    color: 'text-red-600',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    icon: 'TrendingDown',
    label: 'Negative'
  },
  Neutral: {
    color: 'text-gray-600',
    bgColor: 'bg-gray-50 dark:bg-gray-700',
    icon: 'Minus',
    label: 'Neutral'
  }
};

export const REFRESH_INTERVALS = {
  BREAKING_NEWS: 60000,    // 1 minute
  TRENDING_STOCKS: 300000, // 5 minutes
  NEWS_FEED: 900000       // 15 minutes
};

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_VISIBLE_PAGES: 5
};

export const SECTORS = [
  'Technology',
  'Finance',
  'Healthcare',
  'Consumer Cyclical',
  'Communication Services',
  'Industrials',
  'Energy',
  'Real Estate',
  'Materials',
  'Utilities'
];