@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ============================================================
echo   设置“开机自启 / 7x24 常驻外网”
echo   将创建 Windows 计划任务：当前用户登录时自动启动
echo   ① 中旻官网（本机 8080） ② 外网隧道（Cloudflare）
echo   创建后无需手动开任何窗口，重启电脑也会自动上线。
echo ============================================================
echo.

schtasks /create /tn "ZhongMinPortal" /tr "\"%~dp0启动全部.bat\"" /sc onlogon /rl highest /f

if "%errorlevel%"=="0" (
  echo.
  echo [成功] 已创建计划任务 ZhongMinPortal。
  echo   本机下次登录（或现在手动运行“启动全部.bat”）即自动上线。
  echo   查看/删除：任务计划程序 → ZhongMinPortal
) else (
  echo.
  echo [失败] 可能权限不足。请右键本文件 →“以管理员身份运行”后重试。
)
echo.
pause
