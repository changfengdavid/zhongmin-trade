@echo off
chcp 65001 >nul
setlocal
set "ROOT=G:\ZhongMinWebsite"
cd /d "%ROOT%"

echo ============================================================
echo   中旻官网 - 一键发布（确保最新内容已对外可访问）
echo ============================================================
echo.
echo [说明] 本方案用 Cloudflare 隧道，后台(/admin)修改的内容实时从本机磁盘
echo   读取并对外生效，无需重新打包上传。本工具负责：
echo     ① 确认本机官网服务在运行；
echo     ② 确认固定隧道在运行（首次会自动完成登录/建隧道/绑固定网址）；
echo     ③ 给出固定外网网址。
echo.

if not exist "%ROOT%\固定隧道.bat" (
  echo [X] 缺少 固定隧道.bat，请确认文件完整。
  pause & exit /b 1
)

call "%ROOT%\固定隧道.bat"
