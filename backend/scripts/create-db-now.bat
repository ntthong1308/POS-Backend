@echo off
REM ============================================
REM Script tạo database retail_db ngay lập tức
REM ============================================

echo ========================================
echo   Tao database retail_db
echo ========================================
echo.

set SERVER=localhost
set USER=sa
set PASS=123456

echo Dang tao database...
echo   Server: %SERVER%
echo   Database: retail_db
echo.

sqlcmd -S %SERVER% -U %USER% -P %PASS% -Q "USE master; IF EXISTS (SELECT name FROM sys.databases WHERE name = 'retail_db') BEGIN ALTER DATABASE retail_db SET SINGLE_USER WITH ROLLBACK IMMEDIATE; DROP DATABASE retail_db; PRINT 'Da xoa database cu'; END CREATE DATABASE retail_db; PRINT 'Database retail_db da duoc tao thanh cong!';" 2>nul

if %errorLevel% equ 0 (
    echo.
    echo [OK] Database da duoc tao!
    echo.
    echo Kiem tra database:
    sqlcmd -S %SERVER% -U %USER% -P %PASS% -Q "SELECT name, database_id, create_date FROM sys.databases WHERE name = 'retail_db'" 2>nul
    echo.
) else (
    echo.
    echo [ERROR] Khong the tao database!
    echo.
    echo Kiem tra:
    echo   1. Ket noi SQL Server thanh cong?
    echo   2. User sa co quyen tao database?
    echo.
    echo Chay script test: test-connection.bat
    echo.
)

pause

