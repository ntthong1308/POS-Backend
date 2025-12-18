## CHƯƠNG 4. KẾ HOẠCH KIỂM THỬ VÀ BÁO CÁO KẾT QUẢ

Chương này trình bày kế hoạch kiểm thử cho hệ thống quản lý bán hàng POS, bao gồm phạm vi kiểm thử, các loại và kỹ thuật kiểm thử được áp dụng, một số test case tiêu biểu cũng như đánh giá tổng quan kết quả kiểm thử. Nội dung được xây dựng bám sát các luồng nghiệp vụ chính đã được triển khai ở backend `retail-platform` và frontend `retail-pos-app`.

---

### 4.1. Tổng quan kiểm thử

#### 4.1.1. Mục tiêu kiểm thử

- Xác minh hệ thống POS hoạt động đúng theo các yêu cầu nghiệp vụ đã phân tích ở Chương 1 và Chương 2.  
- Phát hiện sớm các lỗi chức năng, lỗi luồng nghiệp vụ, lỗi dữ liệu và lỗi giao diện trước khi bàn giao.  
- Đảm bảo các chức năng quan trọng (bán hàng, nhập hàng, báo cáo) ổn định, dữ liệu hóa đơn và tồn kho được cập nhật chính xác.  
- Kiểm tra cơ bản các khía cạnh bảo mật và phân quyền dựa trên vai trò (RBAC).

#### 4.1.2. Phạm vi kiểm thử

**Trong phạm vi:**

- Ứng dụng POS tại quầy (`/pos`): chọn bàn, bán hàng, treo bill, thanh toán, xem hóa đơn.  
- Ứng dụng Web Admin (`/dashboard` và các trang con): quản lý sản phẩm, khách hàng, nhân viên, kho, báo cáo.  
- Các API backend liên quan:
  - Module Auth (`/api/v1/auth/**`).  
  - Module POS (`/api/v1/pos/**`).  
  - Module Admin (`/api/v1/admin/**`).  
  - Module báo cáo & xuất Excel (`/api/v1/admin/reports/**`, `/api/reports/**`).  

**Ngoài phạm vi (chỉ kiểm thử thủ công cơ bản hoặc mô phỏng):**

- Tích hợp gateway thanh toán thực tế (VNPay, ví điện tử ở môi trường production).  
- Kiểm thử hiệu năng, chịu tải ở quy mô lớn (stress test 1000+ người dùng đồng thời).  
- Kiểm thử bảo mật nâng cao (penetration testing chuyên sâu).

---

### 4.2. Đối tượng và loại kiểm thử

#### 4.2.1. Loại kiểm thử áp dụng

- **Kiểm thử chức năng (Functional Testing)**:
  - Đăng nhập, phân quyền.  
  - Bán hàng POS (thêm giỏ, checkout, treo bill, hủy hóa đơn).  
  - Quản lý sản phẩm, khách hàng, nhân viên, nhập hàng.  
  - Báo cáo doanh thu, thống kê sản phẩm bán chạy, xuất Excel/PDF.

- **Kiểm thử luồng nghiệp vụ (Business Flow Testing)**:
  - Luồng bán hàng hoàn chỉnh: chọn bàn → thêm sản phẩm → thanh toán → in/xem hóa đơn.  
  - Luồng nhập hàng: tạo phiếu nhập → cập nhật tồn kho → hiển thị trong báo cáo.  
  - Luồng báo cáo: chọn khoảng thời gian → xem dashboard → xuất báo cáo Excel.

- **Kiểm thử toàn vẹn dữ liệu (Data Integrity Testing)**:
  - Kiểm tra dữ liệu hóa đơn, chi tiết hóa đơn, tồn kho sau các thao tác nhập/bán/trả hàng.  
  - Đảm bảo các ràng buộc khóa chính/khóa ngoại, trạng thái hóa đơn (COMPLETED, PENDING, CANCELLED) được cập nhật đúng.

- **Kiểm thử giao diện (UI/UX Testing)**:
  - Tính nhất quán giao diện POS và Web Admin.  
  - Khả năng sử dụng (số bước thao tác, thông báo, lỗi hiển thị).

- **Kiểm thử bảo mật và truy cập (Security & Access Control Testing)**:
  - Thử truy cập API với/không có JWT, với các vai trò khác nhau.  
  - Kiểm tra các endpoint public (`/api/reports/**`, `/uploads/**`, `/auth/**`) không lộ dữ liệu nhạy cảm.

- **Kiểm thử API và luồng dữ liệu (API & Integration Testing)**:
  - Kiểm tra request/response cho các API POS, Admin, Reports bằng Postman/Swagger.  
  - Đảm bảo mã trạng thái HTTP, thông điệp lỗi, cấu trúc `ApiResponse` nhất quán.

#### 4.2.2. Các đối tượng kiểm thử chính

- **Module Auth**: đăng nhập, lấy thông tin người dùng hiện tại (`/auth/me`), đăng xuất.  
- **Module POS**:  
  - API sản phẩm cho POS (`/api/v1/pos/products/**`).  
  - API hóa đơn, checkout (`/api/v1/pos/checkout`, `/api/v1/pos/invoices`).  
  - API treo bill (`/api/v1/pos/hold-bill`).  
- **Module Admin**:
  - Quản lý sản phẩm (`/api/v1/admin/products/**`).  
  - Quản lý khách hàng, nhân viên (`/api/v1/admin/customers/**`, `/api/v1/admin/employees/**`).  
  - Nhập hàng, kho (`/api/v1/admin/imports/**`, `inventory/**`).  
- **Module Report**:
  - API báo cáo JSON (`/api/v1/admin/reports/revenue`).  
  - API xuất Excel (`/api/reports/revenue/excel`).

---

### 4.3. Kỹ thuật kiểm thử sử dụng

- **Phân vùng tương đương (Equivalence Partitioning)**:
  - Áp dụng cho các form nhập liệu (tạo sản phẩm, nhập hàng, tạo hóa đơn) với các lớp dữ liệu: hợp lệ, thiếu trường, âm, vượt giới hạn.

- **Phân tích giá trị biên (Boundary Value Analysis)**:
  - Số lượng sản phẩm, tồn kho (`0`, `1`, `tonKho`, `tonKho+1`).  
  - Khoảng thời gian báo cáo (ngày bắt đầu = ngày kết thúc, ngày bắt đầu sau ngày kết thúc, khoảng quá dài).

- **Kiểm thử dựa trên Use-case (Use-case Based Testing)**:
  - Thiết kế test case theo các luồng đã mô tả ở Chương 2: bán hàng POS, trả hàng, nhập hàng, báo cáo.

- **Kiểm thử chuyển trạng thái (State Transition Testing)**:
  - Trạng thái hóa đơn: `PENDING → COMPLETED → CANCELLED`, `PENDING → CANCELLED`; không cho phép `COMPLETED → PENDING`.

- **Kiểm thử hộp đen (Black-box Testing)**:
  - Tập trung vào input/output của API và giao diện, không phụ thuộc chi tiết cài đặt.

---

### 4.4. Một số test case tiêu biểu

#### 4.4.1. Test case: Bán hàng POS – Thanh toán thành công

**Mục tiêu**: đảm bảo luồng bán hàng hoàn chỉnh hoạt động đúng, tồn kho và hóa đơn được cập nhật chính xác.

| ID       | TC_POS_01                                                                 |
|----------|---------------------------------------------------------------------------|
| Tiền điều kiện | Đã có user role `CASHIER`; hệ thống có ít nhất 1 sản phẩm `SP001` tồn kho `>= 5`. |
| Bước thực hiện | 1. Đăng nhập với tài khoản thu ngân.  2. Vào `/pos`, chọn một bàn.  3. Thêm sản phẩm `SP001` số lượng 3 vào giỏ.  4. Nhấn Thanh toán, chọn phương thức tiền mặt.  5. Xác nhận thanh toán. |
| Kết quả mong đợi | - Hóa đơn mới được tạo với trạng thái `COMPLETED`.  - Bảng `ChiTietHoaDon` có dòng tương ứng `SP001`, `soLuong = 3`.  - Tồn kho `SP001` giảm đúng 3 đơn vị.  - POS hiển thị thông báo “Thanh toán thành công” và có thể in/xem hóa đơn. |

#### 4.4.2. Test case: Bán hàng POS – Không đủ tồn kho

| ID       | TC_POS_02                                                                 |
|----------|---------------------------------------------------------------------------|
| Tiền điều kiện | Sản phẩm `SP002` có `tonKho = 2`. |
| Bước thực hiện | 1. Thu ngân đăng nhập, vào `/pos`.  2. Thêm `SP002` số lượng 5 vào giỏ.  3. Nhấn Thanh toán. |
| Kết quả mong đợi | - Hệ thống hiển thị thông báo lỗi “Không đủ tồn kho”.  - Không tạo bản ghi `HoaDon` mới.  - Tồn kho `SP002` trong DB không thay đổi. |

#### 4.4.3. Test case: Treo bill (Hold bill)

| ID       | TC_POS_03                                                                 |
|----------|---------------------------------------------------------------------------|
| Tiền điều kiện | Thu ngân đã đăng nhập, có ít nhất một khách hàng và sản phẩm. |
| Bước thực hiện | 1. Thêm vài sản phẩm vào giỏ.  2. Chọn chức năng “Treo bill” (giữ hóa đơn). |
| Kết quả mong đợi | - Một hóa đơn mới được tạo với trạng thái `PENDING`.  - Không trừ tồn kho sản phẩm.  - Hóa đơn thể hiện đầy đủ thông tin dòng hàng, nhưng chưa có phương thức thanh toán. |

#### 4.4.4. Test case: Xuất báo cáo doanh thu Excel

| ID       | TC_RPT_01                                                                 |
|----------|---------------------------------------------------------------------------|
| Tiền điều kiện | Có dữ liệu hóa đơn trong khoảng từ 2025-12-10 đến 2025-12-14. |
| Bước thực hiện | 1. Trên Web Admin, chọn khoảng ngày 10/12/2025–14/12/2025.  2. Nhấn nút “Xuất báo cáo doanh thu”. |
| Kết quả mong đợi | - Trình duyệt tải xuống file Excel `BaoCaoDoanhThu_10122025_den_14122025.xlsx`.  - Mở file kiểm tra: sheet “Tổng quan” hiển thị tổng doanh thu đúng với dữ liệu DB; sheet “Thống kê theo ngày” có đủ các ngày đã có hóa đơn, mỗi ngày một dòng. |

#### 4.4.5. Test case: Phân quyền truy cập API

| ID       | TC_SEC_01                                                                 |
|----------|---------------------------------------------------------------------------|
| Tiền điều kiện | Có 2 tài khoản: `cashier` (role CASHIER), `admin` (role ADMIN). |
| Bước thực hiện | 1. Dùng token của `cashier` gọi `GET /api/v1/admin/products`.  2. Dùng token của `admin` gọi cùng endpoint. |
| Kết quả mong đợi | - Request với token `cashier` bị từ chối (403 Forbidden).  - Request với token `admin` thành công, trả về danh sách sản phẩm. |

---

### 4.5. Kế hoạch kiểm thử: môi trường, công cụ, nguồn lực

#### 4.5.1. Môi trường thử nghiệm

- **Backend**: Spring Boot chạy local trên `http://localhost:8081`, cấu hình trỏ tới database test `retail_db_test`.  
- **Frontend**: React/Vite chạy trên `http://localhost:5173`, cấu hình `VITE_API_BASE_URL` trỏ về backend.  
- **CSDL**: SQL Server trên máy cá nhân hoặc container, có script Flyway tạo dữ liệu mẫu (sản phẩm, khách hàng, đơn hàng demo).

#### 4.5.2. Công cụ kiểm thử

- **Postman / Swagger UI**: kiểm thử API thủ công, xác minh request/response.  
- **Browser DevTools (Chrome/Edge)**: debug giao diện, kiểm tra network, console.  
- **SQL Server Management Studio (SSMS)**: kiểm tra trực tiếp dữ liệu sau khi chạy test.  
- **Git, IntelliJ IDEA, VS Code**: hỗ trợ chạy và debug backend/frontend trong quá trình test.

#### 4.5.3. Nguồn lực

- **Sinh viên thực hiện**: đóng vai trò vừa là developer, vừa là tester cho hệ thống POS.  
- **Giảng viên hướng dẫn**: góp ý về phạm vi test, chiến lược test và cách trình bày kết quả trong báo cáo.

---

### 4.6. Đánh giá tổng quan kết quả kiểm thử

Trong phạm vi thử nghiệm thủ công và bán tự động mà đề tài thực hiện:

- Các luồng nghiệp vụ chính (đăng nhập, bán hàng POS, nhập hàng, xem báo cáo, xuất Excel) đều vận hành đúng với dữ liệu test đã chuẩn bị.  
- Dữ liệu hóa đơn, chi tiết hóa đơn và tồn kho sau các nghiệp vụ bán/nhập hàng được cập nhật thống nhất giữa POS, Web Admin và database.  
- Các lỗi phát hiện chủ yếu thuộc nhóm giao diện (validation chưa rõ ràng, thông báo lỗi chưa thân thiện) và đã được điều chỉnh trong quá trình hoàn thiện hệ thống.  
- Cơ chế phân quyền cơ bản theo vai trò CASHIER/MANAGER/ADMIN hoạt động đúng, không cho phép người dùng trái quyền truy cập các API quản trị.

Trong tương lai, hệ thống có thể được nâng cấp bằng cách bổ sung thêm các bộ test tự động (unit test cho Service, integration test cho API quan trọng, một số E2E test cho luồng bán hàng) để tăng độ tin cậy và giảm công sức kiểm thử thủ công khi phát triển chức năng mới.


