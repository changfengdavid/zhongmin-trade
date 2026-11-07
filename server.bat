@echo off
chcp 65001 >nul
cd /d "%~dp0"

set PORT=8080
set "NODE_EXE=node"
if exist "%USERPROFILE%\.workbuddy\binaries\node\versions\22.12.0\node.exe" (
  set "NODE_EXE=%USERPROFILE%\.workbuddy\binaries\node\versions\22.12.0\node.exe"
) else (
  for /d %%d in ("%USERPROFILE%\.workbuddy\binaries\node\versions\*") do (
    if exist "%%d\node.exe" set "NODE_EXE=%%d\node.exe"
  )
)

"%NODE_EXE%" server.js
