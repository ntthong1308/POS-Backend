# 🚀 HƯỚNG DẪN CI/CD PIPELINE

**Ngày tạo:** 2025-12-01  
**Mục đích:** Hướng dẫn sử dụng CI/CD pipeline với GitHub Actions

---

## ✅ CÁC WORKFLOW ĐÃ TẠO

### 1. **CI Pipeline** (`ci.yml`)
   - Build và test tự động khi push/PR
   - Chạy với SQL Server và Redis services
   - Upload test results và JAR artifacts

### 2. **Code Quality** (`code-quality.yml`)
   - Code quality checks
   - Dependency validation
   - Vulnerability scanning

### 3. **CD Pipeline** (`cd.yml`)
   - Build Docker image
   - Deploy to production (placeholder)
   - Health checks

### 4. **PR Checks** (`pr-checks.yml`)
   - Pre-merge validation
   - Merge conflict checks
   - Test coverage

### 5. **Nightly Build** (`nightly-build.yml`)
   - Scheduled builds (2 AM UTC daily)
   - Full test suite
   - Artifact storage

---

## 🎯 CÁC TÍNH NĂNG

### **1. Continuous Integration (CI)**
- ✅ Tự động build khi push code
- ✅ Tự động chạy tests
- ✅ Upload test results
- ✅ Build JAR artifacts

### **2. Code Quality**
- ✅ Validate POM files
- ✅ Dependency tree analysis
- ✅ Code formatting checks (nếu có)

### **3. Continuous Deployment (CD)**
- ✅ Build Docker images
- ✅ Push to Docker Hub (nếu config)
- ✅ Deploy automation (placeholder)

### **4. PR Validation**
- ✅ Pre-merge checks
- ✅ Test coverage
- ✅ PR comments với results

---

## 📋 WORKFLOW TRIGGERS

### **CI Pipeline**
- Trigger: Push to `main`, `develop`, `master` hoặc PR
- Actions:
  1. Checkout code
  2. Setup JDK 21
  3. Cache Maven dependencies
  4. Build project
  5. Run tests
  6. Package JAR
  7. Upload artifacts

### **CD Pipeline**
- Trigger: Push to `main`/`master` hoặc tags `v*`
- Actions:
  1. Build Docker image
  2. Push to registry (optional)
  3. Deploy to production (placeholder)

### **PR Checks**
- Trigger: Pull request
- Actions:
  1. Check merge conflicts
  2. Validate formatting
  3. Build and test
  4. Check coverage
  5. Comment PR với results

---

## 🔧 CẤU HÌNH

### **1. GitHub Secrets (nếu cần)**

Để sử dụng Docker Hub hoặc deployment, thêm secrets trong GitHub Settings:

```
DOCKER_HUB_USERNAME=your-username
DOCKER_HUB_PASSWORD=your-password
```

### **2. Environment Variables**

Workflows sử dụng:
- `SPRING_PROFILES_ACTIVE=test`
- `SPRING_DATASOURCE_URL` - SQL Server connection
- `SPRING_DATA_REDIS_HOST` - Redis connection

---

## 🚀 CÁCH SỬ DỤNG

### **1. Push Code**
```bash
git push origin main
# CI pipeline tự động chạy
```

### **2. Create Pull Request**
```bash
git checkout -b feature/new-feature
# ... make changes ...
git push origin feature/new-feature
# Tạo PR trên GitHub
# PR Checks tự động chạy
```

### **3. View Results**
- Vào **Actions** tab trên GitHub
- Xem workflow runs
- Download artifacts nếu cần

---

## 📊 ARTIFACTS

### **CI Pipeline tạo:**
- `test-results` - Test reports (XML)
- `application-jar` - Built JAR files

### **Nightly Build tạo:**
- `nightly-build-artifacts` - All JARs và test reports

---

## 🐛 TROUBLESHOOTING

### **1. Tests fail trong CI**

**Kiểm tra:**
- SQL Server service có start không
- Redis service có start không
- Testcontainers có hoạt động không

**Fix:**
- Xem logs trong Actions tab
- Test locally với cùng environment

### **2. Build fails**

**Common issues:**
- Maven dependencies không download được
- JDK version không đúng
- Memory issues

**Fix:**
- Clear Maven cache
- Check Java version
- Increase runner memory

### **3. Docker build fails**

**Kiểm tra:**
- Dockerfile có đúng không
- Docker Hub credentials (nếu push)
- Build context

---

## 📝 CUSTOMIZATION

### **Thêm SonarQube:**
```yaml
- name: Run SonarQube
  uses: sonarsource/sonarqube-scan-action@master
  env:
    SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
```

### **Thêm Slack notifications:**
```yaml
- name: Notify Slack
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    text: 'Build completed'
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

### **Thêm deployment steps:**
```yaml
- name: Deploy to server
  uses: appleboy/ssh-action@master
  with:
    host: ${{ secrets.HOST }}
    username: ${{ secrets.USERNAME }}
    key: ${{ secrets.SSH_KEY }}
    script: |
      cd /app
      docker-compose pull
      docker-compose up -d
```

---

## ✅ CHECKLIST

- [ ] GitHub Actions enabled trong repository
- [ ] Workflows files đã commit
- [ ] Test locally với `mvn test`
- [ ] Push code và kiểm tra Actions tab
- [ ] Verify test results
- [ ] Check artifacts upload

---

## 🎯 NEXT STEPS

1. **Configure Docker Hub** (nếu muốn push images)
2. **Add deployment steps** (SSH, Kubernetes, etc.)
3. **Add notifications** (Slack, Email, etc.)
4. **Configure SonarQube** (code quality analysis)

---

**Hoàn thành! CI/CD Pipeline đã sẵn sàng. 🎉**

