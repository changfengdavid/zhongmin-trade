> ⚠️ **【已废弃 · 2026-11-08】** Render 免费档现要求**强制绑定 Visa/MasterCard 信用卡**（$1 预授权），无卡无法创建实例。请勿再按本文操作，改用 **`CloudflarePages部署指南.md`**。本文仅作历史记录保留。

---

# 免费云托管部署指南（Render，固定网址 xxx.onrender.com）

> 目标：把公司官网放到免费的 Render 云上，得到一个**永久固定**的网址 `https://你的服务名.onrender.com`。
>
> ⚠️ 先认清免费档的两个限制（官方规则，无法绕过）：
> 1. **15 分钟无人访问会休眠**，下一个访客打开要等约 1 分钟唤醒（可用免费监控保活，见第 5 步）。
> 2. **文件系统是临时的**：线上后台改的内容/上传的图，**实例重启后全部丢失**。所以内容必须在**本地改好，再点"一键发布"重新部署**，不要在线上后台直接改。

---

## 一、前置条件

- 一个 **GitHub 账号**（https://github.com ）——Render 只能从 Git 仓库部署，这是必需的。
  - 若国内打不开 GitHub，需要先开代理/VPN 再操作。
- 本机已安装 **Git for Windows**（https://git-scm.com/download/win ）。装完在新命令行能执行 `git --version` 即 OK。

---

## 二、把代码推送到 GitHub（一次性）

1. 打开 https://github.com/new ，新建仓库：
   - 仓库名填 `zhongmin`（或任意）；
   - **建议选 Private（私有）**；
   - **不要**勾选 "Add a README / .gitignore / license"（保持空仓库）。
   - 创建后复制仓库地址，形如 `https://github.com/你的用户名/zhongmin.git`。

2. 双击本目录的 **`发布到云.bat`**：
   - 首次会初始化 git 仓库；
   - 提示"输入仓库地址"时，粘贴上一步复制的地址，回车；
   - 它会自动提交并推送。
   - 若提示登录：用户名填 GitHub 用户名，密码填 **Personal Access Token**
     （GitHub → Settings → Developer settings → Personal access tokens → 生成，勾选 `repo`）。

3. 刷新 GitHub 仓库页面，能看到文件 = 推送成功。

---

## 三、在 Render 部署（一次性，约 10 分钟）

1. 打开 https://render.com ，点 **Get Started**，用 **GitHub 账号登录**（授权即可，**免费档不需要信用卡**）。

2. 控制台点 **New +** → **Web Service**。

3. 选择刚才的仓库 `zhongmin`（首次会要求授权 Render 访问 GitHub，点允许）。

4. 填写/确认：
   - **Name**：`zhongmin-portal`（决定了网址 `https://zhongmin-portal.onrender.com`，可自定义）
   - **Region**：Singapore（离中国近；若选不到就选 Oregon）
   - **Branch**：`main`
   - **Runtime**：Node
   - **Build Command**：`npm install`
   - **Start Command**：`node server.js`
   - **Instance Type**：**Free**
   - **Environment Variables**（可选但建议）：
     - `ADMIN_PASSWORD` = 你自己设一个强密码（首次启动用它当后台密码，别再留 admin123）

5. 点 **Create Web Service**，等待构建（首次约 2-5 分钟）。

6. 构建成功后，页面顶部会显示你的网址：`https://zhongmin-portal.onrender.com`。
   打开它能看到官网 = **部署成功**。

---

## 四、日常更新内容（每次都这样）

1. **在本地**打开 `http://localhost:8080/admin`（或先双击 `启动网站.bat`），改产品/新闻/图片。
2. 双击 **`发布到云.bat`** → 自动提交并推送。
3. Render 检测到推送后**自动重新部署**（约 1-2 分钟）。
4. 刷新线上网址，即是最新内容。

> 记住：**内容在本地改，改完点"发布到云.bat"**。不要直接登录线上后台改（重启会丢）。

---

## 五、防止休眠（可选，强烈建议）

免费实例 15 分钟无访问就休眠。可用免费监控每 5-10 分钟访问一次保活：

1. 注册 **UptimeRobot**（https://uptimerobot.com ，免费）。
2. Add New Monitor → 类型 HTTP(s) → URL 填你的 `https://zhongmin-portal.onrender.com` → 间隔 5 分钟。
3. 保存。之后它每 5 分钟访问一次，网站基本保持唤醒、访客打开几乎不用等。

> 注意：Render 免费档每月 750 实例小时，24 小时常开约需 744 小时，刚好够用；若流量大可能超额并暂停到次月。

---

## 六、常见问题

- **构建失败（Build failed）**：看日志，多半是 `package.json` 或依赖问题；本项目已配好 `npm install` + `node server.js`，正常不会失败。
- **打开很慢/第一次转圈**：正常，免费实例冷启动约 1 分钟。用第五步保活可改善。
- **改了内容线上没变**：确认已执行 `发布到云.bat` 且推送成功；Render 部署完成后才生效。
- **后台改的内容过一会又变回旧的**：因为免费实例文件系统是临时的，这正是本方案的限制——只能在本地改 + 发布。
- **推送时 GitHub 连不上**：国内网络问题，需要开代理后重试。

---

## 七、网址会变吗？

不会。只要 Render 服务名不改，`https://zhongmin-portal.onrender.com` **永久固定**，客户收藏一次即可长期访问。

---

## 八、GitHub 连不上怎么办（已内置 SSH 443 通道）

实测本机 `github.com:443` 经常被国内网络封锁：`curl` 直接超时、`git push` 报 `CONNECT tunnel failed, response 502`。
但 **`ssh.github.com:443` 是可用的**。

`发布到云.bat` 已经自动把仓库地址改写成下面这种 443 端口形式，**不需要你再配代理**：

```
ssh://git@ssh.github.com:443/用户名/仓库名.git
```

### 8.1 首次使用：做一次公钥授权（只做一次）

1. 双击 `发布到云.bat`。如果窗口提示 **"尚未授权：SSH 公钥还没添加到 GitHub"**，它会自动打印一行以 `ssh-ed25519` 开头的公钥；
2. 复制那一整行（也可以打开 `C:\Users\Administrator\.ssh\id_ed25519.pub` 用记事本复制）；
3. 浏览器打开 <https://github.com/settings/ssh/new> ；
4. **Title** 随便填（如 `zhongmin`），**Key** 粘贴那一整行，点 **Add SSH key**；
5. 回到 `G:\ZhongMinWebsite`，重新双击 `发布到云.bat`。

### 8.2 提示"仓库不存在"怎么办

说明 GitHub 上还没有这个仓库，或者名字对不上。去 <https://github.com/new> 建一个**空仓库**：
- Repository name 填 `zhongmin-trade`
- 选 **Private**
- **不要**勾 Add a README file、不要选 .gitignore / License
- 点 **Create repository**

然后重跑 `发布到云.bat`，把仓库地址粘进去。

### 8.3 要换绑别的仓库

删掉绑定后重跑脚本，它会重新问你地址。命令行执行（在 `G:\ZhongMinWebsite` 下）：

```
git remote remove origin
```

再双击 `发布到云.bat`，粘贴新的仓库地址即可。

### 8.4 关于 .bat 编码（重要，别再改错）

所有 `.bat` 已统一为 **GBK(ANSI) 编码 + CRLF 换行**。这是中文 Windows 批处理唯一稳妥的编码：

- 若存成 UTF-8，cmd 按 GBK 解析会把中文字节和后面的 `echo` 粘连，导致命令被当成乱码执行，报 `'operable program or batch file` 之类的错；
- 若带 UTF-8 BOM，`@echo off` 会失效，窗口里会刷满每一行命令。

**改脚本请用 Notepad++ / VS Code 保存为 ANSI（GBK）**，不要用记事本"另存为 UTF-8"。
