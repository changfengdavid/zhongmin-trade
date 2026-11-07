@echo off
chcp 936 >nul
echo 提示：发布功能已整合到【发布网站.bat】，即将调用...
echo.
call "%~dp0发布网站.bat"
