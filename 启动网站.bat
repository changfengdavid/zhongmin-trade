@echo off
chcp 936 >nul
cd /d "%~dp0"

REM ===== 端口（如需修改外网/内网访问端口，改这里）=====
set PORT=8080

REM ===== 自动定位 node 运行环境 =====
set "NODE_EXE=node"
if exist "%USERPROFILE%\.workbuddy\binaries\node\versions\22.12.0\node.exe" (
  set "NODE_EXE=%USERPROFILE%\.workbuddy\binaries\node\versions\22.12.0\node.exe"
) else (
  for /d %%d in ("%USERPROFILE%\.workbuddy\binaries\node\versions\*") do (
    if exist "%%d\node.exe" set "NODE_EXE=%%d\node.exe"
  )
)

echo ============================================
echo   青岛中旻国际贸易有限公司 门户
echo   本机访问： http://localhost:%PORT%
echo   后台管理： http://localhost:%PORT%/admin/
echo   默认管理员密码： admin123 （请尽快修改）
echo ============================================
echo.
"%NODE_EXE%" server.js
pause
