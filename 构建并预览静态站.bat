@echo off
chcp 936 >nul
cd /d "%~dp0"
title 中旻官网 - 构建并预览静态站
echo.
echo  ==========================================
echo    中旻官网 - 构建并预览静态站
echo  ==========================================
echo.
echo  作用：把网站打包成纯静态版本，并在本机打开预览。
echo        预览效果 = 放到 Cloudflare Pages 后的真实效果。
echo.

set "NODE_EXE="
where node >nul 2>nul && set "NODE_EXE=node"
if not defined NODE_EXE if exist "C:/Program Files/nodejs/node.exe" set "NODE_EXE=C:/Program Files\nodejs\node.exe"
if not defined NODE_EXE if exist "C:/Users/Administrator/.workbuddy/binaries/node/versions/22.12.0/node.exe" set "NODE_EXE=C:/Users/Administrator/.workbuddy/binaries/node/versions/22.12.0/node.exe"

if not defined NODE_EXE (
  echo  [X] 没找到 Node.js
  echo      请先安装 Node.js： https://nodejs.org
  echo.
  pause
  exit /b 1
)

echo  [1/2] 正在构建静态站 ...
echo.
"%NODE_EXE%" build-static.js
if errorlevel 1 (
  echo.
  echo  [X] 构建失败，请把上面的错误信息发给我
  echo.
  pause
  exit /b 1
)

echo  [2/2] 正在启动本地预览 ...
echo.
"%NODE_EXE%" preview-static.js
pause
