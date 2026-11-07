@echo off
chcp 65001 >nul
cd /d "%~dp0"

REM ============================================================
REM   提取当前对外地址 → 复制到剪贴板（随时双击即可）
REM   优先读临时地址.log（ADDRESS| 行），其次读外网日志.log
REM ============================================================
set "URL="

REM 临时模式：取 ADDRESS| 后的纯地址
for /f "tokens=1* delims=|" %%a in ('findstr /i "ADDRESS|" 临时地址.log 2^>nul') do set "URL=%%b"

REM 固定模式：取含 zhongmin-trade.com 的地址行
if not defined URL (
  for /f "tokens=*" %%a in ('findstr /i "https://www.zhongmin-trade.com https://zhongmin-trade.com" 外网日志.log 2^>nul') do set "URL=%%a"
)

if not defined URL (
  echo [!] 未找到对外地址，请先运行 临时外网.bat 或 外网_自动.bat 建立隧道。
  pause
  exit /b 1
)

REM 去掉前导空格
set "URL=%URL: =%"

echo 当前对外地址：%URL%
echo %URL% | clip
echo.
echo [OK] 已复制到剪贴板，直接 Ctrl+V 发送给客户即可。
echo.
pause
