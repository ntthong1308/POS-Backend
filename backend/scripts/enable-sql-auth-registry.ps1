# ============================================
# Script kích hoạt SQL Server Authentication (Mixed Mode)
# Sửa registry trực tiếp (cần quyền Administrator)
# ============================================

# Kiểm tra quyền Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "✗ Script này cần chạy với quyền Administrator!" -ForegroundColor Red
    Write-Host "  Right-click PowerShell → Run as Administrator" -ForegroundColor Yellow
    exit 1
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Kích hoạt Mixed Mode Authentication" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Tìm instance name
$instanceName = "MSSQLSERVER"  # Default instance
$regPath = "HKLM:\Software\Microsoft\MSSQLServer\MSSQLServer"

if (-not (Test-Path $regPath)) {
    Write-Host "✗ Không tìm thấy SQL Server registry key!" -ForegroundColor Red
    Write-Host "  Đường dẫn: $regPath" -ForegroundColor Yellow
    Write-Host "  Vui lòng kiểm tra SQL Server đã được cài đặt chưa." -ForegroundColor Yellow
    exit 1
}

Write-Host "Đang kiểm tra LoginMode hiện tại..." -ForegroundColor Yellow
$currentMode = Get-ItemProperty -Path $regPath -Name "LoginMode" -ErrorAction SilentlyContinue

if ($currentMode) {
    $mode = $currentMode.LoginMode
    Write-Host "  LoginMode hiện tại: $mode" -ForegroundColor White
    
    if ($mode -eq 1) {
        Write-Host "  → Windows Authentication Only" -ForegroundColor Yellow
    } elseif ($mode -eq 2) {
        Write-Host "  → Mixed Mode (SQL Server and Windows Authentication)" -ForegroundColor Green
        Write-Host ""
        Write-Host "✓ Đã ở chế độ Mixed Mode, không cần thay đổi!" -ForegroundColor Green
        exit 0
    }
}

Write-Host ""
Write-Host "Đang đặt LoginMode = 2 (Mixed Mode)..." -ForegroundColor Yellow
try {
    Set-ItemProperty -Path $regPath -Name "LoginMode" -Value 2 -Type DWord
    Write-Host "✓ Đã đặt LoginMode = 2" -ForegroundColor Green
} catch {
    Write-Host "✗ Lỗi khi đặt LoginMode: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Kiểm tra lại..." -ForegroundColor Yellow
$verify = Get-ItemProperty -Path $regPath -Name "LoginMode"
if ($verify.LoginMode -eq 2) {
    Write-Host "✓ Xác nhận: LoginMode = 2 (Mixed Mode)" -ForegroundColor Green
} else {
    Write-Host "✗ Có vấn đề: LoginMode = $($verify.LoginMode)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  HOÀN TẤT!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "QUAN TRỌNG: PHẢI RESTART SQL SERVER SERVICE!" -ForegroundColor Yellow
Write-Host ""
Write-Host "Cách restart:" -ForegroundColor Yellow
Write-Host "  Restart-Service -Name MSSQLSERVER" -ForegroundColor White
Write-Host ""
Write-Host "Hoặc:" -ForegroundColor Yellow
Write-Host "  1. Nhấn Win + R → services.msc" -ForegroundColor White
Write-Host "  2. Tìm 'SQL Server (MSSQLSERVER)'" -ForegroundColor White
Write-Host "  3. Right-click → Restart" -ForegroundColor White
Write-Host ""
Write-Host "Sau khi restart, bạn có thể:" -ForegroundColor Yellow
Write-Host "  - Kết nối với SQL Server Authentication" -ForegroundColor White
Write-Host "  - Username: sa" -ForegroundColor White
Write-Host "  - Password: 123456" -ForegroundColor White
Write-Host ""

