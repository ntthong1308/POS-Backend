@echo off
REM ============================================
REM Script BAT - Kích hoạt SQL Server Authentication
REM Không cần PowerShell Execution Policy
REM ============================================

echo ========================================
echo   Kich hoat SQL Server Authentication
echo ========================================
echo.

REM Kiểm tra quyền Administrator
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [ERROR] Script nay can chay voi quyen Administrator!
    echo.
    echo Cach chay:
    echo   1. Right-click file nay
    echo   2. Chon "Run as administrator"
    echo.
    pause
    exit /b 1
)

echo [OK] Da co quyen Administrator
echo.

REM Kiểm tra registry path
set "REG_PATH=HKLM\Software\Microsoft\MSSQLServer\MSSQLServer"

echo Dang kiem tra LoginMode hien tai...
reg query "%REG_PATH%" /v LoginMode >nul 2>&1
if %errorLevel% neq 0 (
    echo [WARNING] Khong tim thay registry key!
    echo   Duong dan: %REG_PATH%
    echo.
    echo Ban co muon tao LoginMode moi? (Y/N)
    set /p CREATE_MODE=
    if /i "%CREATE_MODE%" neq "Y" (
        exit /b 1
    )
)

REM Đọc LoginMode hiện tại
for /f "tokens=3" %%a in ('reg query "%REG_PATH%" /v LoginMode 2^>nul ^| findstr "LoginMode"') do set CURRENT_MODE=%%a

if defined CURRENT_MODE (
    echo   LoginMode hien tai: %CURRENT_MODE%
    if "%CURRENT_MODE%"=="0x2" (
        echo   ^> Mixed Mode (OK - da o che do nay)
        echo.
        echo [OK] Da o che do Mixed Mode, khong can thay doi!
        echo.
        goto :restart_check
    ) else if "%CURRENT_MODE%"=="2" (
        echo   ^> Mixed Mode (OK - da o che do nay)
        echo.
        echo [OK] Da o che do Mixed Mode, khong can thay doi!
        echo.
        goto :restart_check
    ) else (
        echo   ^> Windows Authentication Only
    )
) else (
    echo   [INFO] LoginMode chua duoc dat
)

echo.
echo Dang dat LoginMode = 2 (Mixed Mode)...
reg add "%REG_PATH%" /v LoginMode /t REG_DWORD /d 2 /f >nul
if %errorLevel% neq 0 (
    echo [ERROR] Khong the dat LoginMode!
    echo   Co the can quyen Administrator cao hon
    pause
    exit /b 1
)

echo [OK] Da dat LoginMode = 2

REM Kiểm tra lại
echo.
echo Kiem tra lai...
for /f "tokens=3" %%a in ('reg query "%REG_PATH%" /v LoginMode 2^>nul ^| findstr "LoginMode"') do set NEW_MODE=%%a

if "%NEW_MODE%"=="0x2" (
    echo [OK] Xac nhan: LoginMode = 2 (Mixed Mode)
) else if "%NEW_MODE%"=="2" (
    echo [OK] Xac nhan: LoginMode = 2 (Mixed Mode)
) else (
    echo [WARNING] LoginMode = %NEW_MODE%
)

:restart_check
echo.
echo ========================================
echo   HOAN TAT!
echo ========================================
echo.
echo QUAN TRONG: PHAI RESTART SQL SERVER SERVICE!
echo.
echo Ban co muon restart SQL Server ngay bay gio? (Y/N)
set /p RESTART_SQL=
if /i "%RESTART_SQL%"=="Y" (
    echo.
    echo Dang restart SQL Server Service...
    net stop MSSQLSERVER >nul 2>&1
    timeout /t 3 /nobreak >nul
    net start MSSQLSERVER >nul 2>&1
    if %errorLevel% neq 0 (
        echo [WARNING] Khong the restart SQL Server
        echo   Vui long restart thu cong tu Services.msc
    ) else (
        echo [OK] SQL Server da duoc restart
        timeout /t 3 /nobreak >nul
        sc query MSSQLSERVER | findstr "RUNNING" >nul
        if %errorLevel% equ 0 (
            echo [OK] SQL Server dang chay
        )
    )
) else (
    echo.
    echo Cach restart thu cong:
    echo   1. Nhan Win + R ^> go services.msc
    echo   2. Tim 'SQL Server (MSSQLSERVER)'
    echo   3. Right-click ^> Restart
)

echo.
echo Sau khi restart, ket noi voi:
echo   Server: localhost
echo   Authentication: SQL Server Authentication
echo   Username: sa
echo   Password: 123456
echo.
pause

