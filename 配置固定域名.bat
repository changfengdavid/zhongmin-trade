@echo off
chcp 65001 >nul
cd /d "%~dp0"

set "CFD=bin\cloudflared.exe"
set "TUNNEL_NAME=zhongmin"
set "DOMAIN=zhongmin-trade.com"

REM ===== 确保工具存在 =====
if not exist "%CFD%" (
  echo 正在下载 cloudflared ...
  powershell -NoProfile -Command "Invoke-WebRequest -Uri 'https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe' -OutFile 'bin\cloudflared.exe' -TimeoutSec 120"
)
if not exist "%CFD%" (
  echo [!] 下载失败，请手动下载后重跑本脚本。
  pause
  exit /b 1
)

echo ============================================================
echo   一次性配置：把 zhongmin-trade.com 变成【固定】外网域名
echo   前提：域名 zhongmin-trade.com 已在你的 Cloudflare 账户接入
echo         （在 Cloudflare 添加站点、按提示改 NS 即可，免费）
echo   本步骤会打开浏览器让你登录 Cloudflare（免费账号）。
echo ============================================================
echo.
echo [1/4] 登录 Cloudflare（浏览器跳转授权，选 zhongmin-trade.com 所在账户）...
"%CFD%" login
echo.
echo [2/4] 创建命名隧道「%TUNNEL_NAME%」...
"%CFD%" tunnel create %TUNNEL_NAME%
echo.
echo [3/4] 将域名指向隧道（www + 根域名）...
"%CFD%" tunnel route dns %TUNNEL_NAME% www.%DOMAIN%
"%CFD%" tunnel route dns %TUNNEL_NAME% %DOMAIN%
echo.
echo [4/4] 记录隧道名，供“外网访问.bat / 开机自启”使用...
(echo %TUNNEL_NAME%)>bin\.tunnel_name
echo.
echo ============================================================
echo   配置完成！
echo   以后双击“外网访问.bat”或开机自启，网站即长期在以下地址对外：
echo     https://www.zhongmin-trade.com
echo     https://zhongmin-trade.com
echo   （全程 HTTPS 加密，地址永久不变）
echo ============================================================
pause
