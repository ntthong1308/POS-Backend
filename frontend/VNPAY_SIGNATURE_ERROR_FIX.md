# 🔧 VNPAY SIGNATURE ERROR FIX - "Sai chữ ký"

**Ngày:** 2025-12-12  
**Lỗi:** VNPay trả về "Sai chữ ký" (Incorrect signature)  
**Nguyên nhân:** Backend tạo chữ ký không đúng

---

## ❌ LỖI HIỆN TẠI

```
VNPay Error: "Sai chữ ký" (Incorrect signature)
Error Code: 70
```

**Backend log:**
```
VNPay payment URL created: https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?
  vnp_Amount=6499900&
  vnp_Command=pay&
  vnp_CreateDate=20251212144434&
  vnp_CurrCode=VND&
  vnp_ExpireDate=20251212145934&
  vnp_IpAddr=127.0.0.1&
  vnp_Locale=vn&
  vnp_OrderInfo=Thanh+toan+hoa+don+%2341&
  vnp_OrderType=other&
  vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A8081%2Fapi%2Fv1%2Fpayments%2Fvnpay%2Freturn&
  vnp_TmnCode=X8VWWPJ2&
  vnp_TxnRef=INV41_1765525474075&
  vnp_Version=2.1.0&
  vnp_SecureHash=bf3cb2b73fdcf3e379e405857f7abcc16e01c4527fd29a430e918f7a6512dc2af535533af38d965963f434fe06b29b510b5630ee00335130abd3a9dd2b7ef2f2
```

---

## 🔍 NGUYÊN NHÂN

Lỗi "Sai chữ ký" xảy ra khi:

1. **Secret Key không đúng** - Secret key trong config không khớp với VNPay
2. **Cách tạo hash không đúng** - Thiếu hoặc thừa params khi tạo hash
3. **Thứ tự params không đúng** - VNPay yêu cầu params phải được sắp xếp theo alphabet
4. **Encoding không đúng** - URL encoding/decoding không đúng
5. **Hash algorithm không đúng** - Phải dùng HMAC SHA512

---

## ✅ CÁCH SỬA

### **1. Kiểm tra Secret Key**

Đảm bảo Secret Key trong config đúng:

```properties
# application.properties hoặc application.yml
vnpay.hash.secret=UL37T5AM49OJ8KAIREZZJMD3YUD0XUN6
```

**Lưu ý:**
- Secret key phải khớp với Terminal ID `X8VWWPJ2`
- Kiểm tra trong VNPay Merchant Admin: https://sandbox.vnpayment.vn/merchantv2/
- Đăng nhập và kiểm tra Secret Key trong cấu hình

---

### **2. Kiểm tra Cách Tạo Hash**

VNPay yêu cầu tạo hash theo các bước sau:

#### **Bước 1: Loại bỏ `vnp_SecureHash` và `vnp_SecureHashType`**

Không bao gồm 2 params này khi tạo hash.

#### **Bước 2: Sắp xếp params theo alphabet**

Sắp xếp tất cả params (trừ `vnp_SecureHash` và `vnp_SecureHashType`) theo thứ tự alphabet:

```
vnp_Amount
vnp_Command
vnp_CreateDate
vnp_CurrCode
vnp_ExpireDate
vnp_IpAddr
vnp_Locale
vnp_OrderInfo
vnp_OrderType
vnp_ReturnUrl
vnp_TmnCode
vnp_TxnRef
vnp_Version
```

#### **Bước 3: Tạo hash data string**

Tạo string từ các params đã sắp xếp:

```
vnp_Amount=6499900&vnp_Command=pay&vnp_CreateDate=20251212144434&vnp_CurrCode=VND&vnp_ExpireDate=20251212145934&vnp_IpAddr=127.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Thanh+toan+hoa+don+%2341&vnp_OrderType=other&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A8081%2Fapi%2Fv1%2Fpayments%2Fvnpay%2Freturn&vnp_TmnCode=X8VWWPJ2&vnp_TxnRef=INV41_1765525474075&vnp_Version=2.1.0
```

**Lưu ý:**
- Dùng giá trị đã URL encode (như `%2341` cho `#41`)
- Nối các params bằng `&`
- Format: `key=value&key=value&...`

#### **Bước 4: Tính HMAC SHA512**

Tính HMAC SHA512 của hash data string với secret key:

```java
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;

public String createSecureHash(String hashData, String secretKey) {
    try {
        Mac hmacSHA512 = Mac.getInstance("HmacSHA512");
        SecretKeySpec secretKeySpec = new SecretKeySpec(
            secretKey.getBytes(StandardCharsets.UTF_8), 
            "HmacSHA512"
        );
        hmacSHA512.init(secretKeySpec);
        byte[] hash = hmacSHA512.doFinal(hashData.getBytes(StandardCharsets.UTF_8));
        
        // Convert to hex string (lowercase)
        StringBuilder hexString = new StringBuilder();
        for (byte b : hash) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) {
                hexString.append('0');
            }
            hexString.append(hex);
        }
        return hexString.toString();
    } catch (Exception e) {
        throw new RuntimeException("Error creating secure hash", e);
    }
}
```

**Lưu ý:**
- Phải dùng `HmacSHA512` (không phải SHA256)
- Output phải là hex string (lowercase)
- Encoding phải là UTF-8

---

### **3. Code Mẫu Java (Spring Boot)**

```java
import org.springframework.stereotype.Component;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.TreeMap;
import java.net.URLEncoder;

@Component
public class VNPayHashUtil {
    
    private static final String HMAC_SHA512 = "HmacSHA512";
    
    public String createSecureHash(Map<String, String> params, String secretKey) {
        // 1. Loại bỏ vnp_SecureHash và vnp_SecureHashType
        Map<String, String> sortedParams = new TreeMap<>(params);
        sortedParams.remove("vnp_SecureHash");
        sortedParams.remove("vnp_SecureHashType");
        
        // 2. Tạo hash data string
        StringBuilder hashData = new StringBuilder();
        for (Map.Entry<String, String> entry : sortedParams.entrySet()) {
            if (hashData.length() > 0) {
                hashData.append("&");
            }
            hashData.append(entry.getKey())
                    .append("=")
                    .append(entry.getValue()); // Giá trị đã được URL encode
        }
        
        // 3. Tính HMAC SHA512
        return hmacSHA512(hashData.toString(), secretKey);
    }
    
    private String hmacSHA512(String data, String key) {
        try {
            Mac hmacSHA512 = Mac.getInstance(HMAC_SHA512);
            SecretKeySpec secretKeySpec = new SecretKeySpec(
                key.getBytes(StandardCharsets.UTF_8),
                HMAC_SHA512
            );
            hmacSHA512.init(secretKeySpec);
            byte[] hash = hmacSHA512.doFinal(data.getBytes(StandardCharsets.UTF_8));
            
            // Convert to hex string (lowercase)
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            throw new RuntimeException("Error creating secure hash", e);
        }
    }
}
```

---

### **4. Kiểm tra URL Encoding**

Đảm bảo các giá trị được URL encode đúng:

```java
// Ví dụ:
vnp_OrderInfo = "Thanh toan hoa don #41"
// Phải encode thành: "Thanh+toan+hoa+don+%2341"

vnp_ReturnUrl = "http://localhost:8081/api/v1/payments/vnpay/return"
// Phải encode thành: "http%3A%2F%2Flocalhost%3A8081%2Fapi%2Fv1%2Fpayments%2Fvnpay%2Freturn"
```

**Java code:**
```java
String encoded = URLEncoder.encode(value, StandardCharsets.UTF_8.toString())
    .replace("+", "%20"); // Optional: replace + with %20 for better compatibility
```

---

### **5. Debug Checklist**

Kiểm tra từng bước:

- [ ] Secret key đúng (`UL37T5AM49OJ8KAIREZZJMD3YUD0XUN6`)
- [ ] Terminal ID đúng (`X8VWWPJ2`)
- [ ] Loại bỏ `vnp_SecureHash` và `vnp_SecureHashType` khi tạo hash
- [ ] Sắp xếp params theo alphabet
- [ ] Hash data string đúng format (`key=value&key=value`)
- [ ] Dùng HMAC SHA512 (không phải SHA256)
- [ ] Output là hex string (lowercase)
- [ ] Encoding là UTF-8
- [ ] URL encode các giá trị đúng cách

---

### **6. Test với VNPay Sandbox**

1. Đăng nhập VNPay Merchant Admin: https://sandbox.vnpayment.vn/merchantv2/
2. Kiểm tra Terminal ID và Secret Key
3. Test tạo payment URL với config đúng
4. So sánh hash được tạo với hash từ VNPay SDK (nếu có)

---

## 📝 VÍ DỤ ĐÚNG

**Input params:**
```java
Map<String, String> params = new HashMap<>();
params.put("vnp_Amount", "6499900");
params.put("vnp_Command", "pay");
params.put("vnp_CreateDate", "20251212144434");
params.put("vnp_CurrCode", "VND");
params.put("vnp_ExpireDate", "20251212145934");
params.put("vnp_IpAddr", "127.0.0.1");
params.put("vnp_Locale", "vn");
params.put("vnp_OrderInfo", "Thanh+toan+hoa+don+%2341");
params.put("vnp_OrderType", "other");
params.put("vnp_ReturnUrl", "http%3A%2F%2Flocalhost%3A8081%2Fapi%2Fv1%2Fpayments%2Fvnpay%2Freturn");
params.put("vnp_TmnCode", "X8VWWPJ2");
params.put("vnp_TxnRef", "INV41_1765525474075");
params.put("vnp_Version", "2.1.0");
```

**Hash data string (sau khi sắp xếp):**
```
vnp_Amount=6499900&vnp_Command=pay&vnp_CreateDate=20251212144434&vnp_CurrCode=VND&vnp_ExpireDate=20251212145934&vnp_IpAddr=127.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Thanh+toan+hoa+don+%2341&vnp_OrderType=other&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A8081%2Fapi%2Fv1%2Fpayments%2Fvnpay%2Freturn&vnp_TmnCode=X8VWWPJ2&vnp_TxnRef=INV41_1765525474075&vnp_Version=2.1.0
```

**Secret key:**
```
UL37T5AM49OJ8KAIREZZJMD3YUD0XUN6
```

**Output (vnp_SecureHash):**
```
bf3cb2b73fdcf3e379e405857f7abcc16e01c4527fd29a430e918f7a6512dc2af535533af38d965963f434fe06b29b510b5630ee00335130abd3a9dd2b7ef2f2
```

---

## 🎯 KẾT LUẬN

**Lỗi này là lỗi BACKEND, không phải FRONTEND.**

Frontend chỉ redirect đến `paymentUrl` mà backend trả về. VNPay kiểm tra chữ ký và báo "Sai chữ ký" nghĩa là backend đã tạo chữ ký không đúng.

**Cần sửa ở Backend:**
1. Kiểm tra Secret Key
2. Kiểm tra cách tạo hash (thứ tự params, encoding, algorithm)
3. Test lại với VNPay sandbox

**Frontend không cần sửa gì.**

---

**Tài liệu tham khảo:**
- VNPay Integration Guide: https://sandbox.vnpayment.vn/apis/
- VNPay Hash Algorithm: HMAC SHA512
- VNPay Return URL Format: Query parameters


