# 🐳 HƯỚNG DẪN DOCKER - RETAIL PLATFORM

**Ngày tạo:** 2025-11-30  
**Mục đích:** Hướng dẫn sử dụng Docker để chạy Retail Platform

---

## ✅ CÁC FILE ĐÃ TẠO

1. **`Dockerfile`** - Multi-stage build cho Spring Boot application
2. **`docker-compose.yml`** - Development environment
3. **`docker-compose.prod.yml`** - Production environment
4. **`.dockerignore`** - Exclude files không cần thiết
5. **`application-docker.yml`** - Configuration cho Docker environment

---

## 🚀 QUICK START

### **1. Development Environment**

#### **Bước 1: Build và chạy tất cả services**
```bash
docker-compose up -d
```

Lệnh này sẽ:
- ✅ Build Docker image cho Retail Platform
- ✅ Start SQL Server container
- ✅ Start Redis container
- ✅ Start Retail Platform application

#### **Bước 2: Kiểm tra logs**
```bash
# Xem logs của tất cả services
docker-compose logs -f

# Xem logs của app only
docker-compose logs -f retail-platform

# Xem logs của database
docker-compose logs -f sqlserver
```

#### **Bước 3: Kiểm tra health**
```bash
# Health check của app
curl http://localhost:8080/actuator/health

# Hoặc mở browser:
# http://localhost:8080/actuator/health
```

#### **Bước 4: Truy cập application**
- **API:** http://localhost:8080
- **Swagger UI:** http://localhost:8080/swagger-ui.html
- **Actuator:** http://localhost:8080/actuator

---

### **2. Production Environment**

#### **Bước 1: Tạo file `.env` cho production**
```bash
# Tạo file .env
cat > .env << EOF
DB_PASSWORD=YourSecurePassword123!
REDIS_PASSWORD=YourRedisPassword123!
JWT_SECRET=YourJWTSecretKey123!
JWT_EXPIRATION=86400000
APP_PORT=8080
DB_PORT=1433
REDIS_PORT=6379
EOF
```

#### **Bước 2: Chạy production**
```bash
docker-compose -f docker-compose.prod.yml up -d
```

---

## 📋 CÁC LỆNH DOCKER THƯỜNG DÙNG

### **Build & Run**
```bash
# Build image
docker-compose build

# Build và chạy
docker-compose up -d

# Rebuild và chạy
docker-compose up -d --build

# Stop tất cả
docker-compose down

# Stop và xóa volumes (⚠️ Xóa data)
docker-compose down -v
```

### **Logs & Debugging**
```bash
# Xem logs real-time
docker-compose logs -f

# Xem logs của service cụ thể
docker-compose logs -f retail-platform

# Xem logs 100 dòng cuối
docker-compose logs --tail=100 retail-platform

# Vào container để debug
docker-compose exec retail-platform sh
```

### **Database Operations**
```bash
# Vào SQL Server container
docker-compose exec sqlserver /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P Retail@123456 \
  -Q "SELECT name FROM sys.databases"

# Backup database
docker-compose exec sqlserver /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P Retail@123456 \
  -Q "BACKUP DATABASE retail_db TO DISK = '/var/opt/mssql/backup/retail_db.bak'"
```

### **Redis Operations**
```bash
# Vào Redis container
docker-compose exec redis redis-cli

# Trong Redis CLI:
# - PING (test connection)
# - KEYS * (list all keys)
# - FLUSHALL (clear all data - ⚠️ careful)
```

---

## 🔧 CẤU HÌNH

### **Ports**
- **Application:** 8080
- **SQL Server:** 1433
- **Redis:** 6379

### **Volumes**
- **SQL Server data:** `sqlserver_data` (persistent)
- **Redis data:** `redis_data` (persistent)
- **Backups:** `./backups` (production only)

### **Networks**
- **retail-network:** Bridge network cho tất cả services

---

## 🐛 TROUBLESHOOTING

### **1. Container không start**

**Kiểm tra logs:**
```bash
docker-compose logs retail-platform
```

**Common issues:**
- Database chưa ready → Đợi healthcheck pass
- Port đã được sử dụng → Đổi port trong docker-compose.yml
- Memory không đủ → Tăng Docker Desktop memory

### **2. Application không connect được database**

**Kiểm tra:**
```bash
# Kiểm tra SQL Server đang chạy
docker-compose ps sqlserver

# Kiểm tra network
docker network inspect retail-platform_retail-network

# Test connection từ app container
docker-compose exec retail-platform sh
# Trong container:
# wget -O- http://sqlserver:1433
```

### **3. Redis connection failed**

**Kiểm tra:**
```bash
# Test Redis connection
docker-compose exec redis redis-cli ping

# Kiểm tra Redis logs
docker-compose logs redis
```

### **4. Build failed**

**Common issues:**
- Maven dependencies → Clear cache: `docker-compose build --no-cache`
- Out of memory → Tăng Docker Desktop memory
- Network issues → Check internet connection

---

## 📊 MONITORING

### **Container Stats**
```bash
# Xem resource usage
docker stats

# Xem stats của specific container
docker stats retail-platform-app
```

### **Health Checks**
```bash
# Health check của app
curl http://localhost:8080/actuator/health

# Metrics
curl http://localhost:8080/actuator/metrics
```

---

## 🔐 SECURITY NOTES

### **Development**
- ✅ SQL Server password: `Retail@123456` (có thể đổi)
- ✅ Redis không có password (development only)
- ✅ JWT secret: default (có thể đổi)

### **Production**
- ⚠️ **PHẢI** đổi tất cả passwords trong `.env`
- ⚠️ **PHẢI** set JWT_SECRET mạnh
- ⚠️ **PHẢI** enable Redis password
- ⚠️ **PHẢI** sử dụng HTTPS trong production
- ⚠️ **PHẢI** limit network access

---

## 🚢 DEPLOYMENT

### **Build và Push Image**
```bash
# Build
docker build -t retail-platform:latest .

# Tag cho registry
docker tag retail-platform:latest your-registry/retail-platform:latest

# Push
docker push your-registry/retail-platform:latest
```

### **Pull và Run**
```bash
# Pull image
docker pull your-registry/retail-platform:latest

# Run với docker-compose
docker-compose -f docker-compose.prod.yml up -d
```

---

## 📝 NOTES

1. **First Run:** Lần đầu chạy sẽ mất thời gian để:
   - Download images (SQL Server, Redis)
   - Build application image
   - Start containers
   - Run Flyway migrations

2. **Data Persistence:** Data được lưu trong Docker volumes, không mất khi restart containers

3. **Hot Reload:** Development mode không support hot reload. Cần rebuild image để apply changes.

4. **Performance:** 
   - Development: OK cho testing
   - Production: Cần tune resources (CPU, Memory)

---

## ✅ CHECKLIST

- [ ] Docker Desktop đã cài và chạy
- [ ] Ports 8080, 1433, 6379 chưa bị sử dụng
- [ ] Đủ memory cho Docker (recommend: 4GB+)
- [ ] Đã chạy `docker-compose up -d`
- [ ] Đã kiểm tra health: `curl http://localhost:8080/actuator/health`
- [ ] Đã test API endpoints

---

**Hoàn thành! Docker setup đã sẵn sàng. 🎉**

