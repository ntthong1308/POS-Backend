-- ============================================
-- Script HOÀN CHỈNH sửa lỗi Login failed for user 'sa'
-- Chạy với Windows Authentication (admin)
-- ============================================

USE master;
GO

PRINT '========================================';
PRINT 'SỬA LỖI ĐĂNG NHẬP SA - HOÀN CHỈNH';
PRINT '========================================';
PRINT '';

-- Bước 1: Kích hoạt Mixed Mode (nếu chưa)
PRINT 'Bước 1: Kiểm tra và kích hoạt Mixed Mode Authentication...';
DECLARE @LoginMode INT;
EXEC xp_instance_regread 
    @rootkey = 'HKEY_LOCAL_MACHINE',
    @key = 'Software\Microsoft\MSSQLServer\MSSQLServer',
    @value_name = 'LoginMode',
    @value = @LoginMode OUTPUT;

IF @LoginMode <> 2
BEGIN
    PRINT '  Đang đặt LoginMode = 2 (Mixed Mode)...';
    EXEC xp_instance_regwrite 
        @rootkey = 'HKEY_LOCAL_MACHINE',
        @key = 'Software\Microsoft\MSSQLServer\MSSQLServer',
        @value_name = 'LoginMode',
        @type = 'REG_DWORD',
        @value = 2;
    PRINT '  ✓ Đã đặt Mixed Mode';
    PRINT '  ⚠ CẦN RESTART SQL SERVER để áp dụng!';
END
ELSE
BEGIN
    PRINT '  ✓ Đã ở chế độ Mixed Mode';
END
GO

-- Bước 2: Tạo hoặc Enable user sa
PRINT '';
PRINT 'Bước 2: Tạo/Kích hoạt user sa...';
IF EXISTS (SELECT * FROM sys.server_principals WHERE name = 'sa')
BEGIN
    ALTER LOGIN sa ENABLE;
    PRINT '  ✓ User sa đã được kích hoạt';
END
ELSE
BEGIN
    CREATE LOGIN sa WITH PASSWORD = '123456', CHECK_POLICY = OFF, CHECK_EXPIRATION = OFF;
    PRINT '  ✓ User sa đã được tạo';
END
GO

-- Bước 3: Đặt password
PRINT '';
PRINT 'Bước 3: Đặt password cho user sa...';
ALTER LOGIN sa WITH PASSWORD = '123456', CHECK_POLICY = OFF, CHECK_EXPIRATION = OFF;
PRINT '  ✓ Password: 123456';
GO

-- Bước 4: Cấp quyền sysadmin
PRINT '';
PRINT 'Bước 4: Cấp quyền sysadmin...';
IF NOT EXISTS (
    SELECT 1 
    FROM sys.server_role_members rm
    JOIN sys.server_principals r ON rm.role_principal_id = r.principal_id
    JOIN sys.server_principals m ON rm.member_principal_id = m.principal_id
    WHERE r.name = 'sysadmin' AND m.name = 'sa'
)
BEGIN
    ALTER SERVER ROLE sysadmin ADD MEMBER sa;
    PRINT '  ✓ Đã cấp quyền sysadmin';
END
ELSE
BEGIN
    PRINT '  ✓ Đã có quyền sysadmin';
END
GO

-- Bước 5: Hiển thị kết quả
PRINT '';
PRINT 'Bước 5: Trạng thái user sa:';
SELECT 
    name AS LoginName,
    CASE WHEN is_disabled = 0 THEN '✓ Enabled' ELSE '✗ Disabled' END AS Status,
    type_desc AS LoginType,
    create_date,
    modify_date
FROM sys.server_principals
WHERE name = 'sa';
GO

PRINT '';
PRINT '========================================';
PRINT 'HOÀN TẤT CÁC BƯỚC!';
PRINT '========================================';
PRINT '';
PRINT 'QUAN TRỌNG:';
PRINT '  1. Nếu đã đổi LoginMode, PHẢI RESTART SQL Server Service';
PRINT '  2. Cách restart:';
PRINT '     - PowerShell: Restart-Service -Name MSSQLSERVER';
PRINT '     - Hoặc: Windows Services → SQL Server (MSSQLSERVER) → Restart';
PRINT '';
PRINT 'Sau khi restart, kết nối với:';
PRINT '  Server: localhost';
PRINT '  Username: sa';
PRINT '  Password: 123456';
PRINT '';
PRINT '========================================';
GO

