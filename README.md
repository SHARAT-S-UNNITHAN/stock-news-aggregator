
```markdown
# 📈 StockPulse - Stock News Feed Aggregator

A real-time stock news aggregator that collects financial news from multiple sources and displays live NSE/BSE/NASDAQ stock prices in one professional dashboard.

![StockPulse Banner](https://img.shields.io/badge/StockPulse-Live_Markets-00d09c?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Node](https://img.shields.io/badge/Node.js-18%2B-green.svg)
![React](https://img.shields.io/badge/React-18-blue.svg)

## 🚀 Features

### 📰 News Aggregation
- **12+ News Sources**: Yahoo Finance, CNBC, Bloomberg, Economic Times, Moneycontrol, LiveMint, The Hindu Business, MarketWatch, Investing.com, FXStreet & more
- **Auto-fetching**: Fetches fresh news every 15 minutes automatically
- **Auto-cleanup**: Deletes articles older than 24 hours to keep database lean
- **Breaking News Ticker**: Real-time breaking news marquee banner

### 📊 Live Stock Prices
- **NSE/BSE**: NIFTY 50, SENSEX, BANK NIFTY, Reliance, TCS, HDFC Bank, Infosys, ICICI Bank, SBI, Tata Motors & more
- **NASDAQ/NYSE**: AAPL, TSLA, NVDA, MSFT, GOOGL, AMZN, META
- **Auto-refresh**: Stock prices update every 30 seconds
- **5-minute cache**: Reduces API calls and avoids rate limits

### 🎯 Smart Features
- **Sentiment Analysis**: AI-powered Bullish/Bearish/Neutral classification
- **Ticker Detection**: Automatically identifies stock symbols in articles
- **Advanced Filters**: Filter by stock ticker, news source, sentiment, sector
- **Market Tabs**: 🇮🇳 NSE/BSE | 🇺🇸 US Markets | 🌐 Global
- **Search**: Full-text search across all articles
- **Live Price Panel**: Side panel showing real-time stock prices
- **Favorites**: Save and track your favorite stocks

### 🎨 Premium UI
- **Groww-inspired Design**: Clean, modern interface
- **Market Indices Ticker**: NIFTY, SENSEX, BANK NIFTY cards
- **Hover Animations**: Smooth card transitions
- **Responsive**: Works on desktop and tablet
- **Color-coded Sentiment**: Green for Bullish, Red for Bearish

## 🏗️ Architecture

```
News Sources (RSS Feeds)
     ↓
RSS Feed Collector (feedFetcher.js)
     ↓
Backend API (Express.js)
     ↓
MySQL Database
     ↓
Frontend Dashboard (React + Vite)
```

## 📁 Project Structure

```
stock-news-aggregator/
├── backend/
│   ├── server.js              # Express API server
│   ├── db.js                  # MySQL database connection & tables
│   ├── feedFetcher.js         # RSS feed parser & article saver
│   ├── utils/
│   │   └── sentimentAnalyzer.js  # Financial sentiment analysis
│   ├── package.json
│   └── .env                   # Database credentials
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # Main dashboard component
│   │   ├── main.jsx           # React entry point
│   │   ├── index.css          # Tailwind CSS styles
│   │   ├── api/
│   │   │   └── newsApi.js     # API service functions
│   │   ├── components/
│   │   │   ├── NewsCard.jsx       # Article card component
│   │   │   ├── FilterPanel.jsx    # Filter sidebar
│   │   │   ├── BreakingNews.jsx   # Breaking news ticker
│   │   │   ├── TrendingStocks.jsx # Trending stocks panel
│   │   │   ├── StockChart.jsx     # Price chart component
│   │   │   ├── SearchBar.jsx      # Search input
│   │   │   ├── Pagination.jsx     # Page navigation
│   │   │   └── LoadingSpinner.jsx # Loading indicator
│   │   ├── hooks/
│   │   │   ├── useNews.js         # News fetching hook
│   │   │   ├── useFavorites.js    # Favorites management
│   │   │   └── useDarkMode.js     # Dark mode toggle
│   │   └── utils/
│   │       ├── constants.js       # App constants
│   │       └── helpers.js         # Utility functions
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
└── README.md
```

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express.js** - API server
- **MySQL** (MariaDB) - Database
- **node-cron** - Scheduled feed fetching
- **rss-parser** - RSS feed parsing
- **sentiment** - Article sentiment analysis
- **yahoo-finance2** - Stock price data
- **express-rate-limit** - API rate limiting

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Recharts** - Stock charts
- **date-fns** - Date formatting
- **Lucide React** - Icons
- **Axios** - HTTP client

## 📊 News Sources

| Source | Type | Status |
|--------|------|--------|
| Yahoo Finance | US/Global | ✅ Active |
| CNBC | US Markets | ✅ Active |
| Bloomberg | Global | ✅ Active |
| MarketWatch | US Markets | ✅ Active |
| Economic Times | NSE/BSE India | ✅ Active |
| Moneycontrol | NSE/BSE India | ✅ Active |
| LiveMint | NSE/BSE India | ✅ Active |
| The Hindu Business | NSE/BSE India | ✅ Active |
| Investing.com | Global | ✅ Active |
| FXStreet | Forex/Global | ✅ Active |
| Business Standard | India | ⚠️ Blocked |
| NDTV Profit | India | ⚠️ Blocked |
| Zee Business | India | ⚠️ Blocked |

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MySQL / MariaDB
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/SHARAT-S-UNNITHAN/stock-news-aggregator.git
cd stock-news-aggregator
```

2. **Set up the database**
```bash
# Start MySQL
mysql -u root

# Create database
CREATE DATABASE stock_news;
EXIT;
```

3. **Set up Backend**
```bash
cd backend
npm install

# Create .env file
echo DB_HOST=localhost > .env
echo DB_USER=root >> .env
echo DB_PASSWORD= >> .env
echo DB_NAME=stock_news >> .env
echo PORT=3001 >> .env

# Start backend
npm run dev
```

4. **Set up Frontend** (in new terminal)
```bash
cd frontend
npm install
npm run dev
```

5. **Open browser**
```
http://localhost:3000
```

### Environment Variables

Create `.env` in the `backend` folder:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=stock_news
PORT=3001
NODE_ENV=development
```

## 📡 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/news` | GET | Get news articles with filters |
| `/api/news/breaking` | GET | Get breaking news |
| `/api/stocks/trending` | GET | Get trending stocks (24h) |
| `/api/stock/prices` | GET | Get live stock prices |
| `/api/search?q=` | GET | Search articles |
| `/api/filters` | GET | Get available filter options |
| `/api/favorites/:userId` | GET | Get user favorites |
| `/api/favorites` | POST | Add favorite stock |
| `/api/favorites/:userId/:ticker` | DELETE | Remove favorite |

### Query Parameters for `/api/news`

| Parameter | Type | Description |
|-----------|------|-------------|
| `ticker` | String | Filter by stock symbol (e.g., RELIANCE) |
| `source` | String | Filter by news source |
| `sentiment` | String | Positive / Negative / Neutral |
| `sector` | String | Filter by sector |
| `page` | Number | Page number (default: 1) |
| `limit` | Number | Items per page (default: 20) |

## 🗄️ Database Schema

### Tables
- **articles** - News articles with sentiment scores
- **tickers** - Stock symbols & company info
- **article_tickers** - Junction table (article ↔ ticker)
- **user_favorites** - User watchlist
- **breaking_news** - Breaking news flags

## ⏰ Automated Tasks

| Task | Schedule | Description |
|------|----------|-------------|
| Feed Fetch | Every 15 minutes | Fetches new articles from all RSS sources |
| Data Cleanup | Every hour | Deletes articles older than 24 hours |
| Stock Prices | Every 30 seconds | Updates live stock prices (frontend) |

## 🎨 Screenshots

### Main Dashboard
- Market indices ticker (NIFTY, SENSEX, BANK NIFTY)
- Breaking news banner
- Live stock prices panel
- News feed with sentiment badges
- Filter tabs (All / NSE-BSE / US / Global)

### Features
- 🔍 Search with autocomplete
- 📊 Color-coded sentiment analysis
- 📈 Real-time price updates
- 🌙 Dark/Light mode
- 📱 Responsive design

## 🔧 Troubleshooting

### Backend won't start
- Check MySQL is running: `mysql -u root`
- Verify `.env` credentials
- Ensure port 3001 is free

### Stock prices show blank
- Yahoo Finance rate limiting may occur
- Prices are cached for 5 minutes
- Restart backend to clear cache

### No articles showing
- Wait for first feed fetch (runs on startup)
- Check backend console for feed errors
- Some sources block automated access

## 🚧 Roadmap

- [ ] Real-time WebSocket updates
- [ ] User authentication
- [ ] Portfolio tracking
- [ ] Price alerts
- [ ] Mobile app (React Native)
- [ ] More Indian regional sources
- [ ] AI-powered news summarization
- [ ] Docker containerization

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Sharat S Unnithan**
- GitHub: [@SHARAT-S-UNNITHAN](https://github.com/SHARAT-S-UNNITHAN)

## ⭐ Star History

If you find this project useful, please consider giving it a star! ⭐

---

Built with ❤️ for Indian Stock Markets 🇮🇳
```

Save and close.

## Push to GitHub:

```powershell
cd C:\ShaLearning\stock-news-aggregator

# Initialize git if not already done
git init
git add README.md
git commit -m "Add comprehensive README"
git branch -M main
git remote add origin https://github.com/SHARAT-S-UNNITHAN/stock-news-aggregator.git
git push -u origin main
```

