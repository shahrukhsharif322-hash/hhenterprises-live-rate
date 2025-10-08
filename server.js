// server.js
// Simple Node.js + Express proxy that fetches commodity quotes from Yahoo Finance
// and converts them into USD/ton numbers (approx). Run: node server.js

const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 3000;

// Map metals to Yahoo commodity symbols and whether the quote is per lb (true) or already per ton (false)
const METAL_MAP = {
  copper: { symbol: 'HG=F', perLb: true },
  aluminium: { symbol: 'ALI=F', perLb: false },
  zinc: { symbol: 'ZNC=F', perLb: false },
  lead: { symbol: 'PB=F', perLb: false },
  nickel: { symbol: 'NI=F', perLb: false },
  tin: { symbol: 'SN=F', perLb: false }
};

async function fetchYahoo(symbol) {
  const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbol)}`;
  const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if(!r.ok) throw new Error('Yahoo fetch failed: '+r.status);
  const j = await r.json();
  return (j?.quoteResponse?.result?.[0] ?? {});
}

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.get('/api/prices', async (req, res) => {
  try{
    const prices = {};
    for(const key of Object.keys(METAL_MAP)){
      const { symbol, perLb } = METAL_MAP[key];
      const data = await fetchYahoo(symbol);
      let p = data.regularMarketPrice || 0;
      if(!p) p = data.postMarketPrice || data.preMarketPrice || 0;
      if(perLb && p) p = p * 2204.62;
      prices[key] = Number(p || 0);
    }
    const response = { prices, updated: new Date().toISOString() };
    res.json(response);
  }catch(err){
    console.error(err);
    res.status(500).json({ error: String(err) });
  }
});

// Serve static if index.html in same folder
app.use(express.static(__dirname));

app.listen(PORT, ()=>console.log(`Server running on http://localhost:${PORT}`));
