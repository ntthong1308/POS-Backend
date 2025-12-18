-- ============================================
-- Script đơn giản tạo database (nếu script chính lỗi)
-- ============================================

USE master;
GO

-- Xóa database cũ nếu tồn tại
IF EXISTS (SELECT name FROM sys.databases WHERE name = 'retail_db')
BEGIN
    ALTER DATABASE retail_db SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE retail_db;
END
GO

-- Tạo database mới (đơn giản nhất)
CREATE DATABASE retail_db;
GO

PRINT 'Database retail_db đã được tạo thành công!';
GO

