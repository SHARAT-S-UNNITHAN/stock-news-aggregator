const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || undefined,
  database: process.env.DB_NAME || 'stock_news',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Initialize database tables
async function initializeDatabase() {
  try {
    const connection = await pool.getConnection();
    
    // Create database if not exists
    await connection.query(`CREATE DATABASE IF NOT EXISTS stock_news`);
    await connection.query(`USE stock_news`);
    
    // Create articles table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS articles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        url VARCHAR(500) UNIQUE NOT NULL,
        source VARCHAR(100) NOT NULL,
        published_at DATETIME NOT NULL,
        summary TEXT,
        sentiment VARCHAR(20),
        sentiment_score FLOAT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_published_at (published_at),
        INDEX idx_source (source),
        INDEX idx_sentiment (sentiment),
        FULLTEXT INDEX idx_title_summary (title, summary)
      )
    `);
    
    // Create tickers table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS tickers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        symbol VARCHAR(10) UNIQUE NOT NULL,
        company_name VARCHAR(200),
        sector VARCHAR(100),
        INDEX idx_symbol (symbol),
        INDEX idx_sector (sector)
      )
    `);
    
    // Create article_tickers junction table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS article_tickers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        article_id INT NOT NULL,
        ticker_id INT NOT NULL,
        FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
        FOREIGN KEY (ticker_id) REFERENCES tickers(id) ON DELETE CASCADE,
        UNIQUE KEY unique_article_ticker (article_id, ticker_id)
      )
    `);
    
    // Create user_favorites table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_favorites (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(100) NOT NULL,
        ticker_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ticker_id) REFERENCES tickers(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_ticker (user_id, ticker_id)
      )
    `);
    
    // Create breaking_news table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS breaking_news (
        id INT AUTO_INCREMENT PRIMARY KEY,
        article_id INT NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
      )
    `);
    
    console.log('Database tables initialized successfully');
    connection.release();
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

module.exports = { pool, initializeDatabase };