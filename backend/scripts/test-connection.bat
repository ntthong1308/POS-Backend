@echo off
REM ============================================
REM Script test kết nối SQL Server
REM ============================================

echo ========================================
echo   Test ket noi SQL Server
echo ========================================
echo.

set SERVER=localhost
set USER=sa
set PASS=123456

echo Dang test ket noi...
echo   Server: %SERVER%
echo   Username: %USER%
echo.

sqlcmd -S %SERVER% -U %USER% -P %PASS% -Q "SELECT @@VERSION AS 'SQL Server Version'; SELECT DB_NAME() AS 'Current Database';" 2>nul

if %errorLevel% equ 0 (
    echo.
    echo [OK] Ket noi thanh cong!
    echo.
    echo Kiem tra database retail_db...
    sqlcmd -S %SERVER% -U %USER% -P %PASS% -Q "IF EXISTS (SELECT name FROM sys.databases WHERE name = 'retail_db') SELECT 'Database retail_db da ton tai!' AS Status ELSE SELECT 'Database retail_db chua ton tai!' AS Status" 2>nul
    echo.
) else (
    echo.
    echo [ERROR] Khong the ket noi!
    echo.
    echo Kiem tra:
    echo   1. SQL Server Service dang chay?
    echo   2. Username va password dung?
    echo   3. Mixed Mode Authentication da kich hoat?
    echo.
)

pause

