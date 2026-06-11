import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";

const API = "http://localhost:3001/api";

const INDIAN_SOURCES = ["Economic Times", "Moneycontrol", "LiveMint", "The Hindu Business"];
const US_SOURCES = ["Yahoo Finance", "CNBC", "MarketWatch", "Bloomberg"];
const GLOBAL_SOURCES = ["Investing.com", "FXStreet"];

function App() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [ticker, setTicker] = useState("");
  const [source, setSource] = useState("");
  const [sentiment, setSentiment] = useState("");
  const [breaking, setBreaking] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [stockPrices, setStockPrices] = useState([]);
  const [stats, setStats] = useState({ total: 0, bullish: 0, bearish: 0, neutral: 0 });

  const fetchNews = useCallback(async () => {
    setLoading(true);
    try {
      const p = { limit: 200 };
      if (ticker) p.ticker = ticker;
      if (source) p.source = source;
      if (sentiment) p.sentiment = sentiment;
      const r = await axios.get(API + "/news", { params: p });
      const arts = r.data.articles || [];
      setArticles(arts);
      setStats({
        total: arts.length,
        bullish: arts.filter(a => a.sentiment === "Positive").length,
        bearish: arts.filter(a => a.sentiment === "Negative").length,
        neutral: arts.filter(a => a.sentiment === "Neutral").length,
      });
    } catch (e) {}
    setLoading(false);
  }, [ticker, source, sentiment]);

  const fetchStockPrices = useCallback(async () => {
    try {
      const r = await axios.get(API + "/stock/prices");
      setStockPrices(r.data || []);
    } catch (e) {}
  }, []);

  useEffect(() => {
    fetchNews();
    fetchStockPrices();
    axios.get(API + "/news/breaking").then(r => setBreaking(r.data || [])).catch(() => {});
    const newsInterval = setInterval(fetchNews, 300000);
    const priceInterval = setInterval(fetchStockPrices, 30000);
    return () => { clearInterval(newsInterval); clearInterval(priceInterval); };
  }, [fetchNews, fetchStockPrices]);

  const filtered =
    activeTab === "india" ? articles.filter(a => INDIAN_SOURCES.includes(a.source)) :
    activeTab === "us" ? articles.filter(a => US_SOURCES.includes(a.source)) :
    activeTab === "global" ? articles.filter(a => GLOBAL_SOURCES.includes(a.source)) :
    articles;

  const sentStyle = (s) => {
    if (s === "Positive") return { bg: "#e6faf2", c: "#00b386", label: "Bullish" };
    if (s === "Negative") return { bg: "#fde8e8", c: "#e53e3e", label: "Bearish" };
    return { bg: "#f0f0f5", c: "#666", label: "Neutral" };
  };

  const formatPrice = (price, currency) => {
    if (!price) return "--";
    const sym = currency === "INR" ? "₹" : "$";
    return `${sym}${price.toFixed(2)}`;
  };

  const nifty = stockPrices.find(s => s.symbol === "^NSEI");
  const sensex = stockPrices.find(s => s.symbol === "^BSESN");
  const niftyBank = stockPrices.find(s => s.symbol === "^NSEBANK");

  const INDICES = [
    { name: "NIFTY 50", price: nifty?.price, change: nifty?.change, changePercent: nifty?.changePercent, up: nifty?.change >= 0, currency: "INR" },
    { name: "SENSEX", price: sensex?.price, change: sensex?.change, changePercent: sensex?.changePercent, up: sensex?.change >= 0, currency: "INR" },
    { name: "BANK NIFTY", price: niftyBank?.price, change: niftyBank?.change, changePercent: niftyBank?.changePercent, up: niftyBank?.change >= 0, currency: "INR" },
  ];

  const topStocks = stockPrices.filter(s => !s.symbol.startsWith("^")).slice(0, 10);

  return (
    <div style={{ minHeight: "100vh", background: "#f5f7fa", fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #d0d5dd; border-radius: 4px; }
        .card { background: #fff; border-radius: 16px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); transition: all 0.3s; border: 1px solid #f0f0f5; }
        .card:hover { box-shadow: 0 8px 30px rgba(0,0,0,0.08); transform: translateY(-2px); border-color: #e0e0e8; }
        .tab { padding: 10px 20px; border-radius: 30px; border: none; cursor: pointer; font-size: 13px; font-weight: 600; transition: all 0.3s; background: #fff; color: #666; }
        .tab-active { background: #00d09c; color: #fff; box-shadow: 0 4px 15px rgba(0,208,156,0.3); }
        .index-card { background: #fff; border-radius: 12px; padding: 14px 18px; border: 1px solid #f0f0f5; min-width: 165px; }
        .stock-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; border-radius: 10px; cursor: pointer; transition: background 0.2s; }
        .stock-row:hover { background: #f0fdf6; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
        .live-dot { width: 8px; height: 8px; border-radius: 50%; background: #00d09c; animation: pulse 1.5s infinite; }
        input, select { padding: 10px 16px; border-radius: 10px; border: 1px solid #e0e0e8; font-size: 13px; outline: none; font-family: 'Inter', sans-serif; background: #fff; }
        input:focus, select:focus { border-color: #00d09c; }
      `}</style>

      {breaking.length > 0 && (
        <div style={{ background: "linear-gradient(135deg, #ff6b6b, #ee5a24)", color: "#fff", padding: "8px 0" }}>
          <div style={{ maxWidth: 1300, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ background: "#fff", color: "#ee5a24", padding: "3px 12px", borderRadius: 20, fontWeight: 700, fontSize: 11, letterSpacing: 1 }}>LIVE</span>
            <marquee scrollamount="4" style={{ flex: 1, fontSize: 13 }}>
              {breaking.map(n => <span key={n.id} style={{ marginRight: 60 }}>{n.title}</span>)}
            </marquee>
          </div>
        </div>
      )}

      <header style={{ background: "#fff", borderBottom: "1px solid #f0f0f5", padding: "14px 0", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1300, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: "linear-gradient(135deg, #00d09c, #00b386)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, color: "#fff", fontWeight: 900 }}>S</div>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: "#1a1a2e", margin: 0, letterSpacing: -1 }}>StockPulse</h1>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div className="live-dot"></div>
                <p style={{ fontSize: 11, color: "#00b386", margin: 0, fontWeight: 600 }}>Live Market</p>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flex: 1, maxWidth: 400 }}>
            <input placeholder="Search stocks, news..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === "Enter" && fetchNews()} style={{ flex: 1 }} />
            <button onClick={fetchNews} style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: "#00d09c", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>Search</button>
          </div>
        </div>

        <div style={{ maxWidth: 1300, margin: "12px auto 0", padding: "0 24px", display: "flex", gap: 12, overflowX: "auto" }}>
          {INDICES.map(idx => (
            <div className="index-card" key={idx.name}>
              <div style={{ fontSize: 11, color: "#888", fontWeight: 500, marginBottom: 4 }}>{idx.name}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#1a1a2e" }}>{formatPrice(idx.price, idx.currency)}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: idx.up ? "#00b386" : "#e53e3e" }}>
                {idx.changePercent != null ? `${idx.changePercent.toFixed(2)}%` : "--"}
              </div>
            </div>
          ))}
        </div>

        <div style={{ maxWidth: 1300, margin: "14px auto 0", padding: "0 24px", display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <button className={`tab ${activeTab === "all" ? "tab-active" : ""}`} onClick={() => setActiveTab("all")}>All Markets</button>
          <button className={`tab ${activeTab === "india" ? "tab-active" : ""}`} onClick={() => setActiveTab("india")}>NSE / BSE</button>
          <button className={`tab ${activeTab === "us" ? "tab-active" : ""}`} onClick={() => setActiveTab("us")}>US Markets</button>
          <button className={`tab ${activeTab === "global" ? "tab-active" : ""}`} onClick={() => setActiveTab("global")}>Global</button>
          <span style={{ color: "#ddd", margin: "0 4px" }}>|</span>
          <select value={ticker} onChange={e => setTicker(e.target.value)}>
            <option value="">All Stocks</option>
            <optgroup label="NSE/BSE">
              {["RELIANCE","TCS","HDFCBANK","INFY","ICICIBANK","SBIN","TATAMOTORS","BHARTIARTL","ITC","WIPRO","KOTAKBANK","LT","MARUTI","SUNPHARMA","TATASTEEL","NTPC"].map(t => <option key={t} value={t}>{t}</option>)}
            </optgroup>
            <optgroup label="US">
              {["AAPL","TSLA","NVDA","MSFT","GOOGL","AMZN","META"].map(t => <option key={t} value={t}>{t}</option>)}
            </optgroup>
          </select>
          <select value={source} onChange={e => setSource(e.target.value)}>
            <option value="">All Sources</option>
            <optgroup label="India">{INDIAN_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}</optgroup>
            <optgroup label="US">{US_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}</optgroup>
            <optgroup label="Global">{GLOBAL_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}</optgroup>
          </select>
          <select value={sentiment} onChange={e => setSentiment(e.target.value)}>
            <option value="">All Sentiment</option>
            <option value="Positive">Bullish</option>
            <option value="Negative">Bearish</option>
            <option value="Neutral">Neutral</option>
          </select>
          <button onClick={() => { setTicker(""); setSource(""); setSentiment(""); setSearch(""); }} style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #ff6b6b", background: "#fff", color: "#e53e3e", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>Clear</button>
          <button onClick={fetchNews} style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #00d09c", background: "#fff", color: "#00b386", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>Refresh</button>
          <span style={{ marginLeft: "auto", fontSize: 12, color: "#888", fontWeight: 600 }}>
            {stats.total} articles | {stats.bullish} Bullish | {stats.bearish} Bearish
          </span>
        </div>
      </header>

      <div style={{ maxWidth: 1300, margin: "0 auto", padding: "20px 24px", display: "grid", gridTemplateColumns: "280px 1fr", gap: 20 }}>
        
        {/* Stock Price Panel */}
        <div style={{ background: "#fff", borderRadius: 16, padding: 18, border: "1px solid #f0f0f5", height: "fit-content", position: "sticky", top: 200 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1a1a2e", marginBottom: 14 }}>Live Prices</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {topStocks.map(stock => (
              <div key={stock.symbol} className="stock-row" onClick={() => setTicker(stock.symbol)}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1a2e" }}>{stock.symbol}</div>
                  <div style={{ fontSize: 10, color: "#888" }}>{stock.name?.substring(0, 25)}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1a2e" }}>{formatPrice(stock.price, stock.currency)}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: stock.change >= 0 ? "#00b386" : "#e53e3e" }}>
                    {stock.changePercent != null ? `${stock.changePercent.toFixed(2)}%` : "--"}
                  </div>
                </div>
              </div>
            ))}
            {topStocks.length === 0 && <p style={{ fontSize: 12, color: "#888", textAlign: "center", padding: 20 }}>Loading prices...</p>}
          </div>
        </div>

        {/* News Grid */}
        <main>
          {loading ? (
            <div style={{ textAlign: "center", padding: 80 }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", border: "3px solid #f0f0f5", borderTopColor: "#00d09c", animation: "spin 0.8s linear infinite", margin: "0 auto 20px" }}></div>
              <p style={{ color: "#888", fontSize: 14 }}>Loading market data...</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {filtered.map(a => {
                const s = sentStyle(a.sentiment);
                return (
                  <div key={a.id} className="card">
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: 0.5 }}>{a.source}</span>
                      <span style={{ fontSize: 11, color: "#bbb" }}>
                        {a.published_at ? formatDistanceToNow(new Date(a.published_at), { addSuffix: true }) : ""}
                      </span>
                    </div>
                    <a href={a.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 15, fontWeight: 700, color: "#1a1a2e", textDecoration: "none", lineHeight: 1.4, display: "block", marginBottom: 8 }}
                      onMouseEnter={e => e.target.style.color = "#00b386"}
                      onMouseLeave={e => e.target.style.color = "#1a1a2e"}>
                      {a.title}
                    </a>
                    {a.summary && <p style={{ fontSize: 12, color: "#666", lineHeight: 1.5, marginBottom: 12 }}>{a.summary.substring(0, 200)}...</p>}
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                      {a.tickers && a.tickers.split(",").map(t => (
                        <span key={t} onClick={() => setTicker(t)} style={{ padding: "3px 10px", borderRadius: 6, background: "#f0fdf6", fontSize: 11, fontWeight: 600, color: "#00b386", cursor: "pointer", border: "1px solid #d4f5e8" }}>{t}</span>
                      ))}
                      <span style={{ marginLeft: "auto", padding: "4px 12px", borderRadius: 20, background: s.bg, color: s.c, fontSize: 11, fontWeight: 700 }}>{s.label}</span>
                    </div>
                  </div>
                );
              })}
              {filtered.length === 0 && !loading && (
                <div style={{ textAlign: "center", padding: 60, color: "#888" }}>No articles found. Try different filters.</div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
