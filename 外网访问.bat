@echo off
chcp 65001 >nul
cd /d "%~dp0"

REM ===== 端口需与 server.bat / 启动网站.bat 保持一致 =====
set PORT=8080
set "CFD=bin\cloudflared.exe"

echo ============================================================
echo   中旻门户 · 外网访问（Cloudflare Tunnel）
echo   原理：本机主动向外连接，无需公网IP、无需路由器端口映射，
echo         外部用户经 Cloudflare 回源到本机 8080。数据始终在 G 盘。
echo ============================================================
echo.

REM ===== 首次运行自动下载 cloudflared（仅缺失时）=====
if not exist "%CFD%" (
  echo [1/2] 首次使用需下载隧道工具 cloudflared（约 30MB）...
  powershell -NoProfile -Command "Invoke-WebRequest -Uri 'https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe' -OutFile 'bin\cloudflared.exe' -TimeoutSec 120"
  echo.
)
if not exist "%CFD%" (
  echo [!] 自动下载失败（本机网络受限）。请手动下载后放入 bin\ 目录：
  echo     https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe
  echo     下载完成后重新双击本脚本即可。
  pause
  exit /b 1
)

REM ===== 已配置固定域名则走命名隧道，否则走临时地址 =====
if exist "bin\.tunnel_name" (
  set /p TN=<"bin\.tunnel_name"
  echo [2/2] 已配置固定域名，启动命名隧道「%TN%」...
  echo     网站将在以下地址长期对外可访问（HTTPS）：
  echo       https://www.zhongmin-trade.com
  echo       https://zhongmin-trade.com
  echo     （按 Ctrl+C 停止外网访问）
  echo.
  "%CFD%" tunnel run %TN%
) else (
  echo [2/2] 启动“临时外网地址”模式（免账号、立即可用，但地址每次会变）...
  echo     下方会显示 https://xxxx.trycloudflared.com，发给客户即可外网访问。
  echo     如需固定域名 zhongmin-trade.com，请先双击“配置固定域名.bat”做一次登录。
  echo     （按 Ctrl+C 停止外网访问）
  echo.
  "%CFD%" tunnel --url http://localhost:%PORT%
)
pause
