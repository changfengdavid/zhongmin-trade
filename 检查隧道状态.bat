@echo off
chcp 936 >nul
setlocal EnableDelayedExpansion
set "ROOT=G:\ZhongMinWebsite"
set "BIN=%ROOT%\bin"
set "CF=%BIN%\cloudflared.exe"
set "HOST=zhongmin-trade.cfargotunnel.com"
set "ADDR=http://localhost:8080"
cd /d "%ROOT%"

echo ============================================================
echo   中旻官网 - 隧道状态自检
echo ============================================================
echo.

echo [1] cloudflared 进程是否运行：
tasklist 2>nul | findstr /i "cloudflared.exe" >nul
if errorlevel 1 ( echo     [X] 未运行 —— 隧道是死的，外网一定打不开 ) else ( echo     [OK] 正在运行 )
echo.

echo [2] 本机官网 8080 是否响应：
curl -s -o nul -w "local_http=%{http_code}" %ADDR% >nul 2>&1
if errorlevel 1 ( echo     [X] 8080 无响应 —— 源站没开，Cloudflare 会返回错误 ) else ( echo     [OK] 8080 正常响应 )
echo.

echo [3] 命名隧道与路由（需已登录 Cloudflare）：
if exist "%CF%" (
  echo     --- tunnel list ---
  "%CF%" tunnel list 2>&1 | more
  echo     --- route list ---
  "%CF%" tunnel route list 2>&1 | more
) else ( echo     [X] 缺少 cloudflared.exe )
echo.

echo [4] 外网地址连通性测试（可能需要等 10~30 秒才通）：
echo     正在请求 https://%HOST%/ ...
curl -s -o nul -w "public_http=%{http_code} time=%{time_total}s\n" --max-time 15 "https://%HOST%/" 2>&1
if errorlevel 1 ( echo     [!] 外网请求失败（隧道未连/未就绪/DNS 未生效） ) else ( echo     [OK] 外网地址可访问 )
echo.

echo ============================================================
echo   排错指引：
echo   - 进程未运行 或 外网不通：双击 固定隧道.bat 重启（会杀旧进程+新配置）
echo   - 8080 无响应：先双击 启动网站.bat 把官网起起来
echo   - 仍不行：打开“中旻固定隧道”黑色窗口，把里面红色报错发我
echo ============================================================
echo.
pause
