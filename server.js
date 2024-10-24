const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
require('dotenv').config();

const app = express();

// CORSの設定
app.use(cors());

// 基本的なロギングミドルウェア
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// プロキシのルート設定
const proxy = createProxyMiddleware({
  target: process.env.TARGET_URL || 'http://localhost:3000',
  changeOrigin: true,
  pathRewrite: {
    '^/api/': '/', // /api/のパスを/に書き換え
  },
  onProxyReq: (proxyReq, req, res) => {
    // リクエストヘッダーの追加や変更が必要な場合
    proxyReq.setHeader('X-Proxy-Custom', 'proxy-server');
  },
  onProxyRes: (proxyRes, req, res) => {
    // レスポンスヘッダーの追加や変更が必要な場合
    proxyRes.headers['x-proxy-response'] = 'handled-by-proxy';
  },
  onError: (err, req, res) => {
    console.error('Proxy Error:', err);
    res.status(500).send('Proxy Error');
  }
});

// プロキシルートの設定
app.use('/api', proxy);

// ヘルスチェックエンドポイント
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Proxy server is running on port ${PORT}`);
});
