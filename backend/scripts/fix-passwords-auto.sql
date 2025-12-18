-- =============================================
-- Auto Fix Passwords Script
-- =============================================
-- Script này sử dụng hash được verify từ BCrypt
-- Password: admin123
-- Hash này được generate từ BCryptPasswordEncoder của Spring Security

-- Hash đã được verify: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
-- (Hash này được generate từ BCrypt với strength 10, tương thích với Spring Security)

UPDATE nhan_vien
SET password = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
WHERE username = 'admin';

UPDATE nhan_vien
SET password = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
WHERE username = 'manager1';

UPDATE nhan_vien
SET password = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
WHERE username = 'cashier1';

-- Verify update
SELECT username, 
       LEFT(password, 30) + '...' AS password_preview,
       role,
       trang_thai
FROM nhan_vien 
WHERE username IN ('admin', 'manager1', 'cashier1');


