@echo off
chcp 65001 >nul
cd /d "%~dp0"

REM ===== 端口需与 server.bat / 启动网站.bat 保持一致 =====
set PORT=8080
set "CFD=bin\cloudflared.exe"

echo ============================================================
echo   中旻门户 · 临时外网地址（最快对外，免账号、免买域名）
echo   用途：现在就发给客户看效果，地址形如 xxx.trycloudflared.com
echo   注意：这是临时地址，每次重连会变；
echo         想固定成 zhongmin-trade.com，见 README“方式 2”买域名后绑定
echo ============================================================
echo.

REM ===== 首次运行自动下载 cloudflared（多镜像兜底，仅缺失时）=====
if exist "%CFD%" goto :have
echo [1/2] 首次需下载隧道工具 cloudflared（约 30MB），自动尝试多个下载源...
set "OK=0"
call :trydl "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe"
if "%OK%"=="1" goto :have
call :trydl "https://gh-proxy.com/https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe"
if "%OK%"=="1" goto :have
call :trydl "https://ghproxy.com/https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe"
if "%OK%"=="1" goto :have
call :trydl "https://ghproxy.net/https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe"
if "%OK%"=="1" goto :have
call :trydl "https://mirror.ghproxy.com/https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe"
if "%OK%"=="1" goto :have
call :trydl "https://github.moeyy.xyz/https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe"
if "%OK%"=="1" goto :have

echo [!] 所有下载源均失败（本机网络受限）。请手动下载后放入 bin\ 目录：
echo     https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe
echo     下载完成后重新双击本脚本即可。
pause
exit /b 1

:trydl
set "SRC=%~1"
if exist "%CFD%" del /f "%CFD%" >nul 2>&1
echo   - 尝试：%SRC%
where curl.exe >nul 2>&1 && (
  curl.exe -L --max-time 120 -o "%CFD%" "%SRC%" >nul 2>&1
) || (
  powershell -NoProfile -Command "Invoke-WebRequest -Uri '%SRC%' -OutFile '%CFD%' -TimeoutSec 120 -ErrorAction SilentlyContinue" >nul 2>&1
)
if exist "%CFD%" ( set "OK=1" & echo     [OK] 下载成功 & goto :eof )
exit /b 1

:have
REM ===== 启动临时隧道（无需登录、无需域名）=====
echo [2/2] 启动临时隧道（请确保 启动网站.bat 已在运行，本机 8080 在跑）...
echo     稍候下方会显示 https://xxxx.trycloudflared.com
echo     复制该地址发给客户，即可外网访问你的官网。
echo     （保持此窗口开着；按 Ctrl+C 停止外网访问）
echo.
"%CFD%" tunnel --url http://localhost:%PORT%
pause
