@echo off
chcp 936 >nul
setlocal EnableDelayedExpansion
set "ROOT=G:\ZhongMinWebsite"
cd /d "%ROOT%"

echo ============================================================
echo   中旻官网 - 一键发布到云（Apply.Build / 任意 Git 平台）
echo ============================================================
echo.

REM ============ 1. 定位 git（系统版优先，其次内置便携版）============
set "GIT="
for /f "delims=" %%i in ('where git 2^>nul') do (
    if not defined GIT set "GIT=%%i"
)
if not defined GIT (
    for %%p in (
        "C:\Program Files\Git\cmd\git.exe"
        "C:\Program Files (x86)\Git\cmd\git.exe"
        "%LOCALAPPDATA%\Programs\Git\cmd\git.exe"
    ) do (
        if not defined GIT if exist %%p set "GIT=%%~p"
    )
)
if not defined GIT (
    for /d %%d in ("%USERPROFILE%\.workbuddy\binaries\PortableGit\versions\*") do (
        if not defined GIT if exist "%%~d\mingw64\bin\git.exe" set "GIT=%%~d\mingw64\bin\git.exe"
    )
)
if not defined GIT (
    echo [X] 未找到 git。
    echo     请安装 Git for Windows: https://git-scm.com/download/win
    pause & exit /b 1
)
for %%i in ("%GIT%") do set "GITDIR=%%~dpi"
for %%i in ("%GITDIR%..") do set "GITMINGW=%%~fi"
for %%i in ("%GITMINGW%\..") do set "GITROOT=%%~fi"
set "PATH=%GITDIR%;%GITROOT%\usr\bin;%GITROOT%\mingw64\bin;%PATH%"
set "GIT_SSH_COMMAND=ssh -o StrictHostKeyChecking=accept-new -o BatchMode=yes"
echo [OK] git : %GIT%
echo.

REM ============ 2. 初始化本地仓库 ============
if not exist ".git" (
    echo [1] 初始化 git 仓库...
    "%GIT%" init -b main >nul 2>&1
    "%GIT%" config user.email "zhongmin@local"
    "%GIT%" config user.name "ZhongMin"
    echo     完成
) else (
    echo [1] git 仓库已存在
)

REM ============ 3. 绑定远程仓库（自动转成 443 端口 SSH 地址）============
set "TMPD=%TEMP%\zm_pub"
if not exist "%TMPD%" mkdir "%TMPD%" >nul 2>&1
set "CURURL="
"%GIT%" remote get-url origin >"%TMPD%\remote.txt" 2>nul
if not errorlevel 1 set /p CURURL=<"%TMPD%\remote.txt"
if not defined CURURL (
    echo.
    echo [*] 尚未绑定 GitHub 仓库
    echo     到 https://github.com/new 新建空仓库（不要勾 README / License）
    echo     复制仓库地址粘贴到这里，https 或 ssh 格式都行，例如：
    echo       https://github.com/changfengdavid/zhongmin-trade.git
    echo.
    set /p "REMOTE=仓库地址: "
    if "!REMOTE!"=="" (
        echo [X] 未输入地址，已退出。
        pause & exit /b 1
    )
    set "R=!REMOTE:.git=!"
    set "R=!R:https://github.com/=!"
    set "R=!R:http://github.com/=!"
    set "R=!R:ssh://git@github.com/=!"
    set "R=!R:git@github.com:=!"
    set "SSHURL=ssh://git@ssh.github.com:443/!R!.git"
    "%GIT%" remote add origin "!SSHURL!"
    set "CURURL=!SSHURL!"
    echo [OK] 已绑定: !SSHURL!
) else (
    echo [2] 远程仓库: !CURURL!
)

REM ============ 4. 提交最新内容 ============
echo [3] 提交最新内容...
"%GIT%" add -A
"%GIT%" commit -m "update %date% %time%" >nul 2>&1
if errorlevel 1 (
    echo     没有新改动，跳过
) else (
    echo     [OK] 已提交
)
"%GIT%" branch -M main >nul 2>&1

REM ============ 5. 预检连接与授权 ============
echo [4] 检查 GitHub 连接与授权...
"%GIT%" ls-remote origin >"%TMPD%\ls.txt" 2>&1
if not errorlevel 1 goto :authed
findstr /i /c:"Permission denied" "%TMPD%\ls.txt" >nul 2>&1 && goto :needkey
findstr /i /c:"not found" "%TMPD%\ls.txt" >nul 2>&1 && goto :norepo
echo.
echo [X] 连不上 GitHub。
echo     原因通常是网络：github.com 的 443 端口在国内经常被封锁。
echo     本脚本已自动改走 ssh.github.com:443，若仍失败请开代理 / VPN 后重试。
echo.
type "%TMPD%\ls.txt"
pause & exit /b 1

:needkey
echo.
echo [*] 尚未授权：SSH 公钥还没添加到 GitHub。
echo.
echo     第 1 步  复制下面这一整行公钥
echo ------------------------------------------------------------
if exist "%USERPROFILE%\.ssh\id_ed25519.pub" (
    type "%USERPROFILE%\.ssh\id_ed25519.pub"
) else (
    echo     本机还没有密钥，正在生成...
    ssh-keygen -t ed25519 -f "%USERPROFILE%\.ssh\id_ed25519" -N "" -C "zhongmin-cloud" >nul 2>&1
    type "%USERPROFILE%\.ssh\id_ed25519.pub"
)
echo ------------------------------------------------------------
echo     第 2 步  打开 https://github.com/settings/ssh/new
echo     第 3 步  Title 随便填（如 zhongmin），Key 粘贴上面的内容，点 Add SSH key
echo     第 4 步  重新双击本脚本
echo.
pause & exit /b 1

:norepo
echo.
echo [*] 仓库不存在或链接不对。
echo     请先到 https://github.com/new 新建空仓库（不要勾 README / License）。
echo     当前绑定的是: !CURURL!
echo.
echo     要改地址，命令行执行下面这句（换成你的用户名和仓库名）：
echo       "%GIT%" remote set-url origin ssh://git@ssh.github.com:443/用户名/仓库名.git
echo.
pause & exit /b 1

:authed
echo     [OK] 连接与授权正常

REM ============ 6. 推送 ============
echo [5] 推送到 GitHub...
"%GIT%" push -u origin main
if errorlevel 1 (
    echo.
    echo [X] 推送失败，常见原因：
    echo   1. 网络中断：开代理 / VPN 后重试
    echo   2. 没有写权限：确认仓库属于当前 GitHub 账号
    echo   3. 仓库地址写错：用下面的命令改地址后重跑
    echo      "%GIT%" remote set-url origin ssh://git@ssh.github.com:443/用户名/仓库名.git
    echo.
    pause & exit /b 1
)

echo.
echo ============================================================
echo   [OK] 推送完成
echo   云平台会自动重新部署，约 1-2 分钟后线上即为最新内容
echo ============================================================
echo.
pause
