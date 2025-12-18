# 🚀 DOCKER QUICK START

## Cách 1: Dùng Script (Đơn giản nhất)

```powershell
# Start tất cả services
.\scripts\docker-start.ps1

# Xem logs
.\scripts\docker-logs.ps1

# Stop
.\scripts\docker-stop.ps1
```

## Cách 2: Dùng Docker Compose trực tiếp

```powershell
# Build và start
docker compose up -d --build

# Xem logs
docker compose logs -f

# Xem status
docker compose ps

# Stop
docker compose down
```

## ⏱️ Lần đầu chạy sẽ mất thời gian

- Download images: ~5-10 phút (tùy internet)
- Build application: ~3-5 phút
- Start containers: ~1-2 phút

**Tổng cộng: ~10-20 phút lần đầu**

## ✅ Sau khi start, kiểm tra:

```powershell
# Health check
curl http://localhost:8080/actuator/health

# Hoặc mở browser:
# http://localhost:8080/actuator/health
```

## 🐛 Troubleshooting

Nếu gặp lỗi:
```powershell
# Xem logs
docker compose logs

# Xem logs của service cụ thể
docker compose logs sqlserver
docker compose logs redis
docker compose logs retail-platform
```

