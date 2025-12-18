# 🧪 HƯỚNG DẪN E2E TESTS

**Ngày tạo:** 2025-12-01  
**Mục đích:** Hướng dẫn sử dụng và viết E2E tests

---

## ✅ CÁC TEST ĐÃ TẠO

### 1. **BaseE2ETest**
   - File: `retail-bootstrap/src/test/java/com/retail/e2e/BaseE2ETest.java`
   - Base class cho tất cả E2E tests
   - REST Assured configuration
   - Authentication helpers

### 2. **PosCheckoutE2ETest**
   - File: `retail-bootstrap/src/test/java/com/retail/e2e/PosCheckoutE2ETest.java`
   - Test POS checkout flow end-to-end
   - Cart validation
   - Invoice creation

### 3. **InventoryE2ETest**
   - File: `retail-bootstrap/src/test/java/com/retail/e2e/InventoryE2ETest.java`
   - Test inventory management
   - Inventory reports

### 4. **PaymentE2ETest**
   - File: `retail-bootstrap/src/test/java/com/retail/e2e/PaymentE2ETest.java`
   - Test payment processing
   - Payment verification

### 5. **ReportE2ETest**
   - File: `retail-bootstrap/src/test/java/com/retail/e2e/ReportE2ETest.java`
   - Test report generation
   - Revenue, Inventory, Sales reports

### 6. **Test Data**
   - File: `retail-bootstrap/src/test/resources/db/test-data.sql`
   - Test data setup for E2E tests

---

## 🎯 CÁC TÍNH NĂNG

✅ **End-to-End Testing**
- Test complete business flows
- Real database với Testcontainers
- Real HTTP requests với REST Assured

✅ **Test Data Management**
- SQL scripts for test data
- Cleanup after tests

✅ **REST API Testing**
- REST Assured integration
- Request/Response validation

---

## 🚀 CÁCH CHẠY TESTS

### **Run all E2E tests:**
```bash
mvn test -Dtest=*E2ETest
```

### **Run specific test:**
```bash
mvn test -Dtest=PosCheckoutE2ETest
```

### **Run with profile:**
```bash
mvn test -Dspring.profiles.active=test
```

---

## 📝 VIẾT E2E TEST MỚI

### **1. Extend BaseE2ETest:**
```java
class MyE2ETest extends BaseE2ETest {
    @Test
    void myTest() {
        // Test code here
    }
}
```

### **2. Use REST Assured:**
```java
Response response = givenAuth()
    .body(request)
    .when()
    .post("/api/endpoint")
    .then()
    .statusCode(200)
    .extract()
    .response();
```

### **3. Setup Test Data:**
```java
@Sql(scripts = "/db/test-data.sql", 
     executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Test
void myTest() {
    // Test with data
}
```

---

## ✅ CHECKLIST

- [x] BaseE2ETest created
- [x] PosCheckoutE2ETest created
- [x] InventoryE2ETest created
- [x] PaymentE2ETest created
- [x] ReportE2ETest created
- [x] Test data SQL script created
- [ ] Test all E2E tests locally
- [ ] Add more comprehensive test cases

---

**Hoàn thành! E2E Tests đã sẵn sàng. 🎉**

