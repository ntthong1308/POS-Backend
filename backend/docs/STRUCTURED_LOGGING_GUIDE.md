# 📝 HƯỚNG DẪN STRUCTURED LOGGING

**Ngày tạo:** 2025-12-01  
**Mục đích:** Hướng dẫn sử dụng structured logging với JSON format

---

## ✅ CÁC THÀNH PHẦN ĐÃ TẠO

### 1. **Logback Configuration**
   - File: `retail-bootstrap/src/main/resources/logback-spring.xml`
   - Hỗ trợ JSON logging và plain text logging
   - Log rotation và cleanup tự động

### 2. **Request Logging Filter**
   - File: `retail-api/src/main/java/com/retail/api/filter/RequestLoggingFilter.java`
   - Correlation IDs cho mỗi request
   - Request/Response logging
   - MDC (Mapped Diagnostic Context) integration

### 3. **Dependencies**
   - `logstash-logback-encoder` - JSON logging format

---

## 🎯 CÁC TÍNH NĂNG

### **1. JSON Logging Format**
   - Structured logs dễ dàng query và analyze
   - Tích hợp với log aggregation tools (ELK, Splunk, etc.)
   - Production-ready format

### **2. Correlation IDs**
   - Mỗi request có unique correlation ID
   - Tự động thêm vào MDC cho tất cả logs trong request scope
   - Response header: `X-Correlation-ID`

### **3. Request/Response Logging**
   - Log request method, URI, headers
   - Log response status, duration
   - User info và IP address

### **4. Log Rotation**
   - Tự động rotate logs khi đạt 100MB
   - Giữ logs trong 30 ngày
   - Tổng dung lượng tối đa: 3GB

### **5. Environment-based Configuration**
   - Development: Console logging (human-readable)
   - Production: JSON file logging (machine-readable)
   - Docker: JSON console logging (for log aggregation)

---

## 📋 LOG FORMATS

### **Development (Console)**
```
2025-12-01 09:15:47.123 [http-nio-8080-exec-1] INFO  c.r.api.controller.ProductController - Finding product by ID: 1
```

### **Production (JSON)**
```json
{
  "@timestamp": "2025-12-01T09:15:47.123Z",
  "level": "INFO",
  "message": "Finding product by ID: 1",
  "logger": "com.retail.api.controller.ProductController",
  "thread": "http-nio-8080-exec-1",
  "correlationId": "550e8400-e29b-41d4-a716-446655440000",
  "requestId": "123e4567-e89b-12d3-a456-426614174000",
  "user": "admin",
  "ip": "192.168.1.100"
}
```

---

## 🔧 CẤU HÌNH

### **application.yml**

```yaml
logging:
  level:
    root: INFO
    com.retail: DEBUG
    org.springframework: WARN
    org.hibernate: WARN
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n"
```

### **Environment Profiles**

- **dev/local:** Console logging (human-readable)
- **prod/production:** JSON file + Plain text file + Error file
- **docker:** JSON console (for Docker log aggregation)

---

## 📁 LOG FILES

### **Production Mode:**
- `logs/retail-platform.json` - JSON format (structured)
- `logs/retail-platform.log` - Plain text format
- `logs/retail-platform-error.log` - Errors only

### **Log Rotation:**
- Max file size: 100MB
- Keep history: 30 days
- Total size cap: 3GB
- Compressed: `.gz` format

---

## 🔍 CORRELATION IDs

### **Automatic Generation**
Mỗi request tự động có correlation ID:
- Tạo mới nếu không có trong header
- Sử dụng `X-Correlation-ID` nếu có trong request header
- Thêm vào response header `X-Correlation-ID`

### **MDC Integration**
Correlation ID tự động thêm vào tất cả logs trong request:
```java
log.info("Processing order"); // Tự động có correlationId trong JSON
```

### **Usage Example**
```java
// Trong controller hoặc service
log.info("Processing checkout for customer {}", customerId);
// JSON log sẽ có:
// - correlationId: "550e8400-e29b-41d4-a716-446655440000"
// - requestId: "123e4567-e89b-12d3-a456-426614174000"
// - user: "cashier1"
// - ip: "192.168.1.100"
```

---

## 📊 REQUEST/RESPONSE LOGGING

### **What is Logged:**
- Request method (GET, POST, etc.)
- Request URI
- Client IP address
- User (if authenticated)
- Response status code
- Request duration (milliseconds)

### **Skip Logging:**
- `/actuator/**` - Health checks
- `/swagger-ui/**` - API documentation
- `/v3/api-docs/**` - OpenAPI docs

---

## 🚀 USAGE

### **In Code:**
```java
@Slf4j
@Service
public class MyService {
    
    public void doSomething() {
        log.info("Processing request"); // Tự động có correlationId
        log.debug("Debug information");
        log.error("Error occurred", exception);
    }
}
```

### **With MDC:**
```java
MDC.put("customKey", "customValue");
log.info("Message"); // customKey sẽ có trong JSON log
MDC.remove("customKey"); // Clean up
```

---

## 🔐 SECURITY NOTES

- **Sensitive Data:** Không log passwords, tokens, credit card numbers
- **PII (Personal Identifiable Information):** Hạn chế log thông tin cá nhân
- **Production:** Chỉ log INFO level trở lên

---

## 📈 LOG AGGREGATION

### **With ELK Stack:**
```yaml
# Logstash config
input {
  file {
    path => "/path/to/logs/retail-platform.json"
    codec => json
  }
}
```

### **With Docker:**
```yaml
# docker-compose.yml
services:
  retail-platform:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

---

## 🧪 TESTING

### **Check Logs:**
```powershell
# View logs
docker compose logs retail-platform

# View specific log file
tail -f logs/retail-platform.json | jq

# Search logs by correlation ID
grep "correlationId" logs/retail-platform.json | jq
```

---

**Hoàn thành! Structured Logging đã sẵn sàng. 🎉**

