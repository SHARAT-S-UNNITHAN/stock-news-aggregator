const Parser = require('rss-parser');
const Sentiment = require('sentiment');
const axios = require('axios');
const { pool } = require('./db');

const parser = new Parser();
const sentiment = new Sentiment();

const RSS_FEEDS = [
  // US Markets
  { url: 'https://feeds.finance.yahoo.com/rss/2.0/headline?s=AAPL,TSLA,NVDA,MSFT,GOOGL,AMZN,META,RELIANCE.NS,TCS.NS,INFY.NS', source: 'Yahoo Finance', category: 'global' },
  { url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100003114', source: 'CNBC', category: 'us' },
  { url: 'https://feeds.content.dowjones.io/public/rss/mw_topstories', source: 'MarketWatch', category: 'us' },
  
  // Indian Markets - Working Feeds
  { url: 'https://economictimes.indiatimes.com/markets/stocks/rssfeeds/2146842.cms', source: 'Economic Times', category: 'india' },
  { url: 'https://www.moneycontrol.com/rss/business.xml', source: 'Moneycontrol', category: 'india' },
  { url: 'https://www.livemint.com/rss/markets', source: 'LiveMint', category: 'india' },
  { url: 'https://www.thehindu.com/business/markets/feeder/default.rss', source: 'The Hindu Business', category: 'india' },
  
  // Additional Indian feeds
  { url: 'https://www.business-standard.com/rss/markets-106.rss', source: 'Business Standard', category: 'india' },
  { url: 'https://www.businesstoday.in/rss/markets.jsp', source: 'Business Today', category: 'india' },
  { url: 'https://www.outlookindia.com/rss/market', source: 'Outlook India', category: 'india' },
  { url: 'https://www.cnbctv18.com/rss/market/', source: 'CNBC TV18', category: 'india' },
  
  // Additional US/Global
  { url: 'https://feeds.bloomberg.com/markets/news.rss', source: 'Bloomberg', category: 'global' },
  { url: 'https://www.investing.com/rss/news.rss', source: 'Investing.com', category: 'global' },
  { url: 'https://www.fxstreet.com/rss', source: 'FXStreet', category: 'global' },
];

const STOCK_TICKERS = [
  // US
  { symbol: 'AAPL', company: 'Apple Inc.', sector: 'Technology' },
  { symbol: 'TSLA', company: 'Tesla Inc.', sector: 'Automotive' },
  { symbol: 'NVDA', company: 'NVIDIA Corporation', sector: 'Technology' },
  { symbol: 'MSFT', company: 'Microsoft Corporation', sector: 'Technology' },
  { symbol: 'GOOGL', company: 'Alphabet Inc.', sector: 'Technology' },
  { symbol: 'AMZN', company: 'Amazon.com Inc.', sector: 'E-commerce' },
  { symbol: 'META', company: 'Meta Platforms Inc.', sector: 'Technology' },
  
  // NSE/BSE - Large Cap
  { symbol: 'RELIANCE', company: 'Reliance Industries Ltd', sector: 'Oil & Gas' },
  { symbol: 'TCS', company: 'Tata Consultancy Services Ltd', sector: 'IT' },
  { symbol: 'HDFCBANK', company: 'HDFC Bank Ltd', sector: 'Banking' },
  { symbol: 'INFY', company: 'Infosys Ltd', sector: 'IT' },
  { symbol: 'ICICIBANK', company: 'ICICI Bank Ltd', sector: 'Banking' },
  { symbol: 'SBIN', company: 'State Bank of India', sector: 'Banking' },
  { symbol: 'BHARTIARTL', company: 'Bharti Airtel Ltd', sector: 'Telecom' },
  { symbol: 'ITC', company: 'ITC Ltd', sector: 'FMCG' },
  { symbol: 'HINDUNILVR', company: 'Hindustan Unilever Ltd', sector: 'FMCG' },
  { symbol: 'WIPRO', company: 'Wipro Ltd', sector: 'IT' },
  { symbol: 'TATAMOTORS', company: 'Tata Motors Ltd', sector: 'Automotive' },
  { symbol: 'BAJFINANCE', company: 'Bajaj Finance Ltd', sector: 'NBFC' },
  { symbol: 'MARUTI', company: 'Maruti Suzuki India Ltd', sector: 'Automotive' },
  { symbol: 'SUNPHARMA', company: 'Sun Pharmaceutical Industries', sector: 'Pharma' },
  { symbol: 'AXISBANK', company: 'Axis Bank Ltd', sector: 'Banking' },
  { symbol: 'LT', company: 'Larsen & Toubro Ltd', sector: 'Infrastructure' },
  { symbol: 'ADANIENT', company: 'Adani Enterprises Ltd', sector: 'Conglomerate' },
  { symbol: 'NTPC', company: 'NTPC Ltd', sector: 'Power' },
  { symbol: 'POWERGRID', company: 'Power Grid Corporation', sector: 'Power' },
  { symbol: 'TATASTEEL', company: 'Tata Steel Ltd', sector: 'Metals' },
  { symbol: 'KOTAKBANK', company: 'Kotak Mahindra Bank', sector: 'Banking' },
  { symbol: 'HCLTECH', company: 'HCL Technologies Ltd', sector: 'IT' },
  { symbol: 'ASIANPAINT', company: 'Asian Paints Ltd', sector: 'Consumer' },
  { symbol: 'BAJAJFINSV', company: 'Bajaj Finserv Ltd', sector: 'NBFC' },
  { symbol: 'TITAN', company: 'Titan Company Ltd', sector: 'Consumer' },
  { symbol: 'ULTRACEMCO', company: 'UltraTech Cement Ltd', sector: 'Cement' },
  { symbol: 'JSWSTEEL', company: 'JSW Steel Ltd', sector: 'Metals' },
  { symbol: 'ADANIPORTS', company: 'Adani Ports & SEZ Ltd', sector: 'Infrastructure' },
];

function extractTickers(text) {
  const upper = text.toUpperCase();
  return STOCK_TICKERS.filter(t => upper.includes(t.symbol)).map(t => t.symbol);
}

function analyzeSentiment(text) {
  const result = sentiment.analyze(text);
  const score = result.comparative;
  if (score > 0.05) return { sentiment: 'Positive', score };
  if (score < -0.05) return { sentiment: 'Negative', score };
  return { sentiment: 'Neutral', score };
}

async function saveArticle(article, source) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [existing] = await connection.query('SELECT id FROM articles WHERE url = ?', [article.link]);
    if (existing.length > 0) { await connection.rollback(); return; }
    
    const text = `${article.title} ${article.contentSnippet || ''}`;
    const tickers = extractTickers(text);
    const { sentiment: sent, score } = analyzeSentiment(text);
    
    const [result] = await connection.query(
      `INSERT INTO articles (title, url, source, published_at, summary, sentiment, sentiment_score) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [article.title, article.link, source, new Date(article.pubDate || Date.now()), article.contentSnippet?.substring(0, 500) || '', sent, score]
    );
    
    const articleId = result.insertId;
    for (const symbol of tickers) {
      const [tickerRows] = await connection.query('SELECT id FROM tickers WHERE symbol = ?', [symbol]);
      let tickerId;
      if (tickerRows.length === 0) {
        const td = STOCK_TICKERS.find(t => t.symbol === symbol);
        const [ir] = await connection.query('INSERT INTO tickers (symbol, company_name, sector) VALUES (?, ?, ?)',
          [symbol, td?.company || symbol, td?.sector || 'Unknown']);
        tickerId = ir.insertId;
      } else { tickerId = tickerRows[0].id; }
      await connection.query('INSERT IGNORE INTO article_tickers (article_id, ticker_id) VALUES (?, ?)', [articleId, tickerId]);
    }
    
    if (new Date(article.pubDate) > new Date(Date.now() - 3600000)) {
      await connection.query('INSERT IGNORE INTO breaking_news (article_id) VALUES (?)', [articleId]);
    }
    await connection.commit();
    console.log(`[${source}] ${article.title?.substring(0, 70)}`);
  } catch (error) {
    await connection.rollback();
  } finally { connection.release(); }
}

async function fetchAllFeeds() {
  console.log('\n🚀 Starting RSS feed fetch...\n');
  for (const feed of RSS_FEEDS) {
    try {
      const feedData = await parser.parseURL(feed.url);
      for (const item of feedData.items) { await saveArticle(item, feed.source); }
      console.log(`✅ ${feed.source}: ${feedData.items.length} articles`);
    } catch (error) { console.log(`❌ ${feed.source}: ${error.message}`); }
  }
  // Clean old breaking news
  try {
    const c = await pool.getConnection();
    await c.query(`DELETE bn FROM breaking_news bn JOIN articles a ON bn.article_id = a.id WHERE a.published_at < DATE_SUB(NOW(), INTERVAL 2 HOUR)`);
    c.release();
  } catch (e) {}
  console.log('\n✅ Feed fetch completed!\n');
}

async function initializeTickers() {
  const c = await pool.getConnection();
  try {
    for (const t of STOCK_TICKERS) {
      await c.query('INSERT IGNORE INTO tickers (symbol, company_name, sector) VALUES (?, ?, ?)', [t.symbol, t.company, t.sector]);
    }
    console.log('✅ Tickers initialized');
  } finally { c.release(); }
}

module.exports = { fetchAllFeeds, initializeTickers };