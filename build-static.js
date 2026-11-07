/**
 * 构建纯静态站点 —— 输出到 dist/
 *
 * 用途：把 Express 版官网转成可直接托管到 Cloudflare Pages / 任意静态托管的纯静态站。
 * 做了什么：
 *   1. 复制 public/ 下除 admin/ 之外的全部文件
 *   2. 把 data/config.json 复制成 dist/config.json（前端静态模式下读它）
 *   3. 移除页面上的「后台」入口（线上没有后端，点了只会 404）
 *
 * 用法：node build-static.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PUB = path.join(ROOT, 'public');
const DATA = path.join(ROOT, 'data');
const DIST = path.join(ROOT, 'dist');

function log(msg) { process.stdout.write(msg + '\n'); }

// 1) 清空 dist
fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });

// 2) 递归复制，跳过 admin
let fileCount = 0;
function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (entry.name === 'admin') continue;
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(s, d);
    } else {
      fs.copyFileSync(s, d);
      fileCount++;
    }
  }
}
copyDir(PUB, DIST);

// 3) 配置数据
const cfgSrc = path.join(DATA, 'config.json');
if (!fs.existsSync(cfgSrc)) {
  log('[X] 找不到 data/config.json，无法构建');
  process.exit(1);
}
fs.copyFileSync(cfgSrc, path.join(DIST, 'config.json'));
fileCount++;

// 4) 去掉后台入口（header）
const indexPath = path.join(DIST, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');
const beforeHtml = html.length;
html = html.replace(/\s*<a href="\/admin\/" class="admin-link"[^>]*>[\s\S]*?<\/a>/, '');
fs.writeFileSync(indexPath, html, 'utf8');

// 5) 去掉后台入口（footer，在 app.js 里拼的）
const appPath = path.join(DIST, 'js', 'app.js');
let js = fs.readFileSync(appPath, 'utf8');
const beforeJs = js.length;
js = js.replace(/\s*&nbsp;\|&nbsp;\s*<a href="\/admin\/"[\s\S]*?<\/a>/, '');
fs.writeFileSync(appPath, js, 'utf8');

// 6) 生成 robots.txt（允许收录，指向站点根）
fs.writeFileSync(path.join(DIST, 'robots.txt'), 'User-agent: *\nAllow: /\n', 'utf8');
fileCount++;

// 7) 体积统计
function dirSize(dir) {
  let total = 0;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    total += e.isDirectory() ? dirSize(p) : fs.statSync(p).size;
  }
  return total;
}
const size = dirSize(DIST);
const hasAdmin = fs.existsSync(path.join(DIST, 'admin'));
const adminLinkLeft = fs.readFileSync(indexPath, 'utf8').includes('/admin/');

log('');
log('========================================');
log('  静态站构建完成 -> dist\\');
log('========================================');
log('  文件数        : ' + fileCount);
log('  体积          : ' + (size / 1024).toFixed(1) + ' KB');
log('  含 admin 目录 : ' + (hasAdmin ? '是（异常）' : '否（正常）'));
log('  残留后台链接  : ' + (adminLinkLeft ? '有（异常）' : '无（正常）'));
log('  header 清理   : ' + (html.length < beforeHtml ? '已移除' : '未找到'));
log('  footer 清理   : ' + (js.length < beforeJs ? '已移除' : '未找到'));
log('========================================');
log('');
log('下一步：把 dist/ 推到 GitHub，Cloudflare Pages 会自动取用。');
