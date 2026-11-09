# 路线 A 操作手册：免费域名 → 绑定 Cloudflare Worker

> 更新时间：2026-11-09
> 目标：拿到 `zhongmin.dpdns.org`（或 `zhongmin.us.kg`），指向你已经部署好的 Worker，做出一个国内多数网络能打开、可直接发客户的网址。
> 全程 **0 元、免信用卡**。

---

## 零、先解决：GitHub 登录进不去

**这是 DigitalPlat 的常见问题（它的 GitHub OAuth 经常抽风），不是你账号的问题，不用反复试。**

页面底部有独立注册入口，用邮箱注册即可：

- 登录页：https://dashboard.digitalplat.org/auth/login
- **注册页：https://dashboard.digitalplat.org/auth/register** ←（登录页最下方 **"Create an account"** 就是它）

> 如果你之前已经用邮箱注册过（`3287687059@qq.com`），就别注册了，直接在登录页填 **邮箱 + 密码**，点蓝色 **登录**。你截图里表单已经填好、Cloudflare 人机验证也显示"成功!"，**直接点「登录」就能进**。

### 如果确实还没注册，按这个填

| 字段 | 填什么 |
|---|---|
| 用户名 | `changfengdavid` |
| 邮箱 | `3287687059@qq.com` |
| 姓名 | 你的法定姓名（如 `张伟`） |
| 电话 | `+86-你的手机号`（注意格式：区号 + 连字符，如 `+86-13800138000`） |
| 密码 | 至少 8 位，记牢 |
| 推荐码 | 留空 |
| 人机验证 | 等 Cloudflare 转圈变成 ✅ |

点 **注册** → 去 QQ 邮箱收验证邮件（**顺便看垃圾箱**）→ 点邮件里的链接激活。

### 激活后还要做一步「账户验证」

在域名注册页面会看到提示：**"只有使用免费域名插槽时才需要账户验证"**。

点 **验证账户**，按提示完成（通常是邮箱/手机二次验证）。**不做这步申请不了免费域名。**

---

## 一、顺序很重要：先在 Cloudflare 建站拿 NS，再去 DigitalPlat 注册

很多人卡住是因为顺序反了。**必须先拿到 Cloudflare 的两条 NS**，注册域名时才能填进去。

### 第 1 步：在 Cloudflare 添加站点（拿 NS）

1. 打开 https://dash.cloudflare.com （用你现有账号登录）
2. 右上 **Add a site**（或 `+ Add` → `Existing domain`）
3. 输入你打算用的完整域名：**`zhongmin.dpdns.org`**
   - 推荐 `.dpdns.org`（官方主推后缀，最稳）
   - 也可以用 `zhongmin.us.kg`（老牌后缀，社区用得多）
4. 套餐选 **Free** → Continue
5. 它会自动扫描 DNS，直接 **Continue**
6. 页面给出**两条 Nameserver**，形如：
   ```
   alina.ns.cloudflare.com
   bob.ns.cloudflare.com
   ```
   **复制这两条**（先别关这个页面）

> 此时 Cloudflare 里这个站点会显示 `Pending`，正常，因为域名还没注册。

### 第 2 步：去 DigitalPlat 注册域名并委派 NS

1. 打开 https://dash.domain.digitalplat.org → 登录
2. 左侧 **域名注册**（或首页 **注册新域名**）
3. 选择 **DigitalPlat 自有后缀** → 勾选 **`.dpdns.org`**
4. 在输入框填前缀：**`zhongmin`**
   - 会提示可用性，显示 `zhongmin.dpdns.org` 可用
5. **委派模式** 选 **「外部名称服务器」**（关键！不要选 DigitalPlat DNS）
6. 把第 1 步复制的**两条 Cloudflare NS** 分别粘进去
7. 勾选同意条款 → 点 **注册**

> 如果当时没填 NS，也没关系：注册后在 **域名管理 → 管理名称服务器** 里再改成 Cloudflare 的两条。

### 第 3 步：等 Cloudflare 变 Active

- 回 Cloudflare 那个站点页面，点 **Check nameservers now**
- 一般 **10 分钟～2 小时**变 **Active**（最多 24 小时）

自查命令（本机 CMD 或 PowerShell）：
```cmd
nslookup -type=ns zhongmin.dpdns.org 8.8.8.8
```
返回结果里出现 `xxx.ns.cloudflare.com` 就说明委派生效了。

> ⚠️ 注意：DigitalPlat 只负责"注册 + 把域名交给 Cloudflare"，**它自己没有 DNS 记录编辑器**。以后所有 A / CNAME 记录都在 Cloudflare 里配。

---

## 二、把域名绑到 Worker（关键一步）

**不要用普通 CNAME**（CNAME 指向 `*.workers.dev` 会报 1014 / 证书错误）。用 Cloudflare 官方的 **Custom Domain**。

1. Cloudflare 控制台 → 左侧 **Workers & Pages**
2. 点进项目 **`zhongmin-trade`**
3. 顶部标签 **Domains**（在 `Access` 和 `Settings` 之间）
4. 点 **Add** → **Custom domain**
5. 填 **`zhongmin.dpdns.org`**
   - 提示 "This domain is not proxied" 之类可忽略，Cloudflare 会自动建好路由
6. 点 **Add domain**
7. 状态 `Initializing` → **`Active`**，约 1～3 分钟（自动签发 HTTPS 证书）

> 想同时支持 `www`，再 Add 一次填 `www.zhongmin.dpdns.org` 即可（可选）。

### 顺手确认流量是 100%

同一个项目 → **Deployments** 标签 → `Active deployment` 卡片看 **Traffic** 百分比。
如果是 **0%**，点 Manage / 滑块拉到 **100%** —— 否则连海外也拿不到内容。

---

## 三、验证（三步，别只看电脑）

1. **电脑浏览器**打开 `https://zhongmin.dpdns.org` → 应看到中旻官网首页
2. **手机 4G/5G（关 WiFi）**打开同一地址 —— 这一步才是"客户能不能看到"的真实检验
3. **海外节点**检测（可选）：
   ```
   https://check-host.net/check-http?host=https%3A%2F%2Fzhongmin.dpdns.org%2F
   ```

预期：`/admin/` 在线上返回 404 是**正常的**（线上是纯静态，后台仅在本地可用）。

---

## 四、这张表帮你对照每一步的状态

| 阶段 | 在哪看 | 正常状态 | 卡住怎么办 |
|---|---|---|---|
| 注册账号 | DigitalPlat | 能登录 | GitHub 登录失败 → 走邮箱注册 |
| 账户验证 | 域名注册页 | 已验证 | 未验证无法用免费名额 |
| 域名注册 | DigitalPlat 域名列表 | 出现 `zhongmin.dpdns.org` | 名字被占 → 换 `zhongminqd` / `zhongmin-trade` |
| NS 委派 | Cloudflare 站点页 | **Active** | 一直 Pending → `nslookup` 查 NS 是否真改了 |
| 绑定 Worker | Worker → Domains | **Active** | 报错见下表 |
| 流量 | Worker → Deployments | Traffic **100%** | 0% 就手动拉满 |

### 绑定域名时的常见报错

| 报错 | 原因 | 处理 |
|---|---|---|
| `The zone is not active` | Cloudflare 站点还是 Pending | 等 NS 生效变 Active 再绑定 |
| `CNAME Cross-User Banned (1014)` | 用了普通 CNAME 指 workers.dev | 改用 **Custom domain**，别手建 CNAME |
| 打开是 522 / 521 | 域名没真正接到 Worker | 确认 Custom domain 状态是 Active |
| 打开报证书错误 | 证书还没签发完 | 等 3～5 分钟，或删掉重加 |
| 打开显示 "Error 1000 DNS points to prohibited IP" | Cloudflare 里有冲突的 A 记录 | 删掉该域名的 A/AAAA 记录 |

---

## 五、必须知道的限制（先接受再动手）

1. **每个 DigitalPlat 账号只能申请 1 个免费域名** —— 选名字前想清楚（想改只能删了重申请）。
2. **域名每年要手动续期**（到期前 120 天内免费续），忘了会被回收。
3. **免费域名有滥用连带风险** —— 同后缀别人搞钓鱼，可能整段后缀被判风险。所以别拿它当公司唯一门面。
4. 从中国大陆访问走的是 Cloudflare 境外节点，**能打开但速度一般**（首屏 1～3 秒）。

> 一句话：这个方案适合"立刻能用、能发客户看一眼"，**不适合当作三年不动摇的官网门面**。真要长期稳，还是花 ¥30 买个 `.com`（见 `自定义域名绑定指南.md`），步骤和这里几乎一样，只是不用注册免费域名。

---

## 六、如果 DigitalPlat 彻底搞不定

别死磕，直接换 **GitHub Pages**（`github.io` 本身就是免费二级域名，不需要任何注册商）：

1. 仓库 https://github.com/changfengdavid/zhongmin-trade → **Settings → Pages**
2. **Source** 选 **GitHub Actions**
3. 双击 `G:\ZhongMinWebsite\发布到云.bat` 推一次
4. 1～2 分钟后访问 `https://changfengdavid.github.io/zhongmin-trade/`

工作流已内置（`.github/workflows/deploy-pages.yml`），详见 `免费二级域名外网访问方案.md` 路线 B。
