const Sentiment = require('sentiment');
const sentiment = new Sentiment();

// Custom financial sentiment words
const financialLexicon = {
  // Positive terms
  'beat': 2,
  'outperform': 2,
  'upgrade': 2,
  'surge': 3,
  'rally': 2,
  'growth': 1,
  'profit': 2,
  'dividend': 1,
  'bullish': 2,
  
  // Negative terms
  'miss': -2,
  'downgrade': -2,
  'plunge': -3,
  'crash': -3,
  'loss': -2,
  'decline': -1,
  'bearish': -2,
  'bankruptcy': -3,
  'layoff': -2
};

// Register custom financial terms
sentiment.registerLanguage('en', {
  labels: financialLexicon
});

/**
 * Analyze sentiment of financial text
 * @param {string} text - Text to analyze
 * @returns {Object} Sentiment analysis result
 */
function analyzeFinancialSentiment(text) {
  const result = sentiment.analyze(text);
  
  return {
    score: result.comparative,
    comparative: result.comparative,
    positive: result.positive,
    negative: result.negative,
    sentiment: getSentimentLabel(result.comparative)
  };
}

/**
 * Get sentiment label based on score
 * @param {number} score - Sentiment score
 * @returns {string} Sentiment label
 */
function getSentimentLabel(score) {
  if (score > 0.05) return 'Positive';
  if (score < -0.05) return 'Negative';
  return 'Neutral';
}

/**
 * Extract stock tickers from text
 * @param {string} text - Text to analyze
 * @returns {Array} Array of ticker symbols
 */
function extractStockTickers(text) {
  const tickerPattern = /\$([A-Z]{1,5})|(?:^|\s)([A-Z]{1,5})(?:\s|$)/g;
  const matches = [...text.matchAll(tickerPattern)];
  
  return [...new Set(matches.map(match => match[1] || match[2]).filter(Boolean))];
}

module.exports = {
  analyzeFinancialSentiment,
  getSentimentLabel,
  extractStockTickers
};