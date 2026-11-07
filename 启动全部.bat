@echo off
chcp 936 >nul
cd /d "%~dp0"

REM 启动官网服务（后台窗口）
start "中旻官网服务" cmd /c "%~dp0server.bat"

REM 稍候再拉起固定外网隧道（命名隧道，固定子域名）
timeout /t 2 /nobreak >nul
start "中旻固定隧道" cmd /c "%~dp0固定隧道.bat"

exit
