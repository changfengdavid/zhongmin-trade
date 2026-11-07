/* ============================================================
 * 青岛中旻国际贸易有限公司 —— 公开站点前端
 * 纯前端渲染：从 /api/config 读取配置，按语言渲染，无需构建。
 * ============================================================ */

const ICONS = {
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18"/>',
  team: '<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3 2.5-5 6-5s6 2 6 5"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14c3 .3 5 2 5 5"/>',
  quality: '<path d="M12 3l2.5 5 5.5.8-4 4 1 5.4L12 20l-5 2.2 1-5.4-4-4 5.5-.8z"/>',
  service: '<path d="M12 2v4M12 18v4M2 12h4M18 12h4"/><circle cx="12" cy="12" r="5"/>',
  compliance: '<path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/><path d="M9 12l2 2 4-4"/>',
  network: '<circle cx="12" cy="12" r="2.5"/><circle cx="5" cy="6" r="2"/><circle cx="19" cy="6" r="2"/><circle cx="5" cy="18" r="2"/><circle cx="19" cy="18" r="2"/><path d="M6.5 7.5l4 4M17.5 7.5l-4 4M6.5 16.5l4-4M17.5 16.5l-4-4"/>',
  export: '<path d="M12 15V3M8 7l4-4 4 4"/><path d="M4 13v6h16v-6"/>',
  import: '<path d="M12 3v12M8 11l4 4 4-4"/><path d="M4 13v6h16v-6"/>',
  domestic: '<path d="M3 11l9-7 9 7"/><path d="M5 10v9h14v-9"/><path d="M10 19v-5h4v5"/>',
  logistics: '<path d="M2 7h11v9H2zM13 10h5l3 3v3h-8z"/><circle cx="6" cy="18" r="1.8"/><circle cx="17" cy="18" r="1.8"/>',
  customs: '<path d="M4 21V8l8-5 8 5v13"/><path d="M4 21h16M9 21v-6h6v6"/>',
  finance: '<path d="M3 21h18M6 17V9M12 17V5M18 17v-6"/><path d="M3 21V17"/>',
  pin: '<path d="M12 22s7-6.5 7-12a7 7 0 10-14 0c0 5.5 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/>',
  phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>',
};

let CONFIG = null;
let lang = localStorage.getItem('zm_lang') || 'zh';
let sliderTimer = null;

const $ = (s) => document.querySelector(s);
const t = (o) => (o && typeof o === 'object') ? (o[lang] ?? o.zh ?? '') : (o || '');
const esc = (s) => (s == null ? '' : String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'));

function svg(name, cls) {
  return `<svg viewBox="0 0 24 24" class="${cls || ''}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[name] || ''}</svg>`;
}

/* 图片或占位（无图时显示渐变 + 文字） */
function media(url, label, cls) {
  if (url) return `<div class="${cls || ''}" style="background-image:url('${esc(url)}')"></div>`;
  const txt = (label ? esc(t(label)) : '');
  return `<div class="${cls || ''} ph">${txt}</div>`;
}

const NAV = [
  { route: 'home', zh: '首页', en: 'Home' },
  { route: 'about', zh: '关于我们', en: 'About' },
  { route: 'products', zh: '产品中心', en: 'Products' },
  { route: 'services', zh: '服务优势', en: 'Services' },
  { route: 'news', zh: '新闻动态', en: 'News' },
  { route: 'contact', zh: '联系我们', en: 'Contact' },
];

/* ---------------- 顶部 / 底部 ---------------- */
function renderHeader() {
  const s = CONFIG.site;
  $('#brand-name').textContent = t(s.shortName);
  $('#brand-en').textContent = t(s.name);
  const logo = $('#brand-logo');
  logo.innerHTML = s.logo
    ? `<img src="${esc(s.logo)}" alt="logo"/>`
    : (t(s.shortName) || '中').slice(0, 1);
  $('#main-nav').innerHTML = NAV.map((n) =>
    `<a href="#/${n.route}" data-route="${n.route}">${t(n)}</a>`
  ).join('');
}

function renderFooter() {
  const s = CONFIG.site, c = s.contact;
  $('#site-footer').innerHTML = `
    <div class="container">
      <div class="footer-grid">
        <div>
          <h4>${esc(t(s.name))}</h4>
          <p>${esc(t(s.intro)).slice(0, 120)}…</p>
          <p style="color:var(--gold-soft);font-weight:600">${esc(t(s.slogan))}</p>
        </div>
        <div>
          <h4>${lang === 'zh' ? '快速导航' : 'Quick Links'}</h4>
          ${NAV.map((n) => `<a href="#/${n.route}">${t(n)}</a>`).join('')}
        </div>
        <div>
          <h4>${lang === 'zh' ? '产品品类' : 'Products'}</h4>
          ${CONFIG.productCategories.map((cat) => `<a href="#/products/${cat.id}">${esc(t(cat.name))}</a>`).join('')}
        </div>
        <div>
          <h4>${lang === 'zh' ? '联系我们' : 'Contact'}</h4>
          <p>${esc(t(c.address))}</p>
          <p>${esc(c.phone)} ${esc(c.mobile)}</p>
          <p>${esc(c.email)}</p>
        </div>
      </div>
      <div class="footer-bottom">
        © ${new Date().getFullYear()} ${esc(t(s.name))}. ${lang === 'zh' ? '版权所有' : 'All Rights Reserved'}.
        &nbsp;|&nbsp; <a href="/admin/" style="display:inline;color:#9fb1c4">${lang === 'zh' ? '后台管理' : 'Admin'}</a>
      </div>
    </div>`;
}

/* ---------------- 视图：首页 ---------------- */
function viewHome() {
  const s = CONFIG.site;
  const banners = CONFIG.banners.length ? CONFIG.banners : [{}];
  const slides = banners.map((b, i) => {
    const bg = b.image ? `style="background-image:url('${esc(b.image)}')"` : 'class="gradient"';
    return `<div class="hero-slide ${i === 0 ? 'active' : ''}" ${bg}>
      <div class="container hero-content">
        <h1>${esc(t(b.title) || t(s.slogan))}</h1>
        <p>${esc(t(b.subtitle) || t(s.intro).slice(0, 80))}</p>
        ${b.button ? `<a class="btn" href="${esc(b.link || '#/services')}">${esc(t(b.button))} →</a>` : ''}
      </div>
    </div>`;
  }).join('');
  const dots = banners.map((_, i) => `<button data-i="${i}" class="${i === 0 ? 'active' : ''}"></button>`).join('');

  const feat = CONFIG.advantages.map((a) => `
    <div class="card">
      <div class="feature-icon">${svg(a.icon)}</div>
      <h3>${esc(t(a.title))}</h3>
      <p>${esc(t(a.desc))}</p>
    </div>`).join('');

  const featured = CONFIG.products.filter((p) => p.featured).slice(0, 3);
  const prodCards = featured.map(productCard).join('');

  const serv = CONFIG.services.slice(0, 3).map((sv) => `
    <div class="card">
      <div class="feature-icon">${svg(sv.icon)}</div>
      <h3>${esc(t(sv.title))}</h3>
      <p>${esc(t(sv.desc))}</p>
    </div>`).join('');

  const newsCards = CONFIG.news.slice(0, 3).map(newsCard).join('');

  const stats = CONFIG.about.stats.map((st) => `
    <div class="stat"><div class="num">${esc(st.value)}</div><div class="lbl">${esc(t(st.label))}</div></div>`).join('');

  return `
    <section class="hero">${slides}<div class="hero-dots">${dots}</div></section>

    <section class="section">
      <div class="container">
        <div class="section-head">
          <div class="eyebrow">${lang === 'zh' ? '核心优势' : 'Why Choose Us'}</div>
          <h2>${lang === 'zh' ? '专业铸就信赖' : 'Professionalism Builds Trust'}</h2>
          <p>${esc(t(s.slogan))}</p>
        </div>
        <div class="grid grid-3">${feat}</div>
      </div>
    </section>

    <section class="stats"><div class="container"><div class="grid grid-4">${stats}</div></div></section>

    <section class="section">
      <div class="container">
        <div class="section-head">
          <div class="eyebrow">${lang === 'zh' ? '精选产品' : 'Featured Products'}</div>
          <h2>${lang === 'zh' ? '产品中心' : 'Product Center'}</h2>
          <p>${lang === 'zh' ? '严选货源，品质保障' : 'Carefully sourced, quality assured'}</p>
        </div>
        <div class="grid grid-3">${prodCards}</div>
        <div style="text-align:center;margin-top:36px"><a class="btn btn-outline" href="#/products">${lang === 'zh' ? '查看全部产品' : 'View All Products'} →</a></div>
      </div>
    </section>

    <section class="section" style="background:#fff">
      <div class="container">
        <div class="section-head">
          <div class="eyebrow">${lang === 'zh' ? '我们的服务' : 'Our Services'}</div>
          <h2>${lang === 'zh' ? '外贸 + 内贸 全链路服务' : 'Import / Export + Domestic, End-to-End'}</h2>
        </div>
        <div class="grid grid-3">${serv}</div>
        <div style="text-align:center;margin-top:36px"><a class="btn btn-outline" href="#/services">${lang === 'zh' ? '了解服务详情' : 'Learn More'} →</a></div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-head">
          <div class="eyebrow">${lang === 'zh' ? '新闻动态' : 'News'}</div>
          <h2>${lang === 'zh' ? '公司资讯' : 'Company News'}</h2>
        </div>
        <div class="grid grid-3">${newsCards}</div>
        <div style="text-align:center;margin-top:36px"><a class="btn btn-outline" href="#/news">${lang === 'zh' ? '更多资讯' : 'More News'} →</a></div>
      </div>
    </section>

    <section class="section" style="background:linear-gradient(120deg,var(--navy),var(--navy-light));color:#fff;text-align:center">
      <div class="container">
        <h2 style="color:#fff;margin-top:0">${lang === 'zh' ? '携手中旻，共赢全球' : 'Partner with Zhongmin, Win Globally'}</h2>
        <p style="opacity:.9;max-width:640px;margin:0 auto 26px">${lang === 'zh' ? '无论您是需要采购、出口还是供应链支持，我们都期待与您合作。' : 'Whether you need sourcing, export or supply-chain support, we look forward to working with you.'}</p>
        <a class="btn" href="#/contact">${lang === 'zh' ? '立即联系我们' : 'Contact Us Now'} →</a>
      </div>
    </section>`;
}

/* ---------------- 视图：关于 ---------------- */
function viewAbout() {
  const a = CONFIG.about;
  const miles = a.milestones.map((m) => `<li><span class="yr">${esc(m.year)}</span> — ${esc(t(m.text))}</li>`).join('');
  const cats = CONFIG.productCategories.map((c) => `<span class="tag" style="margin:4px">${esc(t(c.name))}</span>`).join('');
  return `
    <section class="detail-hero"><div class="container">
      <div class="breadcrumb"><a href="#/home">${lang === 'zh' ? '首页' : 'Home'}</a> / ${esc(t(a.title))}</div>
      <h1>${esc(t(a.title))}</h1>
    </div></section>
    <section class="section"><div class="container">
      <div class="about-wrap">
        <div class="about-text">
          <p>${esc(t(a.content))}</p>
          <div style="margin-top:18px">${cats}</div>
          <div class="vm-row">
            <div class="vm"><h4>${lang === 'zh' ? '愿景' : 'Vision'}</h4><p>${esc(t(a.vision))}</p></div>
            <div class="vm"><h4>${lang === 'zh' ? '使命' : 'Mission'}</h4><p>${esc(t(a.mission))}</p></div>
          </div>
        </div>
        <div>
          <h3 style="color:var(--navy)">${lang === 'zh' ? '发展历程' : 'Milestones'}</h3>
          <ul class="timeline">${miles}</ul>
        </div>
      </div>
    </div></section>`;
}

/* ---------------- 视图：产品列表 ---------------- */
function productCard(p) {
  const cat = CONFIG.productCategories.find((c) => c.id === p.category);
  return `<div class="card product-card" data-product="${esc(p.id)}">
    ${media(p.cover || (p.images && p.images[0]), p.name, 'thumb')}
    <div class="body">
      <h3>${esc(t(p.name))}</h3>
      <p>${esc(t(p.summary))}</p>
      ${cat ? `<span class="tag">${esc(t(cat.name))}</span>` : ''}
    </div>
  </div>`;
}

function viewProducts(catId) {
  const active = catId || 'all';
  const cats = CONFIG.productCategories;
  const tabs = `<button data-cat="all" class="${active === 'all' ? 'active' : ''}">${lang === 'zh' ? '全部' : 'All'}</button>` +
    cats.map((c) => `<button data-cat="${esc(c.id)}" class="${active === c.id ? 'active' : ''}">${esc(t(c.name))}</button>`).join('');
  const list = active === 'all' ? CONFIG.products : CONFIG.products.filter((p) => p.category === active);
  const cards = list.map(productCard).join('');
  return `
    <section class="detail-hero"><div class="container">
      <div class="breadcrumb"><a href="#/home">${lang === 'zh' ? '首页' : 'Home'}</a> / ${lang === 'zh' ? '产品中心' : 'Products'}</div>
      <h1>${lang === 'zh' ? '产品中心' : 'Product Center'}</h1>
      <p style="opacity:.85">${lang === 'zh' ? '覆盖六大品类，支持 OEM / 定制 / 贴牌' : 'Six categories, OEM / custom / private label supported'}</p>
    </div></section>
    <section class="section"><div class="container">
      <div class="cat-tabs" id="cat-tabs">${tabs}</div>
      ${list.length ? `<div class="grid grid-3" id="prod-grid">${cards}</div>` : `<p style="text-align:center;color:var(--muted)">${lang === 'zh' ? '该分类暂无产品' : 'No products in this category'}</p>`}
    </div></section>`;
}

/* ---------------- 视图：产品详情 ---------------- */
function viewProduct(id) {
  const p = CONFIG.products.find((x) => x.id === id);
  if (!p) return notFound();
  const cat = CONFIG.productCategories.find((c) => c.id === p.category);
  const specs = (p.specs || []).map((s) => `<tr><th>${esc(t(s.k))}</th><td>${esc(t(s.v))}</td></tr>`).join('');
  const gallery = (p.images && p.images.length ? p.images : [p.cover]).filter(Boolean)
    .map((u) => `<div style="background-image:url('${esc(u)}')"></div>`).join('');
  return `
    <section class="detail-hero"><div class="container">
      <div class="breadcrumb"><a href="#/home">${lang === 'zh' ? '首页' : 'Home'}</a> / <a href="#/products">${lang === 'zh' ? '产品中心' : 'Products'}</a> / ${esc(t(p.name))}</div>
      <h1>${esc(t(p.name))}</h1>
      ${cat ? `<span class="tag" style="background:var(--gold);color:#fff">${esc(t(cat.name))}</span>` : ''}
    </div></section>
    <section class="section"><div class="container detail-body">
      ${p.cover ? `<img class="cover" src="${esc(p.cover)}" alt=""/>` : ''}
      <p style="font-size:16px;color:var(--ink)">${esc(t(p.description))}</p>
      ${specs ? `<h3 style="color:var(--navy)">${lang === 'zh' ? '产品参数' : 'Specifications'}</h3><table class="spec-table">${specs}</table>` : ''}
      ${gallery ? `<h3 style="color:var(--navy)">${lang === 'zh' ? '产品图集' : 'Gallery'}</h3><div class="gallery">${gallery}</div>` : ''}
      <div style="margin-top:30px"><a class="btn" href="#/contact">${lang === 'zh' ? '询价 / 获取报价' : 'Inquire / Get Quotation'} →</a></div>
    </div></section>`;
}

/* ---------------- 视图：服务 ---------------- */
function viewServices() {
  const serv = CONFIG.services.map((sv) => `
    <div class="card">
      <div class="feature-icon">${svg(sv.icon)}</div>
      <h3>${esc(t(sv.title))}</h3>
      <p>${esc(t(sv.desc))}</p>
      <ul style="margin:14px 0 0;padding-left:18px;color:var(--muted);font-size:14px">
        ${(sv.points || []).map((pt) => `<li>${esc(t(pt))}</li>`).join('')}
      </ul>
    </div>`).join('');
  const adv = CONFIG.advantages.map((a) => `
    <div class="card"><div class="feature-icon">${svg(a.icon)}</div><h3>${esc(t(a.title))}</h3><p>${esc(t(a.desc))}</p></div>`).join('');
  return `
    <section class="detail-hero"><div class="container">
      <div class="breadcrumb"><a href="#/home">${lang === 'zh' ? '首页' : 'Home'}</a> / ${lang === 'zh' ? '服务优势' : 'Services'}</div>
      <h1>${lang === 'zh' ? '服务优势' : 'Services & Advantages'}</h1>
      <p style="opacity:.85">${lang === 'zh' ? '进出口 + 国内贸易，一站式供应链服务' : 'Import/Export + Domestic Trade, One-Stop Supply Chain'}</p>
    </div></section>
    <section class="section"><div class="container">
      <div class="section-head"><h2>${lang === 'zh' ? '六大服务体系' : 'Six Service Pillars'}</h2></div>
      <div class="grid grid-3">${serv}</div>
    </div></section>
    <section class="section" style="background:#fff"><div class="container">
      <div class="section-head"><h2>${lang === 'zh' ? '我们的核心优势' : 'Our Core Advantages'}</h2></div>
      <div class="grid grid-3">${adv}</div>
    </div></section>`;
}

/* ---------------- 视图：新闻 ---------------- */
function newsCard(n) {
  return `<div class="card news-card" data-news="${esc(n.id)}">
    <div class="thumb" style="${n.cover ? `background-image:url('${esc(n.cover)}')` : ''}"><span class="cat">${esc(t(n.category))}</span></div>
    <div class="body">
      <div class="date">${esc(n.date)}</div>
      <h3>${esc(t(n.title))}</h3>
      <p>${esc(t(n.summary))}</p>
    </div>
  </div>`;
}
function viewNews() {
  const cards = CONFIG.news.map(newsCard).join('');
  return `
    <section class="detail-hero"><div class="container">
      <div class="breadcrumb"><a href="#/home">${lang === 'zh' ? '首页' : 'Home'}</a> / ${lang === 'zh' ? '新闻动态' : 'News'}</div>
      <h1>${lang === 'zh' ? '新闻动态' : 'News'}</h1>
    </div></section>
    <section class="section"><div class="container">
      ${CONFIG.news.length ? `<div class="grid grid-3">${cards}</div>` : `<p style="text-align:center;color:var(--muted)">${lang === 'zh' ? '暂无新闻' : 'No news yet'}</p>`}
    </div></section>`;
}
function viewNewsDetail(id) {
  const n = CONFIG.news.find((x) => x.id === id);
  if (!n) return notFound();
  return `
    <section class="detail-hero"><div class="container">
      <div class="breadcrumb"><a href="#/home">${lang === 'zh' ? '首页' : 'Home'}</a> / <a href="#/news">${lang === 'zh' ? '新闻动态' : 'News'}</a> / ${esc(t(n.title))}</div>
      <h1>${esc(t(n.title))}</h1>
      <p style="opacity:.85">${esc(t(n.category))} · ${esc(n.date)}</p>
    </div></section>
    <section class="section"><div class="container detail-body">
      ${n.cover ? `<img class="cover" src="${esc(n.cover)}" alt=""/>` : ''}
      <p style="font-size:16px">${esc(t(n.content))}</p>
      <div style="margin-top:30px"><a class="btn btn-outline" href="#/news">← ${lang === 'zh' ? '返回列表' : 'Back to list'}</a></div>
    </div></section>`;
}

/* ---------------- 视图：联系 ---------------- */
function viewContact() {
  const c = CONFIG.site.contact;
  const item = (icon, label, val) => `<div class="item"><div class="ic">${svg(icon)}</div><div class="txt"><strong>${label}</strong><span>${esc(val)}</span></div></div>`;
  return `
    <section class="detail-hero"><div class="container">
      <div class="breadcrumb"><a href="#/home">${lang === 'zh' ? '首页' : 'Home'}</a> / ${lang === 'zh' ? '联系我们' : 'Contact'}</div>
      <h1>${lang === 'zh' ? '联系我们' : 'Contact Us'}</h1>
    </div></section>
    <section class="section"><div class="container">
      <div class="contact-wrap">
        <div class="contact-info">
          ${item('pin', lang === 'zh' ? '公司地址' : 'Address', t(c.address))}
          ${item('phone', lang === 'zh' ? '电话' : 'Phone', c.phone + (c.mobile ? ' / ' + c.mobile : ''))}
          ${item('mail', lang === 'zh' ? '邮箱' : 'Email', c.email)}
          ${item('clock', lang === 'zh' ? '工作时间' : 'Working Hours', t(c.workingHours))}
          ${c.wechat ? `<p style="margin-top:14px;color:var(--navy);font-weight:600">WeChat / 微信：${esc(c.wechat)}</p>` : ''}
          ${c.whatsapp ? `<p style="color:var(--navy);font-weight:600">WhatsApp：${esc(c.whatsapp)}</p>` : ''}
        </div>
        <div class="form-box">
          <h3 style="margin-top:0;color:var(--navy)">${lang === 'zh' ? '在线留言 / 询价' : 'Send an Inquiry'}</h3>
          <form id="contact-form">
            <label>${lang === 'zh' ? '姓名' : 'Name'} *</label>
            <input name="name" required />
            <label>${lang === 'zh' ? '公司' : 'Company'}</label>
            <input name="company" />
            <label>Email *</label>
            <input name="email" type="email" required />
            <label>${lang === 'zh' ? '电话' : 'Phone'}</label>
            <input name="phone" />
            <label>${lang === 'zh' ? '留言内容' : 'Message'} *</label>
            <textarea name="message" required></textarea>
            <button class="btn" type="submit" style="margin-top:18px;width:100%">${lang === 'zh' ? '提交留言' : 'Submit'}</button>
          </form>
          <p style="font-size:12px;color:var(--muted);margin-top:10px">${lang === 'zh' ? '提交后将调用您的邮件客户端发送至公司邮箱。' : 'Submitting opens your mail client to our company email.'}</p>
        </div>
      </div>
    </div></section>`;
}

function notFound() {
  return `<div class="center-state"><div class="big">404</div><p>${lang === 'zh' ? '页面未找到' : 'Page not found'}</p><a class="btn" href="#/home">${lang === 'zh' ? '返回首页' : 'Back Home'}</a></div>`;
}

/* ---------------- 路由 ---------------- */
function route() {
  if (sliderTimer) { clearInterval(sliderTimer); sliderTimer = null; }
  const hash = location.hash.replace(/^#\/?/, '');
  const parts = hash.split('/').filter(Boolean);
  const base = parts[0] || 'home';
  let html = '';
  if (base === 'home') html = viewHome();
  else if (base === 'about') html = viewAbout();
  else if (base === 'products') html = viewProducts(parts[1]);
  else if (base === 'product') html = viewProduct(parts[1]);
  else if (base === 'services') html = viewServices();
  else if (base === 'news') html = (parts[1] ? viewNewsDetail(parts[1]) : viewNews());
  else if (base === 'contact') html = viewContact();
  else html = notFound();

  $('#app').innerHTML = html;
  window.scrollTo(0, 0);
  bindViewEvents(base);
  // 高亮导航
  document.querySelectorAll('#main-nav a').forEach((a) => {
    a.classList.toggle('active', a.dataset.route === (base === 'product' ? 'products' : base === 'news' && parts[1] ? 'news' : base));
  });
  document.title = t(CONFIG.site.name) + (base !== 'home' ? ' · ' + (NAV.find((n) => n.route === base) ? t(NAV.find((n) => n.route === base)) : '') : '');
}

function bindViewEvents(base) {
  // 产品卡片点击
  document.querySelectorAll('[data-product]').forEach((el) => {
    el.onclick = () => { location.hash = '#/product/' + el.dataset.product; };
  });
  document.querySelectorAll('[data-news]').forEach((el) => {
    el.onclick = () => { location.hash = '#/news/' + el.dataset.news; };
  });
  // 分类切换（不刷新整页）
  const tabs = $('#cat-tabs');
  if (tabs) {
    tabs.querySelectorAll('button').forEach((b) => {
      b.onclick = () => { location.hash = '#/products/' + (b.dataset.cat === 'all' ? '' : b.dataset.cat); };
    });
  }
  // 首页轮播
  if (base === 'home') startSlider();
  // 联系表单
  const form = $('#contact-form');
  if (form) {
    form.onsubmit = (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const name = fd.get('name'), email = fd.get('email'), msg = fd.get('message');
      const subject = encodeURIComponent(`[网站留言] ${name} / Inquiry from ${name}`);
      const body = encodeURIComponent(
        `姓名/Name: ${name}\n公司/Company: ${fd.get('company') || '-'}\n邮箱/Email: ${email}\n电话/Phone: ${fd.get('phone') || '-'}\n\n留言/Message:\n${msg}`
      );
      window.location.href = `mailto:${CONFIG.site.contact.email}?subject=${subject}&body=${body}`;
      toast(lang === 'zh' ? '已为您打开邮件客户端' : 'Mail client opened');
    };
  }
}

function startSlider() {
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.hero-dots button');
  if (slides.length < 2) return;
  let i = 0;
  sliderTimer = setInterval(() => {
    slides[i].classList.remove('active');
    if (dots[i]) dots[i].classList.remove('active');
    i = (i + 1) % slides.length;
    slides[i].classList.add('active');
    if (dots[i]) dots[i].classList.add('active');
  }, 5000);
  dots.forEach((d, idx) => {
    d.onclick = () => {
      slides[i].classList.remove('active'); dots[i].classList.remove('active');
      i = idx; slides[i].classList.add('active'); dots[i].classList.add('active');
    };
  });
}

/* ---------------- 语言 / 交互 ---------------- */
function setLang(l) {
  lang = l;
  localStorage.setItem('zm_lang', l);
  document.documentElement.lang = l === 'zh' ? 'zh' : 'en';
  renderHeader(); renderFooter(); route();
}

function toast(msg) {
  const el = $('#toast');
  el.textContent = msg; el.classList.add('show');
  clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('show'), 2200);
}

/* ---------------- 配置加载（兼容本地后端 / 纯静态托管） ---------------- */
async function loadConfig() {
  // 1) 有后端时优先走 API（本地启动 server.js 的场景）
  try {
    const res = await fetch('/api/config', { cache: 'no-store' });
    if (res.ok) return await res.json();
  } catch (e) { /* 静态托管无后端，忽略后降级 */ }

  // 2) 纯静态托管（Cloudflare Pages 等）：读同目录 config.json
  const res2 = await fetch('config.json', { cache: 'no-store' });
  if (!res2.ok) throw new Error('config');
  return await res2.json();
}

/* ---------------- 初始化 ---------------- */
async function init() {
  try {
    CONFIG = await loadConfig();
  } catch (e) {
    $('#app').innerHTML = `<div class="center-state"><div class="big">⚠️</div><p>${lang === 'zh' ? '无法加载站点配置，请确认后端服务已启动。' : 'Failed to load site config. Please ensure the server is running.'}</p></div>`;
    return;
  }
  // SEO + 浏览器标签
  document.documentElement.lang = lang === 'zh' ? 'zh' : 'en';
  document.title = t(CONFIG.site.name);
  const metaDesc = document.querySelector('meta[name=description]');
  const metaKey = document.querySelector('meta[name=keywords]');
  if (metaDesc) metaDesc.content = t(CONFIG.seo.description);
  if (metaKey) metaKey.content = t(CONFIG.seo.keywords);
  if (CONFIG.site.favicon) { const f = $('#favicon'); if (f) f.href = CONFIG.site.favicon; }

  renderHeader();
  renderFooter();
  route();

  $('#lang-toggle').onclick = () => setLang(lang === 'zh' ? 'en' : 'zh');
  $('#menu-toggle').onclick = () => $('#main-nav').classList.toggle('open');
  window.addEventListener('hashchange', route);
}

init();
