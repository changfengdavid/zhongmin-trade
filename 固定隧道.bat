@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion
set "ROOT=G:\ZhongMinWebsite"
set "BIN=%ROOT%\bin"
set "CF=%BIN%\cloudflared.exe"
set "TUN=zhongmin"
set "DOMAINFILE=%ROOT%\域名.txt"
set "CFHOME=%USERPROFILE%\.cloudflared"
set "CRED=%CFHOME%\cert.pem"
cd /d "%ROOT%"

echo ============================================================
echo   中旻官网 - 外网访问
echo ============================================================
echo.
echo [说明] Cloudflare 固定网址必须绑定"你自己拥有的域名"（约 30 元/年）。
echo   免费方案只能拿到会变化的临时地址（xxxx.trycloudflare.com）。
echo.
if not exist "%CF%" (
  echo [X] 缺少 cloudflared.exe（应在 %BIN%）
  pause & exit /b 1
)

REM 确保本机官网在 8080 运行
netstat -ano 2>nul | findstr /r ":8080 " >nul
if errorlevel 1 (
  echo [!] 官网未运行，正在启动...
  if exist "%ROOT%\启动网站.bat" ( start "" "%ROOT%\启动网站.bat" )
  timeout /t 5 >nul
)

REM 读取域名
set "MYDOMAIN="
if exist "%DOMAINFILE%" (
  for /f "usebackq delims=" %%a in ("%DOMAINFILE%") do if not defined MYDOMAIN set "MYDOMAIN=%%a"
)

if "%MYDOMAIN%"=="" (
  echo [!] 未配置域名（没有 %DOMAINFILE% 或内容为空）。
  echo.
  echo   现在两种选择：
  echo     A. 立刻免费对外 —— 临时地址，隧道重启会变（本工具将自动走临时隧道）
  echo     B. 永久固定网址 —— 先买域名（约 30 元/年），把域名写进 %DOMAINFILE% 再运行本工具
  echo.
  pause
  echo [A] 启动临时隧道...
  echo.
  if exist "%ROOT%\外网_自动.bat" ( call "%ROOT%\外网_自动.bat" ) else ( start "中旻临时隧道" cmd /k ""%CF%" tunnel --url http://localhost:8080 --no-autoupdate" )
  exit /b 0
)

echo [OK] 使用自有域名：%MYDOMAIN%
echo.

REM 1. 登录 Cloudflare（一次性）
if not exist "%CRED%" (
  echo [1] 首次需登录 Cloudflare（浏览器授权）...
  pause
  "%CF%" login
  if errorlevel 1 ( echo [X] 登录失败，请重试 & pause & exit /b 1 )
  echo [OK] 登录成功
) else ( echo [OK] 已登录 Cloudflare )

REM 2. 创建命名隧道
"%CF%" tunnel list 2>nul | findstr /i "%TUN%" >nul
if errorlevel 1 (
  echo [2] 创建命名隧道 %TUN% ...
  "%CF%" tunnel create %TUN%
  if errorlevel 1 ( echo [X] 隧道创建失败 & pause & exit /b 1 )
) else ( echo [OK] 命名隧道已存在 )

REM 3. 绑定固定子域名
set "HOST=www.%MYDOMAIN%"
"%CF%" tunnel route list 2>nul | findstr /i "%HOST%" >nul
if errorlevel 1 (
  echo [3] 绑定固定网址 %HOST% ...
  "%CF%" tunnel route dns %TUN% %HOST%
  if errorlevel 1 ( echo [!] 绑定失败（该域名是否已接入 Cloudflare？） )
) else ( echo [OK] 固定网址已绑定 )

REM 4. 生成配置并启动
echo [4] 生成配置并启动隧道...
if not exist "%CFHOME%" mkdir "%CFHOME%"
(
  echo tunnel: %TUN%
  echo ingress:
  echo   - hostname: %HOST%
  echo     service: http://localhost:8080
  echo   - service: http_status:404
) > "%CFHOME%\config.yml"

tasklist 2>nul | findstr /i "cloudflared.exe" >nul
if not errorlevel 1 (
  taskkill /f /im cloudflared.exe >nul 2>&1
  timeout /t 2 >nul
)
start "中旻固定隧道" cmd /k ""%CF%" tunnel run"
timeout /t 10 >nul

echo.
echo ============================================================
echo   固定外网网址： https://%HOST%/
echo   后台：       https://%HOST%/admin/
echo ============================================================
powershell -NoProfile -ExecutionPolicy Bypass -Command "$p='%ROOT%\固定地址.txt'; $c=@('官网：https://%HOST%/','后台：https://%HOST%/admin/ （默认密码 admin123，上线请修改）') -join [Environment]::NewLine; [System.IO.File]::WriteAllText($p,$c,[System.Text.UTF8Encoding]::new($true))"
powershell -NoProfile -ExecutionPolicy Bypass -Command "Set-Clipboard -Value @('官网：https://%HOST%/','后台：https://%HOST%/admin/') -join [Environment]::NewLine"
echo [OK] 地址已保存到 固定地址.txt 并复制到剪贴板
echo 请保持“中旻固定隧道”窗口常开。
echo.
pause
