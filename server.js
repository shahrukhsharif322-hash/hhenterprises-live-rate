// server.js
// Node.js + Express proxy for live metal rates via Yahoo Finance
// Works perfectly on Render (handles async, CORS, and static hosting)

const express = require('express');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const app = express();
const PORT = process.env.PORT || 3000;

// Map metals to Yahoo Finance symbols
const METAL_MAP = {
  copper: { symbol: 'HG=F', perLb: true },
  aluminium: { symbol: 'ALI=F', perLb: false },
  zinc: { symbol: 'ZNC=F', perLb: false },
  lead: { symbol: 'PB=F', perLb: false },
  nickel: { symbol: 'NI=F', perLb: false },
  tin: { symbol: 'SN=F', perLb: false }
};

// Allow public access from your frontend
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

async function fetchYahoo(symbol) {
  const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbol)}`;
  const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!r.ok) throw new Error('Yahoo fetch failed: ' + r.status);
  const j = await r.json();
  return j?.quoteResponse?.result?.[0] ?? {};
}

app.get('/api/prices', async (req, res) => {
  try {
    const prices = {};
    for (const key of Object.keys(METAL_MAP)) {
      const { symbol, perLb } = METAL_MAP[key];
      const data = await fetchYahoo(symbol);
      let p = data.regularMarketPrice || 0;
      if (!p) p = data.postMarketPrice || data.preMarketPrice || 0;
      if (perLb && p) p = p * 2204.62; // lb → ton
      prices[key] = Number(p.toFixed(2));
    }
    res.json({ prices, updated: new Date().toISOString() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: String(err) });
  }
});

// Serve frontend files (optional if hosted together)
app.use(express.static(__dirname));

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
