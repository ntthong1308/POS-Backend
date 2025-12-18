# 📘 Phần 2: Sơ Đồ Flow Tổng Quát

> Tài liệu mô tả luồng xử lý request từ khi nhận HTTP request đến khi trả về response

---

## 2.1. Request Flow Tổng Quát

### **Sơ Đồ Flow:**

```
HTTP Request
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ 1. RequestLoggingFilter (@Order(1))                     │
│    - Generate correlation ID                            │
│    - Log request (method, URI, user, IP)                │
│    - Add to MDC (Mapped Diagnostic Context)             │
└─────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ 2. CORS Filter (Spring Security)                         │
│    - Check CORS origin                                   │
│    - Add CORS headers                                    │
└─────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ 3. JwtAuthFilter (Spring Security)                      │
│    - Parse JWT token from Authorization header          │
│    - Validate JWT token                                 │
│    - Load UserDetails                                   │
│    - Set Authentication in SecurityContext              │
└─────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ 4. Security Filter Chain                                 │
│    - Check if endpoint is public                        │
│    - Check role/permission                              │
│    - Allow/Deny request                                  │
└─────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ 5. Controller                                            │
│    - @Valid validation (Bean Validation)                │
│    - Parse request body/params                          │
│    - Call Service method                                 │
└─────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ 6. Service Layer                                         │
│    - Business logic                                     │
│    - Transaction management (@Transactional)            │
│    - Cache operations (@Cacheable, @CacheEvict)         │
│    - Call Repository                                    │
│    - Call other Services                                │
└─────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ 7. Repository Layer                                      │
│    - JPA/Hibernate queries                              │
│    - Database operations                                │
└─────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ 8. Database (SQL Server)                                 │
│    - Execute SQL queries                                │
│    - Return results                                     │
└─────────────────────────────────────────────────────────┘
    │
    ▼ (Return path)
┌─────────────────────────────────────────────────────────┐
│ 9. Repository → Service                                  │
│    - Map Entity to DTO (Mapper)                         │
│    - Return DTO                                          │
└─────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ 10. Service → Controller                                │
│     - Return DTO                                         │
└─────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ 11. Controller → Response                                │
│     - Wrap in ApiResponse<T>                            │
│     - Set HTTP status                                   │
│     - Serialize to JSON (Jackson)                       │
└─────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ 12. RequestLoggingFilter (Response)                     │
│     - Log response (status, duration)                  │
│     - Clear MDC                                         │
└─────────────────────────────────────────────────────────┘
    │
    ▼
HTTP Response (JSON)
```

---

## 2.2. Chi Tiết Từng Bước

### **Bước 1: RequestLoggingFilter**

**File:** `retail-api/src/main/java/com/retail/api/filter/RequestLoggingFilter.java`

**Order:** `@Order(1)` - Chạy đầu tiên

**Chức năng:**
1. Generate correlation ID (hoặc lấy từ header `X-Correlation-ID`)
2. Generate request ID (UUID)
3. Lấy user từ SecurityContext (nếu có)
4. Lấy IP address
5. Add vào MDC (Mapped Diagnostic Context) để tất cả logs trong request có correlation ID
6. Log request: method, URI, user, IP
7. Wrap request/response để có thể đọc body nhiều lần
8. Sau khi response: log status, duration, clear MDC

**Code:**
```java
@Override
protected void doFilterInternal(HttpServletRequest request,
                                HttpServletResponse response,
                                FilterChain filterChain) {
    // Generate correlation ID
    String correlationId = getOrGenerateCorrelationId(request);
    
    // Add to MDC
    MDC.put("correlationId", correlationId);
    MDC.put("requestId", UUID.randomUUID().toString());
    MDC.put("user", getCurrentUser(request));
    MDC.put("ip", getClientIpAddress(request));
    
    // Log request
    logRequest(request, correlationId, ...);
    
    try {
        filterChain.doFilter(wrappedRequest, wrappedResponse);
    } finally {
        // Log response
        logResponse(wrappedResponse, correlationId, duration);
        MDC.clear();
    }
}
```

**Skip cho:**
- `/actuator/**`
- `/swagger-ui/**`
- `/v3/api-docs/**`

---

### **Bước 2: CORS Filter**

**File:** `retail-security/src/main/java/com/retail/security/config/SecurityConfig.java`

**Chức năng:**
- Kiểm tra origin có trong whitelist không
- Thêm CORS headers vào response

**Allowed Origins:**
- `http://localhost:3000` (React)
- `http://localhost:4200` (Angular)
- `http://localhost:5173` (Vite)

**Allowed Methods:**
- GET, POST, PUT, PATCH, DELETE, OPTIONS

---

### **Bước 3: JwtAuthFilter**

**File:** `retail-security/src/main/java/com/retail/security/jwt/JwtAuthFilter.java`

**Order:** Chạy trước `UsernamePasswordAuthenticationFilter`

**Chức năng:**
1. Parse JWT token từ header `Authorization: Bearer {token}`
2. Validate JWT token (signature, expiration)
3. Extract username từ token
4. Load `UserDetails` từ `UserDetailsService`
5. Tạo `Authentication` object
6. Set vào `SecurityContext`

**Code:**
```java
@Override
protected void doFilterInternal(HttpServletRequest request,
                                HttpServletResponse response,
                                FilterChain filterChain) {
    String jwt = parseJwt(request);
    if (jwt != null && jwtUtils.validateJwtToken(jwt)) {
        String username = jwtUtils.getUserNameFromJwtToken(jwt);
        UserDetails userDetails = userDetailsService.loadUserByUsername(username);
        
        UsernamePasswordAuthenticationToken authentication =
            new UsernamePasswordAuthenticationToken(
                userDetails, null, userDetails.getAuthorities());
        
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }
    filterChain.doFilter(request, response);
}
```

**Lưu ý:**
- Nếu không có token hoặc token invalid → request vẫn tiếp tục (có thể là public endpoint)
- Security Filter Chain sẽ quyết định allow/deny

---

### **Bước 4: Security Filter Chain**

**File:** `retail-security/src/main/java/com/retail/security/config/SecurityConfig.java`

**Chức năng:**
- Kiểm tra endpoint có trong whitelist không
- Kiểm tra role/permission
- Allow hoặc Deny request

**Public Endpoints (permitAll):**
- `/api/v1/auth/**` - Authentication
- `/api/v1/files/**` - File upload
- `/uploads/**` - Static files
- `/api/products/**` - Public product APIs
- `/api/customers/**` - Public customer APIs
- `/api/invoices/**` - Invoice PDF
- `/api/reports/**` - Excel reports
- `/actuator/**` - Health checks
- `/swagger-ui/**` - Swagger UI

**POS Endpoints (CASHIER, MANAGER, ADMIN):**
- `/api/v1/pos/**`

**Admin Endpoints (ADMIN, MANAGER):**
- `/api/v1/admin/**`

**Other:**
- Tất cả request khác cần authentication

---

### **Bước 5: Controller**

**Chức năng:**
1. Nhận HTTP request
2. **Bean Validation** (`@Valid`):
   - Validate request body/params
   - Nếu invalid → throw `MethodArgumentNotValidException`
3. Parse request:
   - `@RequestBody` → JSON to DTO
   - `@RequestParam` → Query parameters
   - `@PathVariable` → Path variables
4. Gọi Service method
5. Wrap response trong `ApiResponse<T>`
6. Trả về `ResponseEntity<ApiResponse<T>>`

**Example:**
```java
@PostMapping
public ResponseEntity<ApiResponse<InvoiceDTO>> checkout(
        @Valid @RequestBody CheckoutRequest request) {
    // Validation tự động chạy bởi @Valid
    InvoiceDTO invoice = posService.checkout(request);
    return ResponseEntity.ok(ApiResponse.success(invoice));
}
```

---

### **Bước 6: Service Layer**

**Chức năng:**
1. **Business Logic:**
   - Validate business rules
   - Tính toán (giá, khuyến mãi, điểm)
   - Xử lý nghiệp vụ

2. **Transaction Management:**
   - `@Transactional` - Tự động quản lý transaction
   - Nếu có exception → rollback
   - Nếu thành công → commit

3. **Caching:**
   - `@Cacheable` - Lấy từ cache hoặc query DB
   - `@CacheEvict` - Xóa cache sau khi update/delete
   - `@CachePut` - Cập nhật cache

4. **Call Repository:**
   - Load entities từ database
   - Save/update/delete entities

5. **Call Other Services:**
   - Ví dụ: `PosService` gọi `PromotionService` để tính khuyến mãi

6. **Map Entity to DTO:**
   - Sử dụng MapStruct Mapper
   - Convert Entity → DTO

**Example:**
```java
@Override
@Transactional
@CacheEvict(value = "invoices", allEntries = true)
public InvoiceDTO checkout(CheckoutRequest request) {
    // 1. Validate
    validateCart(request.getItems());
    
    // 2. Load entities
    NhanVien nhanVien = nhanVienRepository.findById(...);
    
    // 3. Business logic
    HoaDon hoaDon = createInvoice(...);
    
    // 4. Save
    hoaDonRepository.save(hoaDon);
    
    // 5. Map to DTO
    return invoiceMapper.toDto(hoaDon);
}
```

---

### **Bước 7: Repository Layer**

**Chức năng:**
1. **JPA Queries:**
   - Method name queries: `findByTenSanPham(String ten)`
   - `@Query` (JPQL): `@Query("SELECT s FROM SanPham s WHERE ...")`
   - Native SQL: `@Query(value = "SELECT * FROM ...", nativeQuery = true)`

2. **Optimization:**
   - `JOIN FETCH` - Eager load relationships
   - `@BatchSize` - Batch loading
   - Indexes - Tối ưu queries

3. **Return Entities:**
   - JPA returns Entity objects
   - Service layer sẽ map sang DTO

**Example:**
```java
@Query("SELECT DISTINCT h FROM HoaDon h " +
       "LEFT JOIN FETCH h.chiTietHoaDons ct " +
       "WHERE h.ngayTao BETWEEN :startDate AND :endDate")
List<HoaDon> getInvoicesForRevenueReport(
    @Param("startDate") LocalDateTime startDate,
    @Param("endDate") LocalDateTime endDate);
```

---

### **Bước 8: Database**

**Chức năng:**
- Execute SQL queries
- Return results
- Transaction management (commit/rollback)

**Connection Pool (HikariCP):**
- Max pool size: 20
- Min idle: 5
- Connection timeout: 30s

---

## 2.3. Exception Flow

### **Exception Handling Flow:**

```
Exception occurs
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ Service Layer throws Exception                          │
│ - BusinessException                                    │
│ - ResourceNotFoundException                           │
│ - ValidationException                                  │
└─────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ Controller không catch (propagate)                      │
└─────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ GlobalExceptionHandler (@RestControllerAdvice)          │
│ - Catch tất cả exceptions                              │
│ - Map to ApiResponse<ErrorDetail>                       │
│ - Set HTTP status code                                 │
└─────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ Response với Error Format                               │
│ {                                                       │
│   "errors": [                                           │
│     {                                                   │
│       "code": "VALIDATION_ERROR",                      │
│       "field": "nhanVienId",                           │
│       "message": "Nhân viên ID không được để trống"     │
│     }                                                   │
│   ]                                                     │
│ }                                                       │
└─────────────────────────────────────────────────────────┘
```

### **Exception Types:**

1. **ResourceNotFoundException**
   - HTTP Status: `404 NOT FOUND`
   - Error Code: `NOT_FOUND`
   - Example: "Sản phẩm không tồn tại"

2. **BusinessException**
   - HTTP Status: `400 BAD REQUEST`
   - Error Code: Tùy theo (INSUFFICIENT_STOCK, INVALID_QUANTITY, etc.)
   - Example: "Sản phẩm không đủ tồn kho"

3. **MethodArgumentNotValidException** (Bean Validation)
   - HTTP Status: `400 BAD REQUEST`
   - Error Code: `VALIDATION_ERROR`
   - Example: "Nhân viên ID không được để trống"

4. **BadCredentialsException** (Authentication)
   - HTTP Status: `401 UNAUTHORIZED`
   - Error Code: `UNAUTHORIZED`
   - Example: "Username hoặc password không chính xác"

5. **Exception** (General)
   - HTTP Status: `500 INTERNAL SERVER ERROR`
   - Error Code: `INTERNAL_ERROR`
   - Example: "Đã xảy ra lỗi hệ thống"

---

## 2.4. Authentication Flow

### **Login Flow:**

```
POST /api/v1/auth/login
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ AuthController.login()                                  │
│ - Validate request body (@Valid)                       │
└─────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ AuthenticationManager.authenticate()                    │
│ - Load UserDetails từ UserDetailsService               │
│ - Verify password (BCrypt)                             │
└─────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ JwtUtils.generateJwtToken()                             │
│ - Create JWT với username, expiration                   │
│ - Sign với secret key                                  │
└─────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ EmployeeService.findByUsername()                        │
│ - Load employee details                                │
└─────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ Return LoginResponse                                    │
│ {                                                       │
│   "token": "eyJhbGciOiJIUzI1NiIs...",                  │
│   "type": "Bearer",                                     │
│   "id": 1,                                             │
│   "username": "admin",                                 │
│   "role": "ADMIN",                                     │
│   "chiNhanhId": 1                                      │
│ }                                                       │
└─────────────────────────────────────────────────────────┘
```

### **Authenticated Request Flow:**

```
GET /api/v1/pos/products
Authorization: Bearer {token}
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ JwtAuthFilter                                            │
│ - Parse token từ header                                 │
│ - Validate token                                        │
│ - Load UserDetails                                      │
│ - Set Authentication                                    │
└─────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ Security Filter Chain                                   │
│ - Check role: CASHIER, MANAGER, ADMIN                  │
│ - Allow request                                         │
└─────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ Controller                                               │
│ - @PreAuthorize("hasAnyRole('CASHIER', 'MANAGER', 'ADMIN')") │
│ - Get Authentication từ SecurityContext                 │
└─────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ Service → Repository → Database                         │
└─────────────────────────────────────────────────────────┘
```

---

## 2.5. Caching Flow

### **Cache Read Flow:**

```
GET /api/products/1
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ ProductController.getProductById()                      │
└─────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ ProductService.findById()                                │
│ @Cacheable(value = "products", key = "#id")             │
└─────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ Check Redis Cache                                        │
│ - Key: "retail:products::1"                            │
│ - Nếu có → Return từ cache (fast ~10-50ms)             │
│ - Nếu không → Continue                                 │
└─────────────────────────────────────────────────────────┘
    │
    ▼ (Cache miss)
┌─────────────────────────────────────────────────────────┐
│ Repository.findById()                                   │
│ - Query database (slow ~200-500ms)                      │
└─────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ Save to Redis Cache                                      │
│ - Key: "retail:products::1"                            │
│ - TTL: 1 hour                                           │
└─────────────────────────────────────────────────────────┘
    │
    ▼
Return ProductDTO
```

### **Cache Write Flow:**

```
POST /api/v1/admin/products
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ ProductService.create()                                 │
│ @CacheEvict(value = "products", allEntries = true)      │
└─────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ Save to Database                                        │
└─────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ Clear Redis Cache                                        │
│ - Delete all keys matching "retail:products:*"        │
└─────────────────────────────────────────────────────────┘
    │
    ▼
Return ProductDTO
```

---

## 2.6. Transaction Flow

### **Transaction Management:**

```
@Transactional method
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ Spring Transaction Manager                              │
│ - Begin transaction                                     │
│ - Get connection from pool                             │
└─────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ Execute business logic                                  │
│ - Repository.save()                                     │
│ - Repository.update()                                  │
│ - Multiple operations                                   │
└─────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ Check for exceptions                                    │
│ - Nếu có exception → Rollback                          │
│ - Nếu không → Commit                                    │
└─────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ Return connection to pool                              │
└─────────────────────────────────────────────────────────┘
```

**Example:**
```java
@Transactional
public InvoiceDTO checkout(CheckoutRequest request) {
    // Tất cả operations trong transaction
    // Nếu có exception → rollback tất cả
    // Nếu thành công → commit tất cả
    
    HoaDon hoaDon = createInvoice(...);
    hoaDonRepository.save(hoaDon);
    
    // Update stock
    sanPham.setTonKho(sanPham.getTonKho() - soLuong);
    sanPhamRepository.save(sanPham);
    
    // Nếu exception ở đây → cả 2 operations đều rollback
    return invoiceMapper.toDto(hoaDon);
}
```

---

## 2.7. Audit Logging Flow

### **Audit Aspect Flow:**

```
@Audited method execution
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ AuditAspect.logAudit() (@Around)                        │
│ - Intercept method call                                 │
└─────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ Execute method                                          │
│ - Try: joinPoint.proceed()                             │
│ - Catch: exception                                      │
└─────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ Create Audit Log                                        │
│ - Extract entity name, action, ID                      │
│ - Get user from SecurityContext                         │
│ - Get IP address                                        │
│ - Serialize old/new values                              │
└─────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ AuditLogService.create()                                │
│ - Save to database                                      │
└─────────────────────────────────────────────────────────┘
    │
    ▼
Return method result
```

**Example:**
```java
@Audited(action = "CREATE", entityName = "Product")
public ProductDTO create(ProductDTO dto) {
    // Method execution
    // AuditAspect tự động ghi log sau khi method thành công
}
```

---

## 2.8. File Upload Flow

### **File Upload Flow:**

```
POST /api/v1/files/products/upload
Content-Type: multipart/form-data
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ FileUploadController.uploadProductImage()               │
│ - Receive MultipartFile                                 │
└─────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ FileStorageService.storeFile()                           │
│ - Validate file type (jpg, png, gif)                   │
│ - Validate file size (max 10MB)                        │
│ - Generate unique filename (UUID)                       │
│ - Create directory if not exists                       │
│ - Save file to disk                                    │
└─────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ Return file URL                                         │
│ "/uploads/products/abc123.jpg"                         │
└─────────────────────────────────────────────────────────┘
```

### **File Serve Flow:**

```
GET /uploads/products/abc123.jpg
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ FileServeController.serveFile()                          │
│ - Parse path từ URI                                     │
│ - Security check (path traversal)                       │
│ - Check file exists                                     │
└─────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ Return file as Resource                                 │
│ - Set Content-Type                                      │
│ - Set Content-Disposition: inline                      │
└─────────────────────────────────────────────────────────┘
```

---

## 2.9. Middleware/Interceptor/Filter Summary

### **Filter Chain Order:**

1. **RequestLoggingFilter** (`@Order(1)`)
   - Log request/response
   - Correlation ID tracking

2. **CORS Filter** (Spring Security)
   - CORS headers

3. **JwtAuthFilter** (Spring Security)
   - JWT token validation
   - Set Authentication

4. **Security Filter Chain** (Spring Security)
   - Authorization check

5. **Controller**
   - Request handling

6. **RequestLoggingFilter** (Response)
   - Log response
   - Clear MDC

---

## 2.10. Luồng Xử Lý Đặc Biệt

### **1. Login Flow (No Auth Required)**

```
POST /api/v1/auth/login
    │
    ▼
RequestLoggingFilter (log request)
    │
    ▼
CORS Filter
    │
    ▼
Security Filter Chain (permitAll - skip JWT)
    │
    ▼
AuthController.login()
    │
    ▼
AuthenticationManager.authenticate()
    │
    ▼
UserDetailsService.loadUserByUsername()
    │
    ▼
JwtUtils.generateJwtToken()
    │
    ▼
Return LoginResponse
```

### **2. Checkout Flow (Complex Transaction)**

```
POST /api/v1/pos/checkout
Authorization: Bearer {token}
    │
    ▼
JwtAuthFilter (validate token)
    │
    ▼
Security Filter Chain (check role: CASHIER, MANAGER, ADMIN)
    │
    ▼
PosCheckoutController.checkout()
    │
    ▼
PosService.checkout() (@Transactional)
    │
    ├─→ validateCart() (check stock)
    ├─→ Load entities (NhanVien, ChiNhanh, KhachHang)
    ├─→ Create HoaDon
    ├─→ For each item:
    │   ├─→ Load SanPham
    │   ├─→ Create ChiTietHoaDon
    │   ├─→ Update stock (sanPham.setTonKho(...))
    │   └─→ Save SanPham
    ├─→ Calculate promotion discount
    ├─→ Calculate final amount
    ├─→ Update customer points
    └─→ Save HoaDon
    │
    ▼
@CacheEvict (clear invoices cache)
    │
    ▼
Return InvoiceDTO
```

### **3. Cached Read Flow**

```
GET /api/products/1
    │
    ▼
ProductController.getProductById()
    │
    ▼
ProductService.findById() (@Cacheable)
    │
    ├─→ Check Redis: "retail:products::1"
    │   ├─→ Cache HIT → Return from cache (fast)
    │   └─→ Cache MISS → Continue
    │
    ▼ (Cache miss)
SanPhamRepository.findById()
    │
    ▼
Database query
    │
    ▼
Save to Redis cache
    │
    ▼
Return ProductDTO
```

---

**📝 Tài liệu tiếp theo:**
- [Phần 3: Chi Tiết Từng Module](./03_CHI_TIET_MODULE.md)

