// API 余额 - CORS 代理服务器
// 用法: node server.js
// 大多数 LLM API 不允许浏览器直接调用 (CORS限制)，此代理转发请求

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3456;
const ROOT = __dirname;

// 允许代理的 API 域名
const ALLOWED_HOSTS = [
  'api.openai.com',
  'api.anthropic.com',
  'generativelanguage.googleapis.com',
  'api.deepseek.com',
  'openrouter.ai',
  'api.groq.com',
];

// MIME types for static files
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

function serveFile(relPath, res) {
  const safe = path.normalize(relPath).replace(/^[/\\]+/, '').replace(/\.\.[/\\]/g, '');
  const filePath = path.join(ROOT, safe);
  const ext = path.extname(filePath);
  const mime = MIME[ext] || 'application/octet-stream';
  try {
    const content = fs.readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': mime });
    res.end(content);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
}

const server = http.createServer((req, res) => {
  // CORS headers - 允许任何来源（仅限本地使用）
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // GET / 健康检查
  if (req.url === '/' || req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('🟢 API余额代理运行中 · <a href="index.html">打开应用</a>');
    return;
  }

  // Static files (before /proxy check)
  if (req.method === 'GET' && !req.url.startsWith('/proxy')) {
    const urlPath = req.url.split('?')[0];
    if (['/index.html', '/manifest.json', '/sw.js'].includes(urlPath) || urlPath.startsWith('/icons/')) {
      return serveFile(urlPath, res);
    }
  }

  // 解析目标 URL: /proxy?url=https://api.openai.com/v1/models
  const url = new URL(req.url, `http://${req.headers.host}`);
  const targetUrl = url.searchParams.get('url');

  if (!targetUrl) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: '缺少 url 参数' }));
    return;
  }

  let parsed;
  try {
    parsed = new URL(targetUrl);
  } catch {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: '无效的 URL' }));
    return;
  }

  if (!ALLOWED_HOSTS.includes(parsed.hostname)) {
    res.writeHead(403, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: `不允许的域名: ${parsed.hostname}` }));
    return;
  }

  // 转发请求
  const bodyChunks = [];
  req.on('data', c => bodyChunks.push(c));
  req.on('end', () => {
    const body = Buffer.concat(bodyChunks);

    const options = {
      hostname: parsed.hostname,
      port: 443,
      path: parsed.pathname + parsed.search,
      method: req.method,
      headers: { ...req.headers },
    };
    // 清理不需要转发的头部
    delete options.headers.host;
    delete options.headers.origin;
    delete options.headers.referer;
    if (!body.length) delete options.headers['content-length'];

    const proxyReq = https.request(options, proxyRes => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    });

    proxyReq.on('error', err => {
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: `代理请求失败: ${err.message}` }));
    });

    if (body.length) proxyReq.write(body);
    proxyReq.end();
  });
});

server.listen(PORT, () => {
  console.log(`🔑 API余额代理服务器运行在 http://localhost:${PORT}`);
  console.log(`📱 在同 WiFi 下用手机访问: http://<本机IP>:${PORT}/index.html`);
  console.log(`   支持的 API: ${ALLOWED_HOSTS.join(', ')}`);
});
