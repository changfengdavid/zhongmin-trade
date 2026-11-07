> ⚠️ **【已废弃 · 2026-11-08】** Zeabur 官方已公告将停止运营：2026-12-01 起共享集群服务暂停，2026-12-31 全部停服并删除数据。
> 请勿再按本文部署，改用 **`CloudflarePages部署指南.md`**。本文仅作历史记录保留。

---

# 青岛中旻官网 · Zeabur 免费档部署指南

> 目标：把 `G:\ZhongMinWebsite` 这套 Node+Express 全栈官网，免费、免信用卡地部署到外网，
> 拿到一个**专业、无中间页**的固定域名（如 `xxx.zeabur.app`），直接发给客户看。

---

## 一、为什么是 Zeabur 免费档

逐个核实过当前还活着的免费平台后，Zeabur 免费档是**唯一同时满足**以下硬约束的方案：

| 约束 | Zeabur 免费档 | 说明 |
|---|---|---|
| 免信用卡 | ✅ | 注册即送 $5/月 滚动额度，甚至支持支付宝 |
| 无"访问提示中间页" | ✅ | CloudBase 免费版的强制中间页在这里没有 |
| 能跑 Express 全栈 | ✅ | 真容器，不是 serverless，你的 `server.js` 几乎零改造 |
| 国内访问快 | ✅ | 可选香港 / 新加坡节点 |
| 对外发客户够专业 | ✅ | 默认 `xxx.zeabur.app` 域名，无广告、无中间页 |

> 对比：Vercel/Netlify 免费档是 serverless，跑不了常驻 Node（改造大，且 Vercel 明文禁止商业用途）；
> Cloudflare Pages 不是 Node 运行时；Render 强制绑卡；CloudBase 免费版有强制中间页。

---

## 二、前置条件（你已具备）

- ✅ GitHub 仓库 `changfengdavid/zhongmin-trade` 已就绪（含 `server.js`、`package.json`、`Dockerfile`）
- ✅ 本地改动通过 `G:\ZhongMinWebsite\发布到云.bat` 推 git（已配置 SSH 走 443 端口）
- ✅ `server.js` 读 `process.env.PORT` 并监听 `0.0.0.0`，完美适配 PaaS 动态端口
- ✅ `package.json` 有 `"start": "node server.js"`，Zeabur 能自动识别

---

## 三、部署步骤（约 10 分钟）

### 第 1 步：注册并登录 Zeabur
1. 打开 https://zeabur.com ，点 **Sign In** → 选 **GitHub**（用 `changfengdavid` 登录）
2. **无需信用卡**；如需升级，Zeabur 支持支付宝
3. 按提示授权 Zeabur 访问你的 GitHub 仓库

### 第 2 步：创建项目并部署
1. 控制台点 **New Project** → 选 GitHub 仓库 `changfengdavid/zhongmin-trade`
2. 分支选 **main**
3. Zeabur 自动检测框架：识别为 **Node.js**
   - 仓库里有 `Dockerfile`，Zeabur 会用 Docker 构建（监听 80，自动识别端口）；
   - 即使不用 Dockerfile 走 nixpacks 自动构建，本项目也完全兼容（`server.js` 读 `PORT` 环境变量）
4. 配置项（基本不用改）：
   - 启动命令：`node server.js`（自动）
   - 环境变量：`ADMIN_PASSWORD` = `admin123`
   - 地区：**Singapore** 或 **Hong Kong**（离国内最近）
5. 点 **Deploy**，等待 2～5 分钟

### 第 3 步：拿到域名
- 部署完成后，控制台分配默认域名：`https://<你的项目名>.zeabur.app`
- 该域名**专业、无中间页，可直接发客户**
- 后台入口：同一域名 + `/admin/`（默认密码 `admin123`，建议首次登录后改掉）

---

## 四、日常更新（一键发布）

以后本地改完内容 / 图片：

1. 在 `G:\ZhongMinWebsite` 改好文件
2. **双击 `发布到云.bat`** → 自动提交并推送到 GitHub `main` 分支
3. Zeabur 检测到推送 → **自动重新构建部署**（约 1～2 分钟上线）

无需再登录任何平台，本地改完双击即可。

---

## 五、免费档须知（重要，避免踩坑）

1. **自动休眠**：空闲数分钟会休眠，客户首次访问会冷启动几秒（官网访问低频，完全可接受）。
   若想 7×24 丝滑不休眠，升级 Dev 计划 $5/月（约 ¥35），有 14 天免费试用，仍免卡。
2. **额度**：$5/月 滚动 compute credit，轻量官网月耗约 1～2 美元，足够；别拿它当图床 / 大流量站。
3. **单文件上传上限 50MB**：后台传图够用。
4. **运行时改的后台内容会丢**：容器重启会回到 git 版本（和所有容器平台一致）。
   正确做法是用「发布到云.bat」把改动推到 git 再部署，**不要只依赖后台运行时修改**。

---

## 六、可选：绑定自有域名（更专业）

- 在阿里云 / 腾讯云等买一个域名（约 ¥30/年），例如 `zhongmin-trading.com`
- Zeabur 控制台 → 项目 → **Domains** → 添加自定义域名 → 按提示在域名服务商处加 **CNAME** 记录
- SSL 证书 Zeabur 自动配置
- Zeabur 服务器在境外，国内访问**通常无需 ICP 备案**（备案仅针对境内服务器）；个别网络可能略有波动

---

## 七、升级到常驻（可选）

- 免费档的休眠若影响客户体验，升级 **Dev 计划 $5/月**（约 ¥35），14 天免费试用，支持：
  - 服务常驻不休眠
  - 更大规格（最高 2 vCPU / 4 GB）
  - 自动数据库备份、更长日志保留
- 仍在 Zeabur 控制台操作，免卡试用

---

## 八、故障排查

| 现象 | 处理 |
|---|---|
| 构建失败（红色日志） | 看 Build Logs；若是 Node 版本问题，在项目设置里指定 **Node 20** |
| 访问 502 | 确认服务端口：本项目 Dockerfile 监听 80，Zeabur 自动识别；若走 nixpacks，`server.js` 读 `PORT` 也可 |
| `/admin/` 打不开 | 确认已设环境变量 `ADMIN_PASSWORD`（默认 `admin123`） |
| 改了内容没生效 | 确认已双击「发布到云.bat」推送到 GitHub `main` 分支；Zeabur 部署记录里看是否触发了新构建 |
| 域名打不开 / 慢 | 换地区为 Hong Kong 或 Singapore；或升级 Dev 消除休眠 |
