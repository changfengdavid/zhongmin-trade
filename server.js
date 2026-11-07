/**
 * 青岛中旻国际贸易有限公司 —— 可配置双语公司网站门户
 * 后端：Express 静态托管 + 配置读写 + 图片上传 + 管理员鉴权
 *
 * 设计原则（与用户既往偏好一致）：
 *  - 数据全部落在本地磁盘（data/config.json、public/uploads），不上云
 *  - B/S 架构，浏览器即可访问，本机启动后同网段/映射外网均可访问
 *  - 所有内容可在后台管理面板配置，无需改代码
 */

const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 8080;

const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT, 'public');
const DATA_DIR = path.join(ROOT, 'data');
const UPLOAD_DIR = path.join(PUBLIC_DIR, 'uploads');
const CONFIG_PATH = path.join(DATA_DIR, 'config.json');
const ADMIN_PATH = path.join(DATA_DIR, 'admin.json');
const TOKENS_PATH = path.join(DATA_DIR, 'tokens.json');

// ---------- 基础保障：目录与文件存在 ----------
[DATA_DIR, UPLOAD_DIR].forEach((d) => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

// 管理员凭据（首次启动写入，默认密码 admin123，可在后台修改）
let admin = { password: process.env.ADMIN_PASSWORD || 'admin123' };
if (fs.existsSync(ADMIN_PATH)) {
  try { admin = JSON.parse(fs.readFileSync(ADMIN_PATH, 'utf8')); } catch (e) {}
}
function saveAdmin() { fs.writeFileSync(ADMIN_PATH, JSON.stringify(admin, null, 2)); }

// 登录令牌（重启后仍有效）
let tokens = new Set();
if (fs.existsSync(TOKENS_PATH)) {
  try { tokens = new Set(JSON.parse(fs.readFileSync(TOKENS_PATH, 'utf8'))); } catch (e) {}
}
function saveTokens() { fs.writeFileSync(TOKENS_PATH, JSON.stringify([...tokens])); }

// 配置读写
function readConfig() {
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
}
function writeConfig(cfg) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2));
}

// ---------- 中间件 ----------
app.use(express.json({ limit: '12mb' }));
app.use(express.static(PUBLIC_DIR));

// 鉴权中间件（后台接口）
function requireAuth(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : '';
  if (tokens.has(token)) return next();
  return res.status(401).json({ error: 'unauthorized' });
}

// ---------- 公开接口 ----------
// 获取全站配置（公开站点渲染用）
app.get('/api/config', (req, res) => {
  try {
    res.json(readConfig());
  } catch (e) {
    res.status(500).json({ error: 'config read failed' });
  }
});

// ---------- 鉴权接口 ----------
app.post('/api/login', (req, res) => {
  const { password } = req.body || {};
  if (typeof password === 'string' && password === admin.password) {
    const token = crypto.randomBytes(24).toString('hex');
    tokens.add(token);
    saveTokens();
    return res.json({ token });
  }
  res.status(401).json({ error: '密码错误 / invalid password' });
});

app.post('/api/logout', requireAuth, (req, res) => {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : '';
  tokens.delete(token);
  saveTokens();
  res.json({ ok: true });
});

// 修改管理员密码
app.post('/api/password', requireAuth, (req, res) => {
  const { oldPassword, newPassword } = req.body || {};
  if (oldPassword !== admin.password) return res.status(400).json({ error: '原密码不正确' });
  if (!newPassword || newPassword.length < 4) return res.status(400).json({ error: '新密码至少 4 位' });
  admin.password = newPassword;
  saveAdmin();
  // 密码变更后使所有令牌失效，强制重新登录
  tokens.clear();
  saveTokens();
  res.json({ ok: true });
});

// ---------- 配置保存（整份覆盖，后台编辑后提交） ----------
app.put('/api/config', requireAuth, (req, res) => {
  try {
    const cfg = req.body;
    if (!cfg || typeof cfg !== 'object') return res.status(400).json({ error: 'invalid config' });
    writeConfig(cfg);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'save failed' });
  }
});

// ---------- 图片上传 ----------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase().slice(0, 10);
    const name = crypto.randomBytes(12).toString('hex') + ext;
    cb(null, name);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 12 * 1024 * 1024, files: 20 },
  fileFilter: (req, file, cb) => {
    const ok = /\.(jpe?g|png|gif|webp|svg|avif|bmp)$/i.test(file.originalname);
    cb(ok ? null : new Error('仅支持图片格式'), ok);
  },
});

// 单图上传
app.post('/api/upload', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: '未收到文件' });
  res.json({ url: '/uploads/' + req.file.filename });
});

// 多图上传（产品图集等）
app.post('/api/upload/multi', requireAuth, upload.array('files', 20), (req, res) => {
  if (!req.files || !req.files.length) return res.status(400).json({ error: '未收到文件' });
  res.json({ urls: req.files.map((f) => '/uploads/' + f.filename) });
});

// 删除图片（按 url 路径）
app.delete('/api/image', requireAuth, (req, res) => {
  const { url } = req.body || {};
  if (!url || typeof url !== 'string') return res.status(400).json({ error: 'invalid url' });
  const safe = url.replace(/^\/uploads\//, '').replace(/[^a-zA-Z0-9._-]/g, '');
  const full = path.join(UPLOAD_DIR, safe);
  if (!fs.existsSync(full)) return res.status(404).json({ error: 'not found' });
  fs.unlinkSync(full);
  res.json({ ok: true });
});

// ---------- 启动 ----------
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[中旻门户] 已启动： http://localhost:${PORT}`);
  console.log(`[中旻门户] 后台管理： http://localhost:${PORT}/admin/`);
  console.log(`[中旻门户] 默认管理员密码： ${admin.password}（请在后台尽快修改）`);
});
