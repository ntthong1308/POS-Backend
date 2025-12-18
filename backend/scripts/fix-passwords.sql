-- =============================================
-- Fix Passwords Script
-- =============================================
-- HƯỚNG DẪN:
-- 1. Start backend application
-- 2. Gọi endpoint: GET http://localhost:8081/api/v1/auth/generate-hash?password=admin123
-- 3. Copy hash từ response
-- 4. Thay thế HASH_VALUE bên dưới bằng hash vừa lấy
-- 5. Chạy script này trong SQL Server

-- Thay HASH_VALUE bằng hash từ endpoint /api/v1/auth/generate-hash
DECLARE @NewHash NVARCHAR(255) = 'HASH_VALUE';

-- Update password cho tất cả default users
UPDATE nhan_vien
SET password = @NewHash
WHERE username IN ('admin', 'manager1', 'cashier1');

-- Verify
SELECT username, password, role 
FROM nhan_vien 
WHERE username IN ('admin', 'manager1', 'cashier1');


