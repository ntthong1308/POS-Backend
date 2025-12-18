# ⚡ QUICK START - PUSH LÊN GITHUB

**Hướng dẫn nhanh để push project lên GitHub**

---

## 🚀 CÁCH 1: SỬ DỤNG SCRIPT (Dễ nhất)

### **Chạy script:**
```powershell
.\scripts\github-push.ps1
```

Script sẽ hướng dẫn bạn từng bước!

---

## 🚀 CÁCH 2: THỦ CÔNG (Chi tiết)

### **1. Tạo repository trên GitHub:**
1. Vào https://github.com
2. Click **"New repository"**
3. Điền tên: `retail-platform`
4. Chọn Public hoặc Private
5. **KHÔNG** tích "Initialize with README"
6. Click **"Create repository"**

### **2. Copy repository URL:**
Sau khi tạo, copy URL:
```
https://github.com/YOUR_USERNAME/retail-platform.git
```

### **3. Add và commit code:**
```bash
# Add tất cả files
git add .

# Commit
git commit -m "Initial commit: Retail Platform"
```

### **4. Add remote và push:**
```bash
# Add remote (thay YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/retail-platform.git

# Push lên GitHub
git branch -M main
git push -u origin main
```

### **5. Nhập credentials:**
- **Username:** Tên GitHub của bạn
- **Password:** **Personal Access Token** (không phải password)
  - Tạo tại: https://github.com/settings/tokens
  - Permissions: `repo`

---

## 🔐 TẠO PERSONAL ACCESS TOKEN

1. Vào: https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Điền:
   - **Note:** `Retail Platform`
   - **Expiration:** 90 days (hoặc tùy chọn)
   - **Permissions:** ✅ `repo` (full control)
4. Click **"Generate token"**
5. **COPY TOKEN NGAY** (sẽ không hiện lại)
6. Dùng token này thay cho password

---

## ✅ VERIFY

Kiểm tra trên GitHub:
```
https://github.com/YOUR_USERNAME/retail-platform
```

---

## 📚 XEM THÊM

Chi tiết đầy đủ: [GITHUB_SETUP_GUIDE.md](GITHUB_SETUP_GUIDE.md)

---

**Chúc bạn thành công! 🎉**

