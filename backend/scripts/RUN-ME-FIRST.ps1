# ============================================
# Script chạy nhanh - Kích hoạt SQL Server Authentication
# Chạy file này với quyền Administrator
# ============================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Kích hoạt SQL Server Authentication" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Kiểm tra quyền Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "✗ Script này cần chạy với quyền Administrator!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Cách chạy:" -ForegroundColor Yellow
    Write-Host "  1. Right-click file này" -ForegroundColor White
    Write-Host "  2. Chọn 'Run with PowerShell' (Run as Administrator)" -ForegroundColor White
    Write-Host ""
    Write-Host "Hoặc:" -ForegroundColor Yellow
    Write-Host "  1. Mở PowerShell với quyền Administrator" -ForegroundColor White
    Write-Host "  2. Chạy: .\RUN-ME-FIRST.ps1" -ForegroundColor White
    Write-Host ""
    pause
    exit 1
}

Write-Host "✓ Đã có quyền Administrator" -ForegroundColor Green
Write-Host ""

# Tìm instance name
$instanceName = "MSSQLSERVER"  # Default instance
$regPath = "HKLM:\Software\Microsoft\MSSQLServer\MSSQLServer"

if (-not (Test-Path $regPath)) {
    Write-Host "✗ Không tìm thấy SQL Server registry key!" -ForegroundColor Red
    Write-Host "  Đường dẫn: $regPath" -ForegroundColor Yellow
    Write-Host "  Vui lòng kiểm tra SQL Server đã được cài đặt chưa." -ForegroundColor Yellow
    Write-Host ""
    pause
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
        Write-Host ""
        pause
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
    Write-Host ""
    pause
    exit 1
}

Write-Host ""
Write-Host "Kiểm tra lại..." -ForegroundColor Yellow
$verify = Get-ItemProperty -Path $regPath -Name "LoginMode"
if ($verify.LoginMode -eq 2) {
    Write-Host "✓ Xác nhận: LoginMode = 2 (Mixed Mode)" -ForegroundColor Green
} else {
    Write-Host "✗ Có vấn đề: LoginMode = $($verify.LoginMode)" -ForegroundColor Red
    Write-Host ""
    pause
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  HOÀN TẤT!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "QUAN TRỌNG: PHẢI RESTART SQL SERVER SERVICE!" -ForegroundColor Yellow
Write-Host ""
Write-Host "Bạn có muốn restart SQL Server ngay bây giờ không? (Y/N)" -ForegroundColor Yellow
$restart = Read-Host

if ($restart -eq "Y" -or $restart -eq "y") {
    Write-Host ""
    Write-Host "Đang restart SQL Server Service..." -ForegroundColor Yellow
    try {
        Restart-Service -Name MSSQLSERVER -Force
        Write-Host "✓ SQL Server đã được restart" -ForegroundColor Green
        Start-Sleep -Seconds 3
        Write-Host ""
        Write-Host "Kiểm tra service..." -ForegroundColor Yellow
        $service = Get-Service -Name MSSQLSERVER
        if ($service.Status -eq "Running") {
            Write-Host "✓ SQL Server đang chạy" -ForegroundColor Green
        } else {
            Write-Host "⚠ SQL Server status: $($service.Status)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "✗ Không thể restart SQL Server: $_" -ForegroundColor Red
        Write-Host "  Vui lòng restart thủ công từ Services.msc" -ForegroundColor Yellow
    }
} else {
    Write-Host ""
    Write-Host "Cách restart thủ công:" -ForegroundColor Yellow
    Write-Host "  1. Nhấn Win + R → gõ services.msc" -ForegroundColor White
    Write-Host "  2. Tìm 'SQL Server (MSSQLSERVER)'" -ForegroundColor White
    Write-Host "  3. Right-click → Restart" -ForegroundColor White
}

Write-Host ""
Write-Host "Sau khi restart, kết nối với:" -ForegroundColor Yellow
Write-Host "  Server: localhost" -ForegroundColor White
Write-Host "  Authentication: SQL Server Authentication" -ForegroundColor White
Write-Host "  Username: sa" -ForegroundColor White
Write-Host "  Password: 123456" -ForegroundColor White
Write-Host ""
pause

