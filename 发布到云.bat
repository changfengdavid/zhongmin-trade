@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion
set "ROOT=G:\ZhongMinWebsite"
cd /d "%ROOT%"

echo ============================================================
echo   中旻官网 - 一键发布到 Render 云（固定网址）
echo   本地改完内容后双击本文件，即可更新线上网站
echo ============================================================
echo.

where git >nul 2>&1
if errorlevel 1 (
  echo [X] 未检测到 git，请先安装 Git for Windows：https://git-scm.com/download/win
  pause & exit /b 1
)

REM 1. 首次初始化仓库
if not exist ".git" (
  echo [1] 首次初始化 git 仓库...
  git init -b main >nul
  git config user.email "zhongmin@local"
  git config user.name "ZhongMin"
  git add -A
  git commit -m "init" >nul
  echo [OK] 已初始化
) else (
  echo [1] git 仓库已存在
)

REM 2. 检查远程仓库
git remote get-url origin >nul 2>&1
if errorlevel 1 (
  echo.
  echo [!] 还没有配置远程仓库（GitHub）。
  echo     先到 https://github.com/new 新建一个空仓库（不要勾选 README），
  echo     复制它的地址（形如 https://github.com/你的用户名/zhongmin.git），粘贴到下面：
  set /p REMOTE=请输入仓库地址: 
  if not "!REMOTE!"=="" (
    git remote add origin !REMOTE!
    echo [OK] 已设置远程仓库
  ) else (
    echo [X] 未输入地址，已退出。 & pause & exit /b 1
  )
)

REM 3. 提交最新内容
echo [2] 提交最新内容...
git add -A
git commit -m "update %date% %time%" >nul 2>&1
if errorlevel 1 ( echo     （没有新改动，跳过提交） ) else ( echo     [OK] 已提交 )
git branch -M main >nul 2>&1

REM 4. 推送到云端
echo [3] 推送到 GitHub（Render 会自动部署）...
git push -u origin main
if errorlevel 1 (
  echo.
  echo [X] 推送失败，常见原因：
  echo     1) GitHub 连不上（国内网络）：需要开代理/VPN 后重试；
  echo     2) 需要登录：用户名填 GitHub 用户名，密码填 Personal Access Token
  echo        （在 GitHub - Settings - Developer settings - Tokens 生成，勾选 repo）。
  echo.
  pause & exit /b 1
)

echo.
echo ============================================================
echo   [OK] 已推送！Render 会自动重新部署（约 1-2 分钟）。
echo   部署完成后，刷新你的 Render 网址即为最新内容。
echo ============================================================
echo.
pause
