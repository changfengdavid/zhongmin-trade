@echo off
chcp 936 >nul
cd /d "%~dp0"

set PORT=8080
set "CFD=bin\cloudflared.exe"

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
echo     下载完成后重新运行本脚本即可。
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
REM ===== 读取是否已配置固定域名 =====
set "TN="
if exist "bin\.tunnel_name" ( set /p TN=<"bin\.tunnel_name" )

REM ===== 用 PowerShell 包装启动：实时提取地址、写日志、自动复制剪贴板 =====
if defined TN (
  echo ============================================================
  echo   固定域名模式（地址自动复制剪贴板，详见 外网日志.log）
  echo ============================================================
  powershell -NoProfile -ExecutionPolicy Bypass -File 外网_隧道.ps1 -Mode named -TunnelName "%TN%"
) else (
  echo ============================================================
  echo   临时地址模式（地址自动复制剪贴板，详见 临时地址.log）
  echo   启动后可直接 Ctrl+V 发给客户；重启会变。
  echo ============================================================
  powershell -NoProfile -ExecutionPolicy Bypass -File 外网_隧道.ps1 -Mode quick -Port %PORT%
)
pause
