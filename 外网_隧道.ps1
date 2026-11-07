param(
  [string]$Mode = "quick",   # quick=临时地址, named=固定域名
  [int]$Port = 8080,
  [string]$TunnelName = ""
)

$ErrorActionPreference = "SilentlyContinue"
$cfd = Join-Path $PSScriptRoot "bin/cloudflared.exe"
if (-not (Test-Path $cfd)) { Write-Host "[!] bin\cloudflared.exe 不存在，请先运行 外网_自动.bat 下载"; exit 1 }

if ($Mode -eq "named") {
  $cfArgs = "tunnel run $TunnelName"
  $logFile = "外网日志.log"
} else {
  $cfArgs = "tunnel --url http://localhost:$Port"
  $logFile = "临时地址.log"
}

# 关键修复：cloudflared 的临时地址输出在 stderr，用 cmd /c ... 2>&1 合并到 stdout 后读取
$inner = "`"$cfd`" $cfArgs 2>&1"
$psi = New-Object System.Diagnostics.ProcessStartInfo
$psi.FileName = "cmd.exe"
$psi.UseShellExecute = $false
$psi.RedirectStandardOutput = $true
$psi.StandardOutputEncoding = [System.Text.Encoding]::UTF8
$psi.Arguments = "/c `"$inner`""

$p = New-Object System.Diagnostics.Process
$p.StartInfo = $psi
$p.Start() | Out-Null

$lastAddr = $null

function Write-AddrLog($addr) {
  $t = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
  $lines = @()
  $lines += "============================================================"
  if ($Mode -eq "named") {
    $lines += "固定域名模式：已绑定 zhongmin-trade.com"
    $lines += "网站对外地址（HTTPS，永久不变）："
    $lines += "  https://www.zhongmin-trade.com"
    $lines += "  https://zhongmin-trade.com"
  } else {
    $lines += "临时外网地址（免账号、免域名，重启会变）"
    $lines += "生成时间：$t"
    $lines += "当前对外地址："
    $lines += "ADDRESS|$addr"
    $lines += "复制发给客户即可访问（HTTPS 加密）。"
    $lines += '绑定固定域名见 README “方式 2”。'
  }
  $lines += "============================================================"
  Set-Content -Path $logFile -Value ($lines -join "`n") -Encoding UTF8
}

Write-Host "隧道已启动（$Mode），正在等待对外地址..."
while ($true) {
  if ($p.StandardOutput.EndOfStream) {
    if ($p.HasExited) { break }
    Start-Sleep -Milliseconds 80
    continue
  }
  $line = $p.StandardOutput.ReadLine()
  if ($line) {
    Write-Host $line
    if ($line -match 'https://[a-z0-9\-]+\.trycloudflared\.com') {
      $addr = $Matches[0]
      if ($addr -ne $lastAddr) {
        $lastAddr = $addr
        try { Set-Clipboard -Value $addr } catch { }
        Write-AddrLog $addr
        Write-Host ""
        Write-Host ">>> 已自动复制到剪贴板：$addr"
        Write-Host ">>> 直接 Ctrl+V 即可发送给客户（窗口保持开启）"
        Write-Host ""
      }
    }
  }
}
$p.WaitForExit()
