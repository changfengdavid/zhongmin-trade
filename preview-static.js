/**
 * 本地预览静态站 —— 模拟 Cloudflare Pages 的访问环境（端口 8101）
 *
 * 用途：构建完 dist/ 后，在浏览器里检查上线后的真实效果，
 *      而不是在本地 Express 环境下看（两者数据来源不同）。
 *
 * 用法：node preview-static.js
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const ROOT = path.join(__dirname, 'dist');
const PORT = 8101;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

if (!fs.existsSync(ROOT)) {
  console.log('[X] 找不到 dist 目录，请先运行：node build-static.js');
  process.exit(1);
}

const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';

  let filePath = path.join(ROOT, urlPath);
  // 防目录穿越
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403); res.end('Forbidden'); return;
  }

  // 目录则尝试 index.html
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  if (!fs.existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>404</h1><p>文件不存在：' + urlPath + '</p>');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, {
    'Content-Type': MIME[ext] || 'application/octet-stream',
    'Cache-Control': 'no-cache',
  });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, '127.0.0.1', () => {
  const url = 'http://127.0.0.1:' + PORT + '/';
  console.log('');
  console.log('========================================');
  console.log('  静态站本地预览已启动');
  console.log('========================================');
  console.log('  地址: ' + url);
  console.log('  说明: 这里的效果 = Cloudflare Pages 上线后的效果');
  console.log('  关闭: 按 Ctrl+C 或直接关掉本窗口');
  console.log('========================================');
  console.log('');
  // 自动打开浏览器（失败不影响服务）
  const cmd = process.platform === 'win32' ? 'start "" "' + url + '"'
    : process.platform === 'darwin' ? 'open "' + url + '"'
      : 'xdg-open "' + url + '"';
  exec(cmd, () => { });
});
