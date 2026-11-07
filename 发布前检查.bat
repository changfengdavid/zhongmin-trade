@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ============================================================
echo   中旻门户 · 发布前检查
echo   本地改完内容后，双击本脚本确认“可发布”，再去客户端一键发布
echo ============================================================
echo.

REM ===== 1. 定位 node =====
set "NODE_EXE="
where node >nul 2>nul && set "NODE_EXE=node"
if not defined NODE_EXE (
  if exist "%USERPROFILE%\.workbuddy\binaries\node\versions\22.12.0\node.exe" (
    set "NODE_EXE=%USERPROFILE%\.workbuddy\binaries\node\versions\22.12.0\node.exe"
  )
)
if not defined NODE_EXE (
  for /d %%d in ("%USERPROFILE%\.workbuddy\binaries\node\versions\*") do (
    if not defined NODE_EXE if exist "%%d\node.exe" set "NODE_EXE=%%d\node.exe"
  )
)
if not defined NODE_EXE (
  echo [X] 未找到 Node.js，请先安装 Node 或打开 WorkBuddy 客户端后再试。
  pause & exit /b 1
)
echo [OK] 运行环境：%NODE_EXE%

REM ===== 2. config.json 合法性 + 内容概览 =====
echo.
echo [2/6] 校验 data\config.json ...
"%NODE_EXE%" -e "JSON.parse(require('fs').readFileSync('data/config.json','utf8'));" >nul 2>&1
if errorlevel 1 (
  echo   [X] config.json 不是合法 JSON（可能后台保存被中断），请在后台重新保存或恢复备份。
  pause & exit /b 1
)
echo   [OK] config.json 合法
"%NODE_EXE%" -e "const c=JSON.parse(require('fs').readFileSync('data/config.json','utf8'));const s=c.site.contact;console.log('   公司:',c.site.name.zh,'/ ',c.site.name.en);console.log('   产品',c.products.length,'条 | 新闻',c.news.length,'条 | 伙伴',c.partners.length,'条 | 资质',c.certificates.length,'条');console.log('   官网网址:',s.website||'(未设)');console.log('   联系邮箱:',s.email||'(未设)');console.log('   联系电话:',s.phone||'(占位，待替换)');"

REM ===== 3. 核心文件 =====
echo.
echo [3/6] 检查核心文件 ...
set "FILES_OK=1"
if not exist server.js (echo   [X] 缺少 server.js & set FILES_OK=0)
if not exist package.json (echo   [X] 缺少 package.json & set FILES_OK=0)
if not exist public\index.html (echo   [X] 缺少 public\index.html & set FILES_OK=0)
if not exist public\admin\index.html (echo   [X] 缺少 public\admin\index.html & set FILES_OK=0)
if %FILES_OK%==1 echo   [OK] server.js / package.json / 前端 / 后台 齐全

REM ===== 4. 依赖是否安装（影响云端 install 速度）=====
echo.
echo [4/6] 检查依赖 node_modules ...
if exist node_modules\express (
  echo   [OK] express 已安装（云端安装会更快/更稳定）
) else (
  echo   [!] node_modules 缺失 —— 不影响发布，但云端首次会执行 npm install，稍慢。
)

REM ===== 5. 上传图片目录 =====
echo.
echo [5/6] 检查 public\uploads ...
if not exist public\uploads mkdir public\uploads
echo   [OK] public\uploads 存在（后台上传的图片都在这）

REM ===== 6. 端口提示（非阻断）=====
echo.
echo [6/6] 端口提示 ...
echo   [提示] 发布到云端后，云上站点独立运行在 8080，与本地 8080 互不冲突。
echo   [提示] 本地 8080 是否开着都不影响云端发布；但若要本地预览请先双击 启动网站.bat。

REM ===== 生成发布摘要 =====
"%NODE_EXE%" -e "const c=JSON.parse(require('fs').readFileSync('data/config.json','utf8'));const fs=require('fs');const t=new Date().toLocaleString('zh-CN');const lines=['中旻门户 发布摘要','生成时间: '+t,'','公司: '+c.site.name.zh+' / '+c.site.name.en,'官网: '+(c.site.contact.website||'(未设)'),'产品: '+c.products.length+' | 新闻: '+c.news.length+' | 伙伴: '+c.partners.length+' | 资质: '+c.certificates.length,'','说明: 本文件由 发布前检查.bat 生成。G盘为源，云端为镜像；本地改完务必“重新发布”云端才更新。'];fs.writeFileSync('发布摘要.txt',lines.join('\n'),'utf8');"
echo.
echo   已生成 发布摘要.txt（可备查“本次发布了什么”）

REM ===== 总结 =====
echo.
echo ============================================================
echo   检查完成。若上面没有 [X]，即可去 WorkBuddy 客户端一键发布：
echo     打开 WorkBuddy → 找到 G:\ZhongMinWebsite → 「发布为应用」
echo     或：设置 → 数据管理 → 我发布的应用 → 中旻门户 → 重新部署
echo   详细步骤见 重新发布指南.md
echo ============================================================
echo.
pause
