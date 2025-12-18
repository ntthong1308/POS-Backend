# 🚀 HƯỚNG DẪN PUSH PROJECT LÊN GITHUB

**Ngày:** 2025-12-01  
**Mục đích:** Hướng dẫn chi tiết cách push project Retail Platform lên GitHub

---

## 📋 BƯỚC 1: KIỂM TRA GIT

### **Kiểm tra git đã cài đặt:**
```bash
git --version
```

Nếu chưa cài đặt, download tại: https://git-scm.com/downloads

### **Kiểm tra xem đã có git repository:**
```bash
git status
```

Nếu hiện lỗi "not a git repository", cần init git.

---

## 📋 BƯỚC 2: INITIALIZE GIT REPOSITORY

### **Nếu chưa có git repository, chạy:**

```bash
# Khởi tạo git repository
git init

# Cấu hình user (nếu chưa config)
git config user.name "Your Name"
git config user.email "your.email@example.com"

# Hoặc config global
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

---

## 📋 BƯỚC 3: KIỂM TRA .GITIGNORE

Đảm bảo file `.gitignore` đã có và bao gồm:

```
# Build artifacts
target/
.mvn/wrapper/maven-wrapper.jar

# IDE files
.idea/
*.iml
*.iws
*.ipr
.vscode/

# Logs
logs/
*.log

# Environment files
.env
.env.local

# OS files
.DS_Store
Thumbs.db
```

**File `.gitignore` đã có sẵn trong project ✅**

---

## 📋 BƯỚC 4: TẠO REPOSITORY TRÊN GITHUB

### **4.1. Đăng nhập GitHub:**
- Truy cập: https://github.com
- Đăng nhập vào tài khoản của bạn

### **4.2. Tạo repository mới:**
1. Click nút **"New"** hoặc **"+"** → **"New repository"**
2. Điền thông tin:
   - **Repository name:** `retail-platform` (hoặc tên bạn muốn)
   - **Description:** `Multi-module retail management system with POS, Inventory, and Reports`
   - **Visibility:** 
     - ✅ **Public** (nếu muốn public)
     - ✅ **Private** (nếu muốn private)
   - ⚠️ **KHÔNG** tích "Initialize with README" (vì đã có code)
   - ⚠️ **KHÔNG** chọn license hoặc .gitignore (đã có sẵn)
3. Click **"Create repository"**

### **4.3. Copy repository URL:**
Sau khi tạo, GitHub sẽ hiển thị URL, copy nó:
- **HTTPS:** `https://github.com/your-username/retail-platform.git`
- **SSH:** `git@github.com:your-username/retail-platform.git`

---

## 📋 BƯỚC 5: ADD VÀ COMMIT CODE

### **5.1. Add tất cả files:**
```bash
# Add tất cả files (trừ những file trong .gitignore)
git add .

# Hoặc add từng file/folder cụ thể
git add *.md
git add src/
git add pom.xml
```

### **5.2. Commit code:**
```bash
# Commit với message
git commit -m "Initial commit: Retail Platform - Complete POS system with all features"

# Hoặc commit chi tiết hơn
git commit -m "Initial commit

- Complete POS system
- Payment Gateway Integration
- Promotion Management
- Audit Logging
- Docker Containerization
- CI/CD Pipeline
- E2E Tests
- Structured Logging"
```

---

## 📋 BƯỚC 6: ADD REMOTE VÀ PUSH

### **6.1. Add remote repository:**
```bash
# Thay YOUR_USERNAME và YOUR_REPO_NAME bằng thông tin của bạn
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Kiểm tra remote đã add chưa
git remote -v
```

### **6.2. Push code lên GitHub:**
```bash
# Push lên branch main
git branch -M main
git push -u origin main

# Hoặc nếu repository dùng master
git branch -M master
git push -u origin master
```

### **6.3. Nhập credentials:**
- Nếu dùng HTTPS, GitHub sẽ yêu cầu:
  - **Username:** Tên GitHub của bạn
  - **Password:** **Personal Access Token** (KHÔNG phải password)
    - Tạo token tại: https://github.com/settings/tokens
    - Permissions: `repo` (full control)

---

## 📋 BƯỚC 7: VERIFY

### **Kiểm tra trên GitHub:**
1. Truy cập: `https://github.com/YOUR_USERNAME/retail-platform`
2. Kiểm tra tất cả files đã được push
3. Kiểm tra README hiển thị đúng

---

## 🔐 TẠO PERSONAL ACCESS TOKEN (Nếu cần)

### **Nếu GitHub yêu cầu token:**

1. Truy cập: https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Điền thông tin:
   - **Note:** `Retail Platform Access`
   - **Expiration:** Chọn thời hạn (90 days, 1 year, etc.)
   - **Permissions:** Chọn `repo` (full control)
4. Click **"Generate token"**
5. **COPY TOKEN NGAY** (sẽ không hiện lại)
6. Dùng token này thay cho password khi push

---

## 📝 TẠO README.MD (Nếu chưa có)

Nếu chưa có README, tạo file `README.md`:

```markdown
# 🏪 Retail Platform

Multi-module retail management system with POS, Inventory, Reports, and more.

## ✨ Features

- ✅ POS Checkout System
- ✅ Payment Gateway Integration
- ✅ Promotion Management
- ✅ Inventory Management
- ✅ Audit Logging
- ✅ Excel Reports (Revenue, Inventory, Sales)
- ✅ PDF Invoice Generation
- ✅ Docker Containerization
- ✅ CI/CD Pipeline

## 🚀 Tech Stack

- Java 21
- Spring Boot 3.2.0
- SQL Server
- Redis
- Docker
- Maven

## 📚 Documentation

Xem thêm tại folder `docs/`

## 📄 License

[Your License]
```

---

## 🛠️ CÁC LỆNH GIT THƯỜNG DÙNG

### **Xem status:**
```bash
git status
```

### **Xem log:**
```bash
git log --oneline
```

### **Xem branches:**
```bash
git branch -a
```

### **Push changes mới:**
```bash
git add .
git commit -m "Your commit message"
git push
```

### **Pull changes từ GitHub:**
```bash
git pull origin main
```

### **Tạo branch mới:**
```bash
git checkout -b feature/new-feature
git push -u origin feature/new-feature
```

---

## ❓ TROUBLESHOOTING

### **Lỗi: "fatal: remote origin already exists"**
```bash
# Xóa remote cũ
git remote remove origin

# Add lại
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
```

### **Lỗi: "Permission denied"**
- Kiểm tra Personal Access Token
- Đảm bảo token có quyền `repo`

### **Lỗi: "refusing to merge unrelated histories"**
```bash
git pull origin main --allow-unrelated-histories
```

### **Xóa file đã commit nhầm:**
```bash
# Xóa file khỏi git (nhưng giữ lại local)
git rm --cached filename

# Commit
git commit -m "Remove file from git"
git push
```

---

## ✅ CHECKLIST

Trước khi push, đảm bảo:

- [ ] Đã kiểm tra `.gitignore`
- [ ] Đã tạo repository trên GitHub
- [ ] Đã copy repository URL
- [ ] Đã add và commit code
- [ ] Đã add remote origin
- [ ] Đã có Personal Access Token (nếu cần)
- [ ] Đã push code lên GitHub
- [ ] Đã verify trên GitHub

---

**Chúc bạn thành công! 🎉**

Nếu gặp lỗi, hãy check phần Troubleshooting hoặc xem log chi tiết.

