@echo off
chcp 65001 >nul
setlocal
set "BIN=G:\ZhongMinWebsite\bin"
set "EXE=%BIN%\koyeb.exe"
set "ZIP=%BIN%\koyeb-cli.zip"

echo ============================================
echo   Zhongmin Web - Auto Install Koyeb CLI
echo ============================================
echo.

REM --- 自检：已存在 koyeb.exe 则验证能否运行，不能则删除重装 ---
if exist "%EXE%" (
  "%EXE%" version >nul 2>&1
  if not errorlevel 1 (
    echo [OK] Found working koyeb.exe. Current version:
    "%EXE%" version
    echo.
    echo To reinstall, delete %EXE% and rerun this script.
    goto :done
  ) else (
    echo [!] Found a broken/old koyeb.exe, removing it first...
    del /f "%EXE%" >nul 2>&1
  )
)

if not exist "%BIN%" mkdir "%BIN%" 2>nul

echo [1/4] Download Koyeb CLI (Windows zip, ~12MB) ...
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command "$ErrorActionPreference='Stop'; $rel=Invoke-RestMethod -Uri 'https://api.github.com/repos/koyeb/koyeb-cli/releases/latest'; $asset=$rel.assets | Where-Object { $_.name -like '*windows_amd64.zip' } | Select-Object -First 1; if(-not $asset){ $asset=$rel.assets | Where-Object { $_.name -like '*windows*' -and $_.name -like '*.zip' } | Select-Object -First 1 }; if(-not $asset){ throw 'No Windows zip asset found' }; $base=$asset.browser_download_url; $mirrors=@($base, ('https://ghproxy.com/'+$base), ('https://mirror.ghproxy.com/'+$base), ('https://ghproxy.net/'+$base)); $ok=$false; foreach($u in $mirrors){ try { Write-Host ('Try: '+$u); Invoke-WebRequest -Uri $u -OutFile '%ZIP%' -TimeoutSec 120; $ok=$true; break } catch { Write-Host ('  failed: '+$_) } }; if(-not $ok){ throw 'All download sources failed' }; Write-Host ('Saved: %ZIP%')"

if errorlevel 1 (
  echo.
  echo [X] Download failed (GitHub unreachable). Please download manually:
  echo     1. Open: https://github.com/koyeb/koyeb-cli/releases
  echo     2. Download the file: koyeb-cli_*_windows_amd64.zip
  echo     3. Unzip it, find koyeb.exe, copy to: %BIN%
  goto :done
)

echo.
echo [2/4] Unzip and extract koyeb.exe ...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$ErrorActionPreference='Stop'; $zip='%ZIP%'; $dest='%BIN%'; Expand-Archive -Path $zip -DestinationPath $dest -Force; $exes=Get-ChildItem -Path $dest -Recurse -Filter 'koyeb.exe'; if($exes.Count -eq 0){ throw 'koyeb.exe not found inside zip' }; Copy-Item -Path $exes[0].FullName -Destination '%EXE%' -Force; Remove-Item $zip -Force; Write-Host ('Extracted: %EXE%')"

if errorlevel 1 (
  echo [X] Unzip failed. Please unzip %ZIP% manually and copy koyeb.exe to %BIN%
  goto :done
)

echo.
echo [3/4] Verify executable ...
"%EXE%" version
if errorlevel 1 (
  echo [X] koyeb.exe failed to run (corrupt or blocked by Windows).
  goto :done
)

echo.
echo [4/4] Add %BIN% to user PATH (permanent, no admin needed) ...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$p='%BIN%'; $scope='User'; $cur=[Environment]::GetEnvironmentVariable('Path',$scope); if($cur -notlike ('*'+$p+'*')){ [Environment]::SetEnvironmentVariable('Path',($cur.TrimEnd(';')+';'+$p),$scope); Write-Host 'Added to user PATH' } else { Write-Host 'PATH already contains it' }"

:done
echo.
echo ============================================
echo   Done. Next steps:
echo ============================================
echo.
echo  1) Close this window, open a NEW command prompt (Win+R -> cmd).
echo  2) Type:  koyeb version   (version shown = success)
echo  3) Authorize once:  koyeb login   (browser)
echo  4) Then double-click: G:\ZhongMinWebsite\发布网站.bat   （一键发布到固定网址）
echo.
echo  Note: if Windows blocks koyeb.exe (SmartScreen) on first run,
echo        click "More info" -> "Run anyway".
echo.
pause
