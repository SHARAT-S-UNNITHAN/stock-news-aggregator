const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const rateLimit = require('express-rate-limit');
const yahooFinance = require('yahoo-finance2').default;
require('dotenv').config();

const { pool, initializeDatabase } = require('./db');
const { fetchAllFeeds, initializeTickers } = require('./feedFetcher');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api', limiter);

async function initialize() {
  await initializeDatabase();
  await initializeTickers();
  await fetchAllFeeds();

  cron.schedule('*/15 * * * *', () => {
    console.log('\n⏰ Scheduled feed update...');
    fetchAllFeeds();
  });

  cron.schedule('0 * * * *', async () => {
    try {
      const connection = await pool.getConnection();
      const [result] = await connection.query(
        'DELETE FROM articles WHERE published_at < DATE_SUB(NOW(), INTERVAL 24 HOUR)'
      );
      if (result.affectedRows > 0) console.log(`🧹 Cleaned ${result.affectedRows} old articles`);
      connection.release();
    } catch (error) {}
  });
  console.log('⏰ Auto-fetch: 15min | Auto-cleanup: 1hour');
}

// ========== NEWS API ==========

app.get('/api/news', async (req, res) => {
  try {
    const { ticker, source, sector, sentiment, date_from, date_to, page = 1, limit = 20 } = req.query;
    let query = `
      SELECT DISTINCT a.id, a.title, a.url, a.source, a.published_at, a.summary, a.sentiment, a.sentiment_score,
        GROUP_CONCAT(t.symbol) as tickers, GROUP_CONCAT(t.company_name) as companies
      FROM articles a
      LEFT JOIN article_tickers at ON a.id = at.article_id
      LEFT JOIN tickers t ON at.ticker_id = t.id
      WHERE 1=1
    `;
    const params = [];
    if (ticker) { query += ' AND t.symbol = ?'; params.push(ticker.toUpperCase()); }
    if (source) { query += ' AND a.source = ?'; params.push(source); }
    if (sector) { query += ' AND t.sector = ?'; params.push(sector); }
    if (sentiment) { query += ' AND a.sentiment = ?'; params.push(sentiment); }
    if (date_from) { query += ' AND a.published_at >= ?'; params.push(date_from); }
    if (date_to) { query += ' AND a.published_at <= ?'; params.push(date_to); }
    query += ' GROUP BY a.id ORDER BY a.published_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));
    const [articles] = await pool.query(query, params);

    let countQuery = 'SELECT COUNT(DISTINCT a.id) as total FROM articles a LEFT JOIN article_tickers at ON a.id = at.article_id LEFT JOIN tickers t ON at.ticker_id = t.id WHERE 1=1';
    const countParams = [];
    if (ticker) { countQuery += ' AND t.symbol = ?'; countParams.push(ticker.toUpperCase()); }
    if (source) { countQuery += ' AND a.source = ?'; countParams.push(source); }
    if (sentiment) { countQuery += ' AND a.sentiment = ?'; countParams.push(sentiment); }
    const [countResult] = await pool.query(countQuery, countParams);
    res.json({ articles, total: countResult[0].total, page: parseInt(page), totalPages: Math.ceil(countResult[0].total / parseInt(limit)) });
  } catch (error) { res.status(500).json({ error: 'Internal server error' }); }
});

app.get('/api/news/breaking', async (req, res) => {
  try {
    const [breaking] = await pool.query(`
      SELECT a.*, GROUP_CONCAT(t.symbol) as tickers FROM breaking_news bn
      JOIN articles a ON bn.article_id = a.id
      LEFT JOIN article_tickers at ON a.id = at.article_id
      LEFT JOIN tickers t ON at.ticker_id = t.id
      WHERE bn.is_active = TRUE GROUP BY a.id ORDER BY a.published_at DESC LIMIT 10
    `);
    res.json(breaking);
  } catch (error) { res.status(500).json({ error: 'Internal server error' }); }
});

app.get('/api/stocks/trending', async (req, res) => {
  try {
    const [trending] = await pool.query(`
      SELECT t.symbol, t.company_name, t.sector, COUNT(at.id) as mention_count,
        AVG(CASE WHEN a.sentiment='Positive' THEN 1 WHEN a.sentiment='Negative' THEN -1 ELSE 0 END) as avg_sentiment
      FROM tickers t JOIN article_tickers at ON t.id = at.ticker_id
      JOIN articles a ON at.article_id = a.id
      WHERE a.published_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
      GROUP BY t.id ORDER BY mention_count DESC LIMIT 10
    `);
    res.json(trending);
  } catch (error) { res.status(500).json({ error: 'Internal server error' }); }
});

app.get('/api/filters', async (req, res) => {
  try {
    const [sources] = await pool.query('SELECT DISTINCT source FROM articles ORDER BY source');
    const [sectors] = await pool.query('SELECT DISTINCT sector FROM tickers WHERE sector IS NOT NULL ORDER BY sector');
    const [tickers] = await pool.query('SELECT symbol, company_name FROM tickers ORDER BY symbol');
    res.json({ sources: sources.map(s => s.source), sectors: sectors.map(s => s.sector), tickers });
  } catch (error) { res.status(500).json({ error: 'Internal server error' }); }
});

app.post('/api/favorites', async (req, res) => {
  try {
    const { userId, ticker } = req.body;
    const [tickerRows] = await pool.query('SELECT id FROM tickers WHERE symbol = ?', [ticker.toUpperCase()]);
    if (tickerRows.length === 0) return res.status(404).json({ error: 'Ticker not found' });
    await pool.query('INSERT IGNORE INTO user_favorites (user_id, ticker_id) VALUES (?, ?)', [userId, tickerRows[0].id]);
    res.json({ message: 'Favorite saved' });
  } catch (error) { res.status(500).json({ error: 'Internal server error' }); }
});

app.get('/api/favorites/:userId', async (req, res) => {
  try {
    const [favorites] = await pool.query(
      'SELECT t.* FROM user_favorites uf JOIN tickers t ON uf.ticker_id = t.id WHERE uf.user_id = ? ORDER BY t.symbol',
      [req.params.userId]
    );
    res.json(favorites);
  } catch (error) { res.status(500).json({ error: 'Internal server error' }); }
});

app.delete('/api/favorites/:userId/:ticker', async (req, res) => {
  try {
    await pool.query(
      'DELETE uf FROM user_favorites uf JOIN tickers t ON uf.ticker_id = t.id WHERE uf.user_id = ? AND t.symbol = ?',
      [req.params.userId, req.params.ticker.toUpperCase()]
    );
    res.json({ message: 'Favorite removed' });
  } catch (error) { res.status(500).json({ error: 'Internal server error' }); }
});

app.get('/api/search', async (req, res) => {
  try {
    const { q, limit = 20 } = req.query;
    if (!q) return res.status(400).json({ error: 'Search query required' });
    const [results] = await pool.query(`
      SELECT a.*, GROUP_CONCAT(t.symbol) as tickers, MATCH(a.title, a.summary) AGAINST(? IN NATURAL LANGUAGE MODE) as relevance
      FROM articles a LEFT JOIN article_tickers at ON a.id = at.article_id
      LEFT JOIN tickers t ON at.ticker_id = t.id
      WHERE MATCH(a.title, a.summary) AGAINST(? IN NATURAL LANGUAGE MODE)
      GROUP BY a.id ORDER BY relevance DESC LIMIT ?
    `, [q, q, parseInt(limit)]);
    res.json(results);
  } catch (error) { res.status(500).json({ error: 'Internal server error' }); }
});

// ========== REAL-TIME STOCK PRICES ==========
// ========== REAL-TIME STOCK PRICES ========== 
const stockPriceCache = {
  timestamp: 0,
  data: []
};
const STOCK_PRICE_TTL = 5 * 60 * 1000; // 5 minutes

const STOCK_QUOTE_MAP = [
  { symbol: '^NSEI', query: 'NSEI:INDEXNSE', name: 'NIFTY 50', currency: 'INR' },
  { symbol: '^BSESN', query: 'BSESN:INDEXBOM', name: 'SENSEX', currency: 'INR' },
  { symbol: '^NSEBANK', query: 'NSEBANK:INDEXNSE', name: 'BANK NIFTY', currency: 'INR' },
  { symbol: 'RELIANCE', query: 'RELIANCE:NSE', name: 'Reliance Industries Ltd', currency: 'INR' },
  { symbol: 'TCS', query: 'TCS:NSE', name: 'Tata Consultancy Services Ltd', currency: 'INR' },
  { symbol: 'HDFCBANK', query: 'HDFCBANK:NSE', name: 'HDFC Bank Ltd', currency: 'INR' },
  { symbol: 'INFY', query: 'INFY:NSE', name: 'Infosys Ltd', currency: 'INR' },
  { symbol: 'ICICIBANK', query: 'ICICIBANK:NSE', name: 'ICICI Bank Ltd', currency: 'INR' },
  { symbol: 'SBIN', query: 'SBIN:NSE', name: 'State Bank of India', currency: 'INR' },
  { symbol: 'TATAMOTORS', query: 'TATAMOTORS:NSE', name: 'Tata Motors Ltd', currency: 'INR' },
  { symbol: 'BHARTIARTL', query: 'BHARTIARTL:NSE', name: 'Bharti Airtel Ltd', currency: 'INR' },
  { symbol: 'ITC', query: 'ITC:NSE', name: 'ITC Ltd', currency: 'INR' },
  { symbol: 'WIPRO', query: 'WIPRO:NSE', name: 'Wipro Ltd', currency: 'INR' },
  { symbol: 'AAPL', query: 'AAPL:NASDAQ', name: 'Apple Inc', currency: 'USD' },
  { symbol: 'TSLA', query: 'TSLA:NASDAQ', name: 'Tesla Inc', currency: 'USD' },
  { symbol: 'NVDA', query: 'NVDA:NASDAQ', name: 'NVIDIA Corporation', currency: 'USD' }
];
const SYMBOL_LOOKUP = Object.fromEntries(
  STOCK_QUOTE_MAP.flatMap(item => {
    const querySymbol = item.query.split(':')[0];
    return [[item.symbol, item], [querySymbol, item]];
  })
);

function parseGoogleFinanceDS2(html) {
  const callbackRegex = /AF_initDataCallback\((\{[^]*?\})\);/g;
  let match;

  while ((match = callbackRegex.exec(html)) !== null) {
    try {
      const payload = Function(`"use strict"; return (${match[1]})`)();
      if (payload && payload.key === 'ds:2' && Array.isArray(payload.data)) {
        const rows = payload.data?.[0]?.[0];
        const item = rows?.[0];
        if (Array.isArray(item) && Array.isArray(item[1]) && Array.isArray(item[5])) {
          return {
            symbol: item[1][0],
            name: item[2] || '',
            price: Number(item[5][0]),
            change: Number(item[5][1]),
            changePercent: Number(item[5][2]),
            currency: item[4] || ''
          };
        }
      }
    } catch (err) {
      continue;
    }
  }

  return null;
}

async function fetchGoogleFinanceQuote(query) {
  const axios = require('axios');
  const url = `https://www.google.com/finance/quote/${encodeURIComponent(query)}`;
  const response = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
    },
    timeout: 12000
  });

  return parseGoogleFinanceDS2(response.data);
}

async function fetchGoogleFinancePrices() {
  const results = [];
  const batchSize = 5;

  for (let i = 0; i < STOCK_QUOTE_MAP.length; i += batchSize) {
    const batch = STOCK_QUOTE_MAP.slice(i, i + batchSize);
    const settled = await Promise.allSettled(batch.map(item => fetchGoogleFinanceQuote(item.query)));

    settled.forEach((entry, index) => {
      if (entry.status !== 'fulfilled' || !entry.value) {
        return;
      }
      const quote = entry.value;
      const mapEntry = SYMBOL_LOOKUP[quote.symbol];
      if (!mapEntry || Number.isNaN(quote.price)) {
        return;
      }
      results.push({
        symbol: mapEntry.symbol,
        name: mapEntry.name,
        price: quote.price,
        change: Number.isFinite(quote.change) ? quote.change : 0,
        changePercent: Number.isFinite(quote.changePercent) ? quote.changePercent : 0,
        currency: mapEntry.currency
      });
    });
  }

  return results;
}

app.get('/api/stock/prices', async (req, res) => {
  try {
    const isCacheValid = Date.now() - stockPriceCache.timestamp < STOCK_PRICE_TTL;
    if (isCacheValid && stockPriceCache.data.length) {
      return res.json(stockPriceCache.data);
    }

    const prices = await fetchGoogleFinancePrices();
    if (prices.length) {
      stockPriceCache.timestamp = Date.now();
      stockPriceCache.data = prices;
      return res.json(prices);
    }

    if (stockPriceCache.data.length) {
      return res.json(stockPriceCache.data);
    }

    res.json([]);
  } catch (error) {
    console.error('Stock price error:', error.message);
    if (stockPriceCache.data.length) {
      return res.json(stockPriceCache.data);
    }
    res.json([]);
  }
});

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await initialize();
});