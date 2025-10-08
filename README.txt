H&H Enterprises - Live Rate Dashboard
Files:
- index.html  (frontend - dark theme, Gold & Black)
- logo.svg    (brand logo)
- server.js   (Node.js proxy to fetch live prices)

Quick start (local):
1) Save files in a folder, open terminal in that folder.
2) Run:
   npm init -y
   npm install express@4 node-fetch@2
3) Start server:
   node server.js
4) Open the page in your browser:
   http://localhost:3000/index.html

Notes:
- The proxy fetches Yahoo Finance commodity quotes and converts to USD/ton (some symbols are per lb).
- If server is not running, index.html will still open but live prices will not load.
- To deploy online, you can use Render, Replit, or any Node host. I can help deploy if you want.
