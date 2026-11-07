/* ============================================================
 * 中旻门户 · 后台管理
 * 登录鉴权 + 全站配置编辑 + 图片上传。所有改动写回 data/config.json。
 * ============================================================ */

const ICON_KEYS = ['globe', 'team', 'quality', 'service', 'compliance', 'network', 'export', 'import', 'domestic', 'logistics', 'customs', 'finance'];
const SECTIONS = [
  { id: 'site', label: '公司信息' },
  { id: 'banners', label: '首页轮播' },
  { id: 'about', label: '关于我们' },
  { id: 'advantages', label: '核心优势' },
  { id: 'products', label: '产品管理' },
  { id: 'services', label: '服务管理' },
  { id: 'news', label: '新闻管理' },
  { id: 'partners', label: '合作伙伴' },
  { id: 'certificates', label: '资质证书' },
  { id: 'seo', label: 'SEO 设置' },
  { id: 'password', label: '修改密码' },
];

let CONFIG = null;
let TOKEN = null;

/* ---------- 工具 ---------- */
const esc = (s) => (s == null ? '' : String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'));
const attr = (s) => (s == null ? '' : String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;'));
const getPath = (obj, p) => p.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
const setPath = (obj, p, v) => { const ks = p.split('.'); let o = obj; for (let i = 0; i < ks.length - 1; i++) { if (o[ks[i]] == null) o[ks[i]] = {}; o = o[ks[i]]; } o[ks[ks.length - 1]] = v; };
function toast(msg) { const el = document.getElementById('toast'); el.textContent = msg; el.classList.add('show'); clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('show'), 2200); }
function today() { return new Date().toISOString().slice(0, 10); }

/* ---------- 字段构造 ---------- */
function fText(label, path) { return `<div class="field"><label>${label}</label><input type="text" data-bind="${path}" value="${attr(getPath(CONFIG, path) || '')}"></div>`; }
function fArea(label, path) { return `<div class="field"><label>${label}</label><textarea data-bind="${path}">${esc(getPath(CONFIG, path) || '')}</textarea></div>`; }
function fBi(label, path) {
  return `<div class="field"><label>${label}</label><div class="bi">
    <div><div class="sub">中文</div><input type="text" data-bind="${path}.zh" value="${attr(getPath(CONFIG, path + '.zh') || '')}"></div>
    <div><div class="sub">English</div><input type="text" data-bind="${path}.en" value="${attr(getPath(CONFIG, path + '.en') || '')}"></div></div></div>`;
}
function fBiArea(label, path) {
  return `<div class="field"><label>${label}</label><div class="bi">
    <div><div class="sub">中文</div><textarea data-bind="${path}.zh">${esc(getPath(CONFIG, path + '.zh') || '')}</textarea></div>
    <div><div class="sub">English</div><textarea data-bind="${path}.en">${esc(getPath(CONFIG, path + '.en') || '')}</textarea></div></div></div>`;
}
function fImage(label, path) {
  const url = getPath(CONFIG, path) || '';
  const pid = 'prev_' + path.replace(/\./g, '_');
  return `<div class="field"><label>${label}</label>
    <div class="img-field">
      <div class="img-preview" id="${pid}">${url ? `<img src="${attr(url)}">` : '<span>无图片</span>'}</div>
      <div class="img-actions">
        <input type="file" accept="image/*" style="display:none" id="file_${pid}" data-upload="${path}" data-prev="${pid}">
        <button type="button" class="btn-sm" onclick="document.getElementById('file_${pid}').click()">上传图片</button>
        <button type="button" class="btn-sm danger" onclick="Admin.delImg('${path}','${pid}')">删除</button>
      </div>
      <input type="hidden" data-bind="${path}" value="${attr(url)}">
    </div></div>`;
}
function iconSelect(path, current) {
  return `<div class="field"><label>图标</label><select data-bind="${path}">${ICON_KEYS.map((k) => `<option value="${k}" ${k === current ? 'selected' : ''}>${k}</option>`).join('')}</select></div>`;
}

/* ---------- 列表类区块（轮播/优势/服务/新闻/伙伴/证书） ---------- */
function itemWrap(arrPath, i, inner) {
  return `<div class="list-item" data-idx="${i}"><div class="item-head"><strong>${arrPath} #${i + 1}</strong><button type="button" class="btn-sm danger" onclick="Admin.delItem('${arrPath}',${i})">删除</button></div>${inner}</div>`;
}
function renderListSection(arrPath, itemFn, title, addLabel) {
  const arr = getPath(CONFIG, arrPath) || [];
  const items = arr.map((it, i) => itemWrap(arrPath, i, itemFn(it, i))).join('') || '<div class="empty">暂无内容</div>';
  return `<div class="panel"><h3>${title}</h3><div id="${arrPath}_list">${items}</div>
    <button type="button" class="btn-sm" onclick="Admin.addItem('${arrPath}')">+ ${addLabel}</button></div>`;
}

const ITEM_FNS = {
  banners: (b, i) => `
    <div class="bi"><div><div class="sub">主标题(中)</div><input type="text" data-bind="banners.${i}.title.zh" value="${attr(b.title && b.title.zh || '')}"></div>
    <div><div class="sub">主标题(英)</div><input type="text" data-bind="banners.${i}.title.en" value="${attr(b.title && b.title.en || '')}"></div></div>
    <div class="bi"><div><div class="sub">副标题(中)</div><input type="text" data-bind="banners.${i}.subtitle.zh" value="${attr(b.subtitle && b.subtitle.zh || '')}"></div>
    <div><div class="sub">副标题(英)</div><input type="text" data-bind="banners.${i}.subtitle.en" value="${attr(b.subtitle && b.subtitle.en || '')}"></div></div>
    <div class="bi"><div><div class="sub">按钮(中)</div><input type="text" data-bind="banners.${i}.button.zh" value="${attr(b.button && b.button.zh || '')}"></div>
    <div><div class="sub">按钮(英)</div><input type="text" data-bind="banners.${i}.button.en" value="${attr(b.button && b.button.en || '')}"></div></div>
    <div class="field"><label>跳转链接</label><input type="text" data-bind="banners.${i}.link" value="${attr(b.link || '')}" placeholder="#/products"></div>
    ${fImage('轮播图片', 'banners.' + i + '.image')}`,
  advantages: (a, i) => `${iconSelect('advantages.' + i + '.icon', a.icon)}
    <div class="bi"><div><div class="sub">标题(中)</div><input type="text" data-bind="advantages.${i}.title.zh" value="${attr(a.title && a.title.zh || '')}"></div>
    <div><div class="sub">标题(英)</div><input type="text" data-bind="advantages.${i}.title.en" value="${attr(a.title && a.title.en || '')}"></div></div>
    <div class="bi"><div><div class="sub">描述(中)</div><textarea data-bind="advantages.${i}.desc.zh">${esc(a.desc && a.desc.zh || '')}</textarea></div>
    <div><div class="sub">描述(英)</div><textarea data-bind="advantages.${i}.desc.en">${esc(a.desc && a.desc.en || '')}</textarea></div></div>`,
  services: (s, i) => `${iconSelect('services.' + i + '.icon', s.icon)}
    <div class="bi"><div><div class="sub">标题(中)</div><input type="text" data-bind="services.${i}.title.zh" value="${attr(s.title && s.title.zh || '')}"></div>
    <div><div class="sub">标题(英)</div><input type="text" data-bind="services.${i}.title.en" value="${attr(s.title && s.title.en || '')}"></div></div>
    <div class="bi"><div><div class="sub">描述(中)</div><textarea data-bind="services.${i}.desc.zh">${esc(s.desc && s.desc.zh || '')}</textarea></div>
    <div><div class="sub">描述(英)</div><textarea data-bind="services.${i}.desc.en">${esc(s.desc && s.desc.en || '')}</textarea></div></div>
    ${pointsEditor(i)}`,
  partners: (p, i) => `<div class="field"><label>合作伙伴名称</label><input type="text" data-bind="partners.${i}.name" value="${attr(p.name || '')}"></div>
    ${fImage('Logo', 'partners.' + i + '.logo')}`,
  certificates: (c, i) => `<div class="bi"><div><div class="sub">名称(中)</div><input type="text" data-bind="certificates.${i}.name.zh" value="${attr(c.name && c.name.zh || '')}"></div>
    <div><div class="sub">名称(英)</div><input type="text" data-bind="certificates.${i}.name.en" value="${attr(c.name && c.name.en || '')}"></div></div>
    ${fImage('证书图片', 'certificates.' + i + '.image')}`,
  news: (n, i) => `<div class="row"><div class="field" style="flex:1"><label>ID</label><input type="text" data-bind="news.${i}.id" value="${attr(n.id || '')}"></div>
    <div class="field" style="flex:1"><label>日期</label><input type="text" data-bind="news.${i}.date" value="${attr(n.date || '')}" placeholder="2026-01-01"></div></div>
    <div class="bi"><div><div class="sub">分类(中)</div><input type="text" data-bind="news.${i}.category.zh" value="${attr(n.category && n.category.zh || '')}"></div>
    <div><div class="sub">分类(英)</div><input type="text" data-bind="news.${i}.category.en" value="${attr(n.category && n.category.en || '')}"></div></div>
    <div class="bi"><div><div class="sub">标题(中)</div><input type="text" data-bind="news.${i}.title.zh" value="${attr(n.title && n.title.zh || '')}"></div>
    <div><div class="sub">标题(英)</div><input type="text" data-bind="news.${i}.title.en" value="${attr(n.title && n.title.en || '')}"></div></div>
    ${fImage('封面图', 'news.' + i + '.cover')}
    <div class="bi"><div><div class="sub">摘要(中)</div><textarea data-bind="news.${i}.summary.zh">${esc(n.summary && n.summary.zh || '')}</textarea></div>
    <div><div class="sub">摘要(英)</div><textarea data-bind="news.${i}.summary.en">${esc(n.summary && n.summary.en || '')}</textarea></div></div>
    <div class="bi"><div><div class="sub">正文(中)</div><textarea data-bind="news.${i}.content.zh">${esc(n.content && n.content.zh || '')}</textarea></div>
    <div><div class="sub">正文(英)</div><textarea data-bind="news.${i}.content.en">${esc(n.content && n.content.en || '')}</textarea></div></div>`,
};

const ADD_EMPTY = {
  banners: () => ({ image: '', title: { zh: '', en: '' }, subtitle: { zh: '', en: '' }, button: { zh: '', en: '' }, link: '' }),
  advantages: () => ({ icon: 'globe', title: { zh: '', en: '' }, desc: { zh: '', en: '' } }),
  services: () => ({ icon: 'export', title: { zh: '', en: '' }, desc: { zh: '', en: '' }, points: [] }),
  partners: () => ({ name: '', logo: '' }),
  certificates: () => ({ name: { zh: '', en: '' }, image: '' }),
  news: () => ({ id: 'n-' + Date.now(), date: today(), category: { zh: '', en: '' }, title: { zh: '', en: '' }, cover: '', summary: { zh: '', en: '' }, content: { zh: '', en: '' } }),
};

/* ---------- 服务要点（嵌套数组） ---------- */
function pointsEditor(i) {
  const pts = getPath(CONFIG, 'services.' + i + '.points') || [];
  return `<div class="field"><label>服务要点（中 / 英 各一行）</label><div id="points_${i}">${pts.map((p, j) => pointRow(i, j, p)).join('')}</div>
    <button type="button" class="btn-sm" onclick="Admin.addPoint(${i})">+ 添加要点</button>
    <input type="hidden" data-bind="services.${i}.points" data-type="json" id="points_json_${i}" value="${attr(JSON.stringify(pts))}"></div>`;
}
function pointRow(i, j, p) {
  return `<div class="row" style="margin-bottom:8px">
    <input type="text" style="flex:1" placeholder="中文" value="${attr(p && p.zh || '')}" oninput="Admin.rebuildPoints(${i})">
    <input type="text" style="flex:1" placeholder="English" value="${attr(p && p.en || '')}" oninput="Admin.rebuildPoints(${i})">
    <button type="button" class="btn-sm danger" onclick="Admin.rmPoint(${i},${j})">×</button></div>`;
}

/* ---------- 产品：图集 + 参数编辑器 ---------- */
function galleryEditor(i) {
  const imgs = getPath(CONFIG, 'products.' + i + '.images') || [];
  const thumbs = imgs.map((u, j) => `<div class="g-item"><img src="${attr(u)}"><button type="button" class="x" onclick="Admin.rmImg(${i},${j})">×</button></div>`).join('');
  return `<div class="gallery" id="gal_${i}">${thumbs}</div>
    <input type="file" accept="image/*" style="display:none" id="gal_file_${i}" onchange="Admin.upImg(${i},this)">
    <button type="button" class="btn-sm" onclick="document.getElementById('gal_file_${i}').click()">+ 上传图集图片</button>
    <input type="hidden" data-bind="products.${i}.images" data-type="json" id="gal_json_${i}" value="${attr(JSON.stringify(imgs))}">`;
}
function specRow(i, j, s) {
  return `<div class="row spec-row" style="margin-bottom:8px">
    <input type="text" style="flex:1" placeholder="参数名(中)" data-k="zh" value="${attr(s && s.k && s.k.zh || '')}" oninput="Admin.rebuildSpecs(${i})">
    <input type="text" style="flex:1" placeholder="Param(EN)" data-k="en" value="${attr(s && s.k && s.k.en || '')}" oninput="Admin.rebuildSpecs(${i})">
    <input type="text" style="flex:1" placeholder="参数值(中)" data-v="zh" value="${attr(s && s.v && s.v.zh || '')}" oninput="Admin.rebuildSpecs(${i})">
    <input type="text" style="flex:1" placeholder="Value(EN)" data-v="en" value="${attr(s && s.v && s.v.en || '')}" oninput="Admin.rebuildSpecs(${i})">
    <button type="button" class="btn-sm danger" onclick="Admin.rmSpec(${i},${j})">×</button></div>`;
}
function specsEditor(i) {
  const specs = getPath(CONFIG, 'products.' + i + '.specs') || [];
  return `<div id="specs_${i}">${specs.map((s, j) => specRow(i, j, s)).join('')}</div>
    <button type="button" class="btn-sm" onclick="Admin.addSpec(${i})">+ 添加参数</button>
    <input type="hidden" data-bind="products.${i}.specs" data-type="json" id="specs_json_${i}" value="${attr(JSON.stringify(specs))}">`;
}

/* ---------- 关于我们：历程 / 指标 ---------- */
function msItem(m, i) {
  return `<div class="list-item" data-idx="${i}"><div class="item-head"><strong>节点 ${i + 1}</strong><button type="button" class="btn-sm danger" onclick="Admin.rmMilestone(${i})">删除</button></div>
    <div class="field"><label>年份</label><input type="text" data-bind="about.milestones.${i}.year" value="${attr(m.year || '')}"></div>
    <div class="bi"><div><div class="sub">中文</div><textarea data-bind="about.milestones.${i}.text.zh">${esc(m.text && m.text.zh || '')}</textarea></div>
    <div><div class="sub">English</div><textarea data-bind="about.milestones.${i}.text.en">${esc(m.text && m.text.en || '')}</textarea></div></div></div>`;
}
function stItem(s, i) {
  return `<div class="list-item" data-idx="${i}"><div class="item-head"><strong>指标 ${i + 1}</strong><button type="button" class="btn-sm danger" onclick="Admin.rmStat(${i})">删除</button></div>
    <div class="field"><label>数值</label><input type="text" data-bind="about.stats.${i}.value" value="${attr(s.value || '')}"></div>
    <div class="bi"><div><div class="sub">标签(中)</div><input type="text" data-bind="about.stats.${i}.label.zh" value="${attr(s.label && s.label.zh || '')}"></div>
    <div><div class="sub">标签(英)</div><input type="text" data-bind="about.stats.${i}.label.en" value="${attr(s.label && s.label.en || '')}"></div></div></div>`;
}

/* ---------- 区块渲染 ---------- */
function renderSite() {
  return `<div class="panel"><h3>公司基础信息</h3>
    ${fBi('公司名称', 'site.name')}
    ${fBi('公司简称', 'site.shortName')}
    ${fImage('网站 Logo', 'site.logo')}
    ${fImage('浏览器图标 Favicon', 'site.favicon')}
    ${fBi('品牌标语', 'site.slogan')}
    ${fBiArea('公司简介', 'site.intro')}
  </div>
  <div class="panel"><h3>联系方式</h3>
    ${fBi('公司地址', 'site.contact.address')}
    ${fText('电话', 'site.contact.phone')}
    ${fText('手机', 'site.contact.mobile')}
    ${fText('邮箱', 'site.contact.email')}
    ${fText('微信', 'site.contact.wechat')}
    ${fText('WhatsApp', 'site.contact.whatsapp')}
    ${fBi('工作时间', 'site.contact.workingHours')}
  </div>
  <div class="panel"><h3>社交媒体链接</h3>
    ${fText('LinkedIn', 'site.social.linkedin')}
    ${fText('Facebook', 'site.social.facebook')}
    ${fText('Twitter / X', 'site.social.twitter')}
    ${fText('YouTube', 'site.social.youtube')}
  </div>`;
}
function renderAbout() {
  const ms = (CONFIG.about.milestones || []).map((m, i) => msItem(m, i)).join('') || '<div class="empty">暂无节点</div>';
  const stt = (CONFIG.about.stats || []).map((s, i) => stItem(s, i)).join('') || '<div class="empty">暂无指标</div>';
  return `<div class="panel"><h3>关于我们 · 基础信息</h3>
    ${fBi('板块标题', 'about.title')}
    ${fBiArea('公司简介', 'about.content')}
    ${fBi('愿景', 'about.vision')}
    ${fBi('使命', 'about.mission')}
  </div>
  <div class="panel"><h3>发展历程</h3><div id="ms-list">${ms}</div><button type="button" class="btn-sm" onclick="Admin.addMilestone()">+ 添加节点</button></div>
  <div class="panel"><h3>数据指标</h3><div id="st-list">${stt}</div><button type="button" class="btn-sm" onclick="Admin.addStat()">+ 添加指标</button></div>`;
}
function productItem(p, i) {
  const cats = (CONFIG.productCategories || []).map((c) => `<option value="${c.id}" ${c.id === p.category ? 'selected' : ''}>${esc(c.name.zh || c.name.en || c.id)}</option>`).join('');
  return `<div class="list-item" data-idx="${i}"><div class="item-head"><strong>产品 #${i + 1}</strong><button type="button" class="btn-sm danger" onclick="Admin.rmProduct(${i})">删除</button></div>
    <div class="bi"><div><div class="sub">产品名称(中)</div><input type="text" data-bind="products.${i}.name.zh" value="${attr(p.name && p.name.zh || '')}"></div>
    <div><div class="sub">产品名称(英)</div><input type="text" data-bind="products.${i}.name.en" value="${attr(p.name && p.name.en || '')}"></div></div>
    <div class="row" style="margin-top:12px">
      <div class="field" style="flex:1"><label>分类</label><select data-bind="products.${i}.category">${cats}</select></div>
      <div class="field" style="flex:1"><label>产品ID</label><input type="text" data-bind="products.${i}.id" value="${attr(p.id || '')}"></div>
      <div class="field"><label>设为精选</label><div style="padding-top:8px"><input type="checkbox" data-bind="products.${i}.featured" ${p.featured ? 'checked' : ''}></div></div>
    </div>
    <div class="bi"><div><div class="sub">简述(中)</div><textarea data-bind="products.${i}.summary.zh">${esc(p.summary && p.summary.zh || '')}</textarea></div>
    <div><div class="sub">简述(英)</div><textarea data-bind="products.${i}.summary.en">${esc(p.summary && p.summary.en || '')}</textarea></div></div>
    <div class="bi"><div><div class="sub">详情(中)</div><textarea data-bind="products.${i}.description.zh">${esc(p.description && p.description.zh || '')}</textarea></div>
    <div><div class="sub">详情(英)</div><textarea data-bind="products.${i}.description.en">${esc(p.description && p.description.en || '')}</textarea></div></div>
    ${fImage('封面图', 'products.' + i + '.cover')}
    <div class="field"><label>产品图集</label>${galleryEditor(i)}</div>
    <div class="field"><label>产品参数</label>${specsEditor(i)}</div>
  </div>`;
}
function renderProducts() {
  const arr = CONFIG.products || [];
  const items = arr.map((p, i) => productItem(p, i)).join('') || '<div class="empty">暂无产品</div>';
  return `<div class="panel"><h3>产品管理</h3>
    <div class="hint" style="margin-bottom:12px">图片可上传；图集与参数支持增删。保存后前台即时生效。</div>
    <div id="prod-list">${items}</div>
    <button type="button" class="btn-sm" onclick="Admin.addProduct()">+ 添加产品</button></div>`;
}
function renderSeo() {
  return `<div class="panel"><h3>SEO 设置</h3>${fBi('关键词', 'seo.keywords')}${fBiArea('网站描述', 'seo.description')}</div>`;
}
function renderPassword() {
  return `<div class="panel"><h3>修改管理员密码</h3>
    <div class="field"><label>原密码</label><input type="password" id="pw_old"></div>
    <div class="field"><label>新密码</label><input type="password" id="pw_new"></div>
    <div class="field"><label>确认新密码</label><input type="password" id="pw_cf"></div>
    <button class="btn" onclick="Admin.changePassword()">确认修改</button></div>`;
}
function renderSection(id) {
  switch (id) {
    case 'site': return renderSite();
    case 'banners': return renderListSection('banners', ITEM_FNS.banners, '首页轮播图', '添加轮播');
    case 'about': return renderAbout();
    case 'advantages': return renderListSection('advantages', ITEM_FNS.advantages, '核心优势', '添加优势');
    case 'products': return renderProducts();
    case 'services': return renderListSection('services', ITEM_FNS.services, '服务管理', '添加服务');
    case 'news': return renderListSection('news', ITEM_FNS.news, '新闻管理', '添加新闻');
    case 'partners': return renderListSection('partners', ITEM_FNS.partners, '合作伙伴', '添加合作伙伴');
    case 'certificates': return renderListSection('certificates', ITEM_FNS.certificates, '资质证书', '添加证书');
    case 'seo': return renderSeo();
    case 'password': return renderPassword();
    default: return '';
  }
}

/* ---------- 收集与保存 ---------- */
function collect() {
  document.querySelectorAll('#admin-content [data-bind]').forEach((el) => {
    const p = el.dataset.bind;
    let v;
    if (el.dataset.type === 'json') { try { v = JSON.parse(el.value || '[]'); } catch (e) { v = []; } }
    else if (el.type === 'checkbox') v = el.checked;
    else v = el.value;
    setPath(CONFIG, p, v);
  });
}
async function uploadFile(file) {
  const fd = new FormData();
  fd.append('file', file);
  const r = await fetch('/api/upload', { method: 'POST', headers: { 'Authorization': 'Bearer ' + TOKEN }, body: fd });
  if (!r.ok) throw new Error('upload');
  const j = await r.json();
  return j.url;
}
function bindUploads() {
  document.querySelectorAll('#admin-content [data-upload]').forEach((inp) => { inp.onchange = () => Admin.handleUpload(inp); });
}

/* ---------- 登录 / 框架 ---------- */
function showLogin() { document.getElementById('login').style.display = 'flex'; document.getElementById('app').style.display = 'none'; }
function renderSidebar() {
  document.getElementById('side-nav').innerHTML = SECTIONS.map((s) => `<a data-id="${s.id}">${s.label}</a>`).join('');
  document.querySelectorAll('#side-nav a').forEach((a) => { a.onclick = () => switchSection(a.dataset.id); });
}
function switchSection(id) {
  collect();
  const sec = SECTIONS.find((s) => s.id === id) || SECTIONS[0];
  document.querySelectorAll('#side-nav a').forEach((a) => a.classList.toggle('active', a.dataset.id === id));
  document.getElementById('page-title').textContent = sec.label;
  document.getElementById('admin-content').innerHTML = renderSection(id);
  bindUploads();
}

/* ---------- Admin 对象（供页面内联调用） ---------- */
const Admin = {
  handleUpload: async function (input) {
    const file = input.files[0]; if (!file) return;
    try {
      const url = await uploadFile(file);
      const hidden = document.querySelector('input[data-bind="' + input.dataset.upload + '"]');
      if (hidden) hidden.value = url;
      const p = document.getElementById(input.dataset.prev);
      if (p) p.innerHTML = '<img src="' + url + '">';
      toast('图片已上传');
    } catch (e) { toast('上传失败，请重试'); }
  },
  delImg: function (path, pid) {
    const hidden = document.querySelector('input[data-bind="' + path + '"]'); if (hidden) hidden.value = '';
    const p = document.getElementById(pid); if (p) p.innerHTML = '<span>无图片</span>';
  },
  upImg: async function (i, input) {
    const file = input.files[0]; if (!file) return;
    try {
      const url = await uploadFile(file);
      const hid = document.getElementById('gal_json_' + i);
      const arr = JSON.parse(hid.value || '[]'); arr.push(url); hid.value = JSON.stringify(arr);
      document.getElementById('gal_' + i).innerHTML = arr.map((u, j) => `<div class="g-item"><img src="${attr(u)}"><button type="button" class="x" onclick="Admin.rmImg(${i},${j})">×</button></div>`).join('');
      toast('已添加图片');
    } catch (e) { toast('上传失败'); }
  },
  rmImg: function (i, j) {
    const hid = document.getElementById('gal_json_' + i);
    const arr = JSON.parse(hid.value || '[]'); arr.splice(j, 1); hid.value = JSON.stringify(arr);
    document.getElementById('gal_' + i).innerHTML = arr.map((u, k) => `<div class="g-item"><img src="${attr(u)}"><button type="button" class="x" onclick="Admin.rmImg(${i},${k})">×</button></div>`).join('');
  },
  rebuildSpecs: function (i) {
    const rows = document.querySelectorAll('#specs_' + i + ' .spec-row');
    const arr = [...rows].map((r) => ({ k: { zh: r.querySelector('[data-k=zh]').value, en: r.querySelector('[data-k=en]').value }, v: { zh: r.querySelector('[data-v=zh]').value, en: r.querySelector('[data-v=en]').value } }));
    document.getElementById('specs_json_' + i).value = JSON.stringify(arr);
  },
  addSpec: function (i) { Admin.rebuildSpecs(i); const hid = document.getElementById('specs_json_' + i); const arr = JSON.parse(hid.value || '[]'); arr.push({ k: { zh: '', en: '' }, v: { zh: '', en: '' } }); hid.value = JSON.stringify(arr); document.getElementById('specs_' + i).innerHTML = arr.map((s, j) => specRow(i, j, s)).join(''); },
  rmSpec: function (i, j) { Admin.rebuildSpecs(i); const hid = document.getElementById('specs_json_' + i); const arr = JSON.parse(hid.value || '[]'); arr.splice(j, 1); hid.value = JSON.stringify(arr); document.getElementById('specs_' + i).innerHTML = arr.map((s, k) => specRow(i, k, s)).join(''); },
  rebuildPoints: function (i) {
    const rows = document.querySelectorAll('#points_' + i + ' .row');
    const arr = [...rows].map((r) => ({ zh: r.querySelectorAll('input')[0].value, en: r.querySelectorAll('input')[1].value }));
    document.getElementById('points_json_' + i).value = JSON.stringify(arr);
  },
  addPoint: function (i) { Admin.rebuildPoints(i); const hid = document.getElementById('points_json_' + i); const arr = JSON.parse(hid.value || '[]'); arr.push({ zh: '', en: '' }); hid.value = JSON.stringify(arr); document.getElementById('points_' + i).innerHTML = arr.map((p, j) => pointRow(i, j, p)).join(''); },
  rmPoint: function (i, j) { Admin.rebuildPoints(i); const hid = document.getElementById('points_json_' + i); const arr = JSON.parse(hid.value || '[]'); arr.splice(j, 1); hid.value = JSON.stringify(arr); document.getElementById('points_' + i).innerHTML = arr.map((p, k) => pointRow(i, k, p)).join(''); },
  addItem: function (arrPath) { collect(); getPath(CONFIG, arrPath).push(ADD_EMPTY[arrPath]()); refreshList(arrPath); },
  delItem: function (arrPath, i) { collect(); getPath(CONFIG, arrPath).splice(i, 1); refreshList(arrPath); },
  addProduct: function () { collect(); CONFIG.products.push({ id: 'p-' + Date.now(), category: (CONFIG.productCategories[0] || {}).id, name: { zh: '', en: '' }, cover: '', images: [], summary: { zh: '', en: '' }, description: { zh: '', en: '' }, specs: [], featured: false }); refreshProducts(); },
  rmProduct: function (i) { collect(); CONFIG.products.splice(i, 1); refreshProducts(); },
  addMilestone: function () { collect(); CONFIG.about.milestones.push({ year: '', text: { zh: '', en: '' } }); document.getElementById('ms-list').innerHTML = CONFIG.about.milestones.map((m, j) => msItem(m, j)).join('') || '<div class="empty">暂无</div>'; bindUploads(); },
  rmMilestone: function (i) { collect(); CONFIG.about.milestones.splice(i, 1); document.getElementById('ms-list').innerHTML = CONFIG.about.milestones.map((m, j) => msItem(m, j)).join('') || '<div class="empty">暂无</div>'; bindUploads(); },
  addStat: function () { collect(); CONFIG.about.stats.push({ value: '', label: { zh: '', en: '' } }); document.getElementById('st-list').innerHTML = CONFIG.about.stats.map((s, j) => stItem(s, j)).join('') || '<div class="empty">暂无</div>'; bindUploads(); },
  rmStat: function (i) { collect(); CONFIG.about.stats.splice(i, 1); document.getElementById('st-list').innerHTML = CONFIG.about.stats.map((s, j) => stItem(s, j)).join('') || '<div class="empty">暂无</div>'; bindUploads(); },
  saveAll: async function () {
    collect();
    const r = await fetch('/api/config', { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + TOKEN }, body: JSON.stringify(CONFIG) });
    if (r.ok) toast('已保存，前台即时生效');
    else if (r.status === 401) { toast('登录已失效，请重新登录'); showLogin(); }
    else toast('保存失败，请重试');
  },
  changePassword: async function () {
    const oldv = document.getElementById('pw_old').value;
    const nv = document.getElementById('pw_new').value;
    const cf = document.getElementById('pw_cf').value;
    if (nv !== cf) { toast('两次输入不一致'); return; }
    const r = await fetch('/api/password', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + TOKEN }, body: JSON.stringify({ oldPassword: oldv, newPassword: nv }) });
    if (r.ok) { toast('密码已修改，请重新登录'); TOKEN = null; localStorage.removeItem('zm_admin'); setTimeout(showLogin, 800); }
    else { const j = await r.json().catch(() => ({})); toast(j.error || '修改失败'); }
  },
};
window.Admin = Admin;

function refreshList(arrPath) {
  const arr = getPath(CONFIG, arrPath) || [];
  const c = document.getElementById(arrPath + '_list');
  if (c) c.innerHTML = arr.map((it, i) => itemWrap(arrPath, i, ITEM_FNS[arrPath](it, i))).join('') || '<div class="empty">暂无内容</div>';
  bindUploads();
}
function refreshProducts() {
  const arr = CONFIG.products || [];
  document.getElementById('prod-list').innerHTML = arr.map((p, i) => productItem(p, i)).join('') || '<div class="empty">暂无产品</div>';
  bindUploads();
}

/* ---------- 启动 ---------- */
async function login() {
  const pw = document.getElementById('pwd').value;
  const r = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: pw }) });
  if (r.ok) { const j = await r.json(); TOKEN = j.token; localStorage.setItem('zm_admin', TOKEN); document.getElementById('login-err').textContent = ''; showApp(); }
  else document.getElementById('login-err').textContent = '密码错误，请重试';
}
function showApp() {
  document.getElementById('login').style.display = 'none';
  document.getElementById('app').style.display = 'flex';
  renderSidebar();
  switchSection('site');
}
async function boot() {
  try {
    const r = await fetch('/api/config');
    if (!r.ok) throw 0;
    CONFIG = await r.json();
  } catch (e) {
    document.getElementById('login-err').textContent = '无法连接服务，请确认后端已启动';
    showLogin();
    return;
  }
  TOKEN = localStorage.getItem('zm_admin') || null;
  if (TOKEN) showApp(); else showLogin();
}

document.getElementById('login-btn').onclick = login;
document.getElementById('pwd').addEventListener('keydown', (e) => { if (e.key === 'Enter') login(); });
document.getElementById('logout-btn').onclick = () => { TOKEN = null; localStorage.removeItem('zm_admin'); showLogin(); };
document.getElementById('save-btn').onclick = () => Admin.saveAll();
boot();
