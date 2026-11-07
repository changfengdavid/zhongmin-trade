# 中旻官网 · Cloudflare Pages 部署指南

> 目标：拿到一个 **免费、免信用卡、不休眠、无中间页** 的固定网址，可直接发给客户。
> 预计耗时：10 分钟。费用：**0 元**。
> 文档日期：2026-11-08

---

## 一、为什么选这条路

前面试过的平台全部失败，原因是同一个：**免费 + 国内能稳定访问 + 能发客户**，三者在现行监管下不可兼得。

| 平台 | 失败原因 |
|---|---|
| Render | 免费档强制绑信用卡（Visa/MasterCard） |
| 腾讯云 CloudBase | 默认域名强制"访问提示中间页"，去掉须备案 |
| Zeabur | 官方公告 2026-12-31 停服 |
| Apply.Build | 仅欧洲用户可注册 |
| Northflank | 官方文档：所有用户必须绑支付方式 |

**Cloudflare Pages 的不同之处**：它托管的是纯静态文件（HTML/CSS/JS/JSON），
不需要服务器进程、不需要数据库、不需要信用卡，也没有休眠概念 ——
CDN 直接回文件，理论上永不挂。

代价只有两条，必须提前知道：
1. **后台编辑功能只在本地可用** —— 线上是纯静态，网页后台改的内容无法保存。正确姿势见第五节。
2. **国内访问速度中等** —— `xxx.pages.dev` 走海外节点，多数网络能开，个别运营商偶尔慢。若要极致国内速度，见第六节的升级路径。

---

## 二、改造已经完成的（不用你做）

| 文件 | 改动 |
|---|---|
| `public/js/app.js` | 数据加载改为两级降级：先试 `/api/config`（本地后端），失败则读 `config.json`（纯静态）。同一份代码两种环境都能跑 |
| `build-static.js` | 新增。把 `public/` 打包成 `dist/`，自动剔除 `admin/`、复制 `data/config.json`、去掉页面上的后台入口 |
| `preview-static.js` | 新增。本地模拟 Cloudflare Pages 环境（端口 8101），用来验收上线效果 |
| `构建并预览静态站.bat` | 新增。双击后自动构建 + 打开浏览器预览 |
| `.gitignore` | 忽略 `dist/`（云端每次部署会重新构建，不需要提交产物） |

**已验证（本地实测）**：

- 静态模式：`/`、`/config.json`、`/js/app.js`、`/css/style.css`、`/robots.txt` 全部 200；`/admin/` 返回 404（符合预期）
- 数据加载：降级到 `config.json` 成功，读到产品分类 6 个、产品 9 个、新闻 3 条
- 本地后端模式：`/`、`/api/config`、`/admin/` 仍全部 200，未被改坏

---

## 三、Cloudflare 部署步骤

### 第 1 步：注册并进入 Pages

1. 打开 https://dash.cloudflare.com/sign-up
2. 填 **邮箱 + 密码** → 点 **Sign up**（**不需要信用卡**，不用填付款信息）
3. 收邮件点验证链接
4. 登录后，左侧菜单找到 **Workers & Pages** → 点进去

> 如果 dash.cloudflare.com 打不开：换手机热点，或稍后重试。这个域名在国内多数网络可以访问。

### 第 2 步：创建 Pages 项目

1. 点 **Create**（或 Create application）
2. 选 **Pages** 标签 → 点 **Connect to Git**
3. 首次使用会要求授权 GitHub → 点 **Connect GitHub**
4. 弹窗里选 **Only select repositories** → 勾选 `changfengdavid/zhongmin-trade` → **Install & Authorize**
5. 回到 Cloudflare，列表里选中 `zhongmin-trade` → **Begin setup**

### 第 3 步：填写构建配置（关键，照抄）

| 字段 | 填什么 |
|---|---|
| Project name | `zhongmin` ← 决定网址前缀，填完网址就是 `zhongmin.pages.dev` |
| Production branch | `main` |
| Framework preset | `None` |
| Build command | `node build-static.js` |
| Build output directory | `dist` |

**展开 Environment variables（环境变量），加两条**：

| 变量名 | 值 | 作用 |
|---|---|---|
| `NODE_VERSION` | `20` | 固定 Node 版本，避免构建报错 |
| `SKIP_DEPENDENCY_INSTALL` | `1` | 跳过 npm install（本项目不需要依赖，跳过能快 1 分钟） |

填完点 **Save and Deploy**。

### 第 4 步：等部署

1~2 分钟。日志里应看到：

```
静态站构建完成 -> dist\
  文件数        : 5
  体积          : 68.3 KB
```

状态变成 **Success** 后，顶部会给出网址：

```
https://zhongmin.pages.dev
```

> 如果 `zhongmin` 已被全球其他用户占用，Cloudflare 会自动改名（如 `zhongmin-a1b`），
> 以页面显示的实际网址为准。

### 第 5 步：验收三处

打开网址，依次确认：

| 检查项 | 预期 |
|---|---|
| `https://zhongmin.pages.dev/` | 中旻官网首页正常显示，有 logo、导航、产品图 |
| 点导航切页面 | 产品中心显示 9 个产品，资讯显示 3 条 |
| 右上角语言切换 | 中 / EN 能互切 |
| `https://zhongmin.pages.dev/config.json` | 一段 JSON 文本，开头是公司名 |

**看不到「后台」按钮是正常的** —— 线上是纯静态，后台只在本地跑。

---

## 四、以后怎么更新（最重要，务必记住）

网站内容改动只有一条正确路径：

```
本地改内容  →  双击「构建并预览静态站.bat」看效果  →  双击「发布到云.bat」  →  自动上线
```

详细说明：

1. **改内容**：双击 `启动网站.bat`，浏览器开 `http://localhost:8080/admin/`
   （默认密码 `admin123`），想改文案/换图/加产品都在这里，改完点保存。
   所有改动落到 `data/config.json` 和 `public/uploads/`。
2. **本地预览**：双击 `构建并预览静态站.bat`
   —— 它会重新打包 `dist/` 并自动打开浏览器（端口 8101），看到的就是上线后的样子。
3. **发布**：双击 `发布到云.bat`
   —— 提交并推送到 GitHub。
4. **自动上线**：Cloudflare 检测到推送，自动重新构建部署，约 1~2 分钟后线上生效。
   Cloudflare 控制台的 Deployments 列表能看到每次部署记录。

> ⚠️ **绝对不要指望在网页后台直接改线上内容** —— 线上是纯静态，没有写入能力。
> 后台只能在本地用，改完必须走「发布」这一步。

---

## 五、常见问题

### 构建报 `Cannot find module 'xxx'`
本项目只用 Node 内置模块（`fs`、`path`、`http`），正常不会出现。
若出现，检查 Build command 是否误写成 `npm run build` —— 必须是 `node build-static.js`。

### 构建报 `NODE_VERSION` 相关问题
在环境变量里确认 `NODE_VERSION=20`（不要写 `v20` 或 `20.0.0`）。

### 部署成功但页面空白
1. 打开 `https://你的域名/config.json`，能出 JSON 说明数据没问题；
2. 按 `F12` 看 Console 报错；多半是 `config.json` 没生成 ——
   检查构建日志里是否有「静态站构建完成」，以及 output directory 是否填的 `dist`。

### 改了内容，线上没变化
1. 确认 `发布到云.bat` 执行到最后一步「推送成功」；
2. 打开 Cloudflare 控制台 → 项目 → **Deployments**，看是否有新的部署记录；
3. 浏览器强制刷新：`Ctrl + F5`。

### 想换网址（去掉 .pages.dev）
控制台 → 项目 → **Custom domains** → **Set up a custom domain**。
需要你有自己的域名（约 ¥30/年），加到 Cloudflare 后按提示改 DNS 即可，仍然免费、免备案。

### 国内访问慢或偶尔打不开
这是海外节点的固有限制。三种改善方式，按成本排：
1. **绑自有域名**（¥30/年）：`zhongmin.pages.dev` 这个域名层本身在国内部分网络会被干扰，换成自己的域名能明显改善 —— 这是性价比最高的一步。
2. **Cloudflare 前面套国内 CDN**（需域名 + 备案）
3. **整体迁到国内平台**（腾讯云 EdgeOne Pages / CloudBase，需备案）

---

## 六、升级路径（等你觉得需要时再做）

| 阶段 | 方案 | 成本 | 效果 |
|---|---|---|---|
| 现在 | Cloudflare Pages + `xxx.pages.dev` | 0 元 | 能上线、能发客户，偶尔慢 |
| 下一步 | Cloudflare Pages + 自有域名 | 约 ¥30/年 | 国内速度明显改善，更专业 |
| 长期 | 自有域名 + ICP 备案 + 腾讯云 EdgeOne Pages | 约 ¥30/年 + 备案 1~2 周 | 国内 CDN 极速，最正规 |

**代码不用再改**：`build-static.js` 产出的 `dist/` 是标准静态站，
换成任何静态托管平台都只是把这份目录再传一次。

---

## 七、一句话总结

- 网址拿到后先自己用手机流量、WiFi、公司网络各测一遍；
- 后台永远在本地用，改完必须「构建预览 → 发布」两步走；
- 客户访问不畅时，第一件事是花 ¥30 买个域名绑上去，别急着换平台。
