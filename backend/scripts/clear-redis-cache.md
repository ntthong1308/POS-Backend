# Xóa Redis Cache

## Vấn đề
Cache cũ trong Redis chứa `PageImpl` object không thể deserialize, gây lỗi khi đọc cache.

## Giải pháp

### Cách 1: Xóa cache bằng Redis CLI (Khuyến nghị)

```bash
# Kết nối Redis
redis-cli

# Xóa tất cả cache của products
FLUSHDB

# Hoặc xóa chỉ cache products
KEYS retail:products:*
# Sau đó xóa từng key hoặc dùng:
DEL retail:products:*
```

### Cách 2: Xóa cache bằng code (Tự động khi restart)

Cache sẽ tự động expire sau TTL (1 giờ cho products). 
Hoặc restart Redis để xóa tất cả cache.

### Cách 3: Xóa cache qua API (Nếu có endpoint)

Nếu có endpoint quản lý cache, có thể gọi để xóa.

## Lưu ý

Sau khi xóa cache:
- ✅ Cache mới sẽ được tạo lại khi truy cập
- ✅ Chỉ cache `findById()` và `findByBarcode()` (không cache Page)
- ✅ Không còn lỗi deserialization

