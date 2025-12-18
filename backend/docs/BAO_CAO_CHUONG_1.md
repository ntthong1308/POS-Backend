## CHƯƠNG 1. CƠ SỞ LÝ LUẬN VÀ KHẢO SÁT HỆ THỐNG QUẢN LÝ BÁN HÀNG (POS)

### 1.1. Tổng quan về Hệ thống Quản lý Bán hàng (POS)

#### 1.1.1. Khái niệm và lịch sử phát triển của POS

Hệ thống quản lý bán hàng (Point of Sale – POS) là tập hợp các thiết bị và phần mềm hỗ trợ thực hiện giao dịch bán hàng tại điểm tiếp xúc với khách hàng. Một hệ thống POS điển hình cho phép thu ngân tìm kiếm sản phẩm, thêm vào giỏ hàng, áp dụng khuyến mãi, tính tổng tiền, nhận thanh toán và in hóa đơn, đồng thời tự động cập nhật tồn kho và doanh thu.

Về mặt lịch sử, POS bắt nguồn từ các **máy tính tiền cơ học** được sử dụng trong các cửa hàng tạp hóa, siêu thị từ thế kỷ XX. Qua thời gian, cùng với sự phát triển của công nghệ thông tin, POS đã trải qua các giai đoạn:

- **POS điện tử (Electronic Cash Register – ECR)**: thay thế máy cơ học, cho phép lưu trữ và in hóa đơn đơn giản.
- **POS client–server**: kết nối nhiều máy trạm tại quầy với một máy chủ nội bộ, dữ liệu được lưu vào cơ sở dữ liệu quan hệ.
- **POS tích hợp với hệ thống back-office**: kết nối với các hệ thống kế toán, quản lý kho, CRM, giúp dữ liệu bán hàng được khai thác tốt hơn.
- **POS hiện đại dựa trên web/cloud**: giao diện web hoặc ứng dụng di động, đồng bộ dữ liệu theo thời gian thực giữa nhiều chi nhánh, hỗ trợ nhiều phương thức thanh toán và tích hợp với thương mại điện tử.

Ngày nay, POS không chỉ đơn thuần là “máy tính tiền” mà đã trở thành một phần quan trọng trong kiến trúc hệ thống thông tin của doanh nghiệp bán lẻ.

#### 1.1.2. Vai trò của POS trong ngành bán lẻ hiện đại

Trong môi trường cạnh tranh khốc liệt của ngành bán lẻ, tốc độ và độ chính xác trong khâu bán hàng đóng vai trò quyết định đến trải nghiệm khách hàng. POS giúp doanh nghiệp:

- **Tăng tốc độ xử lý giao dịch**: quy trình bán hàng được chuẩn hóa, giảm thời gian chờ của khách, đặc biệt trong giờ cao điểm.
- **Giảm sai sót trong tính tiền**: hệ thống tự động tính toán giá, khuyến mãi, chiết khấu, thuế; hạn chế lỗi do nhập liệu thủ công.
- **Quản lý tồn kho hiệu quả**: mỗi giao dịch bán hoặc trả hàng được ghi nhận ngay lập tức, giúp số liệu tồn kho được cập nhật theo thời gian thực.
- **Cung cấp dữ liệu cho báo cáo và ra quyết định**: từ dữ liệu hóa đơn, hệ thống có thể tổng hợp doanh thu theo ngày/tháng/quý, thống kê sản phẩm bán chạy, xác định khung giờ cao điểm, v.v.
- **Nâng cao trải nghiệm khách hàng**: hỗ trợ nhiều phương thức thanh toán, lưu trữ lịch sử mua hàng, áp dụng chương trình khách hàng thân thiết.

Nhờ những vai trò trên, POS trở thành “trung tâm dữ liệu” tại điểm bán, là cơ sở để doanh nghiệp tối ưu vận hành và xây dựng chiến lược kinh doanh.

#### 1.1.3. Lợi ích và hạn chế của việc ứng dụng POS

**Lợi ích chính:**

- **Tự động hóa quy trình bán hàng**: giảm bớt thao tác thủ công, giúp nhân viên tập trung vào phục vụ khách hàng.
- **Minh bạch và dễ kiểm soát**: mọi giao dịch đều được lưu trữ trong hệ thống, thuận tiện cho việc đối soát doanh thu và kiểm kê.
- **Đồng bộ dữ liệu giữa các bộ phận**: dữ liệu bán hàng có thể được chia sẻ cho bộ phận kế toán, kho, marketing một cách nhất quán.
- **Hỗ trợ mở rộng hệ thống**: khi doanh nghiệp mở thêm chi nhánh, có thể mở rộng số lượng điểm bán mà không cần thay đổi toàn bộ hệ thống.

**Hạn chế và thách thức:**

- **Chi phí đầu tư ban đầu**: bao gồm thiết bị phần cứng, bản quyền phần mềm, triển khai và đào tạo nhân sự.
- **Phụ thuộc vào hạ tầng kỹ thuật**: hệ thống có thể bị gián đoạn khi mất điện, mất kết nối mạng hoặc gặp sự cố phần mềm.
- **Rủi ro bảo mật**: nếu thiết kế không tốt, dữ liệu khách hàng và giao dịch có thể bị truy cập trái phép hoặc thất thoát.
- **Yêu cầu bảo trì, cập nhật liên tục**: hệ thống cần được bảo trì định kỳ, cập nhật tính năng mới và vá lỗi bảo mật.

Trong đề tài thực tập, sinh viên tập trung nghiên cứu và triển khai một hệ thống POS quy mô nhỏ nhưng áp dụng các nguyên tắc và công nghệ hiện đại để khắc phục phần nào những hạn chế nêu trên.

---

### 1.2. Các thành phần cơ bản của hệ thống POS

Một hệ thống POS hoàn chỉnh thường bao gồm bốn nhóm thành phần chính: phần cứng, phần mềm, cơ sở dữ liệu và hạ tầng mạng.

#### 1.2.1. Thành phần phần cứng

Các thiết bị phần cứng phổ biến trong hệ thống POS gồm:

- **Thiết bị đầu cuối POS**: máy tính để bàn, laptop hoặc thiết bị POS chuyên dụng đặt tại quầy thu ngân.
- **Màn hình hiển thị**: có thể là màn hình cảm ứng để thao tác nhanh khi chọn sản phẩm và thanh toán.
- **Máy quét mã vạch (barcode scanner)**: giúp nhập nhanh mã sản phẩm, hạn chế nhầm lẫn khi tìm kiếm.
- **Máy in hóa đơn**: in hóa đơn bán hàng cho khách hàng, có thể tích hợp với khổ giấy chuyên dụng.
- **Két đựng tiền**: kết nối với thiết bị POS, tự động mở khi thanh toán hoàn tất.
- **Thiết bị mạng**: modem, router, switch, điểm phát Wi-Fi đảm bảo các máy trạm kết nối được với máy chủ và Internet.

Trong phạm vi đề tài, hệ thống được triển khai trên môi trường máy tính cá nhân, mô phỏng vai trò của thiết bị POS tại quầy.

#### 1.2.2. Thành phần phần mềm

Thành phần phần mềm của hệ thống POS trong đề tài bao gồm hai nhóm chính:

- **Ứng dụng POS tại quầy (`retail-pos-app`)**:
  - Được xây dựng bằng **React** và **TypeScript**, sử dụng **Vite** làm công cụ build.
  - Cung cấp giao diện cho thu ngân: tìm kiếm sản phẩm, thêm vào giỏ hàng, áp dụng giảm giá, thanh toán, in hoặc xuất hóa đơn.
  - Tích hợp các thư viện UI hiện đại (Radix UI, Tailwind CSS, Lucide Icons) để tối ưu trải nghiệm người dùng.

- **Ứng dụng Web Admin & API Backend (`retail-platform`)**:
  - Được xây dựng trên nền **Spring Boot 3**, **Java 21**, tổ chức theo kiến trúc **multi-module**: `retail-api`, `retail-pos-api`, `retail-admin-api`, `retail-application`, `retail-persistence`, `retail-security`, v.v.
  - Cung cấp các API REST cho:
    - Quản lý sản phẩm, khách hàng, nhân viên, khuyến mãi, kho hàng.
    - Tạo và quản lý hóa đơn, chi tiết hóa đơn.
    - Báo cáo doanh thu, thống kê sản phẩm bán chạy, xuất Excel/PDF.
  - Xử lý nghiệp vụ tại lớp Service, truy cập dữ liệu qua lớp Repository (JPA/Hibernate).

Ngoài ra, hệ thống còn sử dụng các thư viện hỗ trợ như MapStruct (mapping DTO–Entity), Lombok (giảm boilerplate code), Apache POI (xuất Excel), iText (xuất PDF), v.v.

#### 1.2.3. Cơ sở dữ liệu và hạ tầng mạng

Hệ thống sử dụng **Microsoft SQL Server** làm hệ quản trị cơ sở dữ liệu chính. Dữ liệu được tổ chức dưới dạng các bảng quan hệ, liên kết với nhau bằng khóa chính/khóa ngoại để đảm bảo toàn vẹn tham chiếu. Các nhóm dữ liệu chính gồm:

- Danh mục sản phẩm, đơn vị tính, loại sản phẩm.
- Thông tin khách hàng, nhân viên, chi nhánh.
- Hóa đơn bán hàng, chi tiết hóa đơn, lịch sử thanh toán.
- Bảng tồn kho, phiếu nhập hàng, điều chỉnh tồn kho.

Việc quản lý phiên bản cấu trúc cơ sở dữ liệu được thực hiện bằng công cụ **Flyway** (module `retail-migrations`), giúp đồng bộ schema giữa các môi trường.

Về hạ tầng mạng, đề tài giả lập mô hình:

- Backend Spring Boot chạy trên máy chủ (hoặc máy cá nhân), lắng nghe tại cổng HTTP cấu hình sẵn.
- Ứng dụng POS và Web Admin (React) truy cập vào backend thông qua các endpoint REST (CORS được cấu hình để cho phép truy cập từ trình duyệt).
- Trong môi trường thực tế, mô hình này có thể triển khai trên máy chủ nội bộ hoặc nền tảng cloud, cho phép nhiều máy POS kết nối đồng thời.

---

### 1.3. Giới thiệu đơn vị thực tập và bài toán đặt ra

#### 1.3.1. Giới thiệu đơn vị thực tập / mô hình cửa hàng mô phỏng

Sinh viên thực hiện đề tài tại môi trường mô phỏng một **cửa hàng bán lẻ** với các hoạt động nghiệp vụ cơ bản: nhập hàng, trưng bày sản phẩm, bán hàng tại quầy, chăm sóc khách hàng và tổng hợp báo cáo doanh thu. Quy mô được giả định gồm:

- 1–2 quầy thu ngân.
- Số lượng sản phẩm khoảng vài trăm mặt hàng, được phân loại theo danh mục.
- Một hoặc hai nhân sự quản lý chịu trách nhiệm theo dõi doanh thu và tồn kho.

Mặc dù là mô hình mô phỏng, các quy trình nghiệp vụ được xây dựng bám sát thực tế của các cửa hàng bán lẻ nhỏ và vừa, đảm bảo tính thực tiễn của hệ thống.

#### 1.3.2. Hiện trạng quản lý bán hàng

Trước khi áp dụng hệ thống POS, hoạt động bán hàng thường được thực hiện theo các cách sau:

- Ghi chép đơn hàng và doanh thu hàng ngày bằng **sổ tay hoặc file Excel**.
- Tồn kho được cập nhật thủ công sau mỗi lần nhập hoặc bán hàng, dễ xảy ra chênh lệch giữa sổ sách và thực tế.
- Việc tra cứu lịch sử mua hàng của khách (nếu có) mất nhiều thời gian, gần như không thể thực hiện nhanh tại quầy.
- Báo cáo doanh thu theo ngày/tháng phải tổng hợp thủ công, dễ nhầm lẫn, khó so sánh giữa các giai đoạn.

Những hạn chế trên dẫn đến:

- Khó kiểm soát chính xác doanh thu và tồn kho.
- Mất nhiều thời gian cho các công việc hành chính, giảm thời gian phục vụ khách hàng.
- Thiếu dữ liệu kịp thời cho việc ra quyết định nhập hàng, khuyến mãi.

#### 1.3.3. Vấn đề tồn tại và nhu cầu nâng cấp hệ thống

Từ hiện trạng nêu trên, có thể chỉ ra một số vấn đề chính:

- **Dữ liệu phân tán và thiếu nhất quán**: thông tin bán hàng nằm rải rác ở nhiều file, không có một hệ thống tập trung.
- **Thiếu công cụ hỗ trợ báo cáo**: việc thống kê doanh thu, sản phẩm bán chạy, khách hàng tiềm năng gặp nhiều khó khăn.
- **Rủi ro sai sót cao**: do nhập liệu thủ công, nhân viên dễ nhầm lẫn về số lượng, giá bán, khuyến mãi.

Do đó, đơn vị (hoặc mô hình cửa hàng) cần một **hệ thống quản lý bán hàng mới** đáp ứng các yêu cầu:

- Tự động hóa quy trình bán hàng tại quầy.
- Quản lý tập trung dữ liệu sản phẩm, khách hàng, hóa đơn và tồn kho.
- Hỗ trợ báo cáo nhanh, trực quan, có thể truy cập qua giao diện web.

---

### 1.4. Yêu cầu của hệ thống quản lý bán hàng mới

#### 1.4.1. Mục tiêu nghiệp vụ và phạm vi áp dụng

Mục tiêu chính của hệ thống là:

- **Chuẩn hóa và tự động hóa quy trình bán hàng** tại quầy, giảm tối đa thao tác thủ công.
- **Quản lý tập trung dữ liệu** sản phẩm, khách hàng, nhân viên và hóa đơn.
- **Cung cấp báo cáo doanh thu và thống kê bán hàng** theo nhiều tiêu chí (theo ngày, theo sản phẩm, theo danh mục,…).

Phạm vi của đề tài tập trung vào:

- Bán hàng tại cửa hàng (Retail POS), không bao gồm kênh thương mại điện tử.
- Quản lý ở mức một cửa hàng/chi nhánh, có khả năng mở rộng hỗ trợ nhiều chi nhánh trong tương lai.

#### 1.4.2. Yêu cầu chức năng chính (tổng quan)

Các nhóm chức năng chính của hệ thống bao gồm:

- **Quản lý danh mục sản phẩm**: tạo/sửa/xóa sản phẩm, quản lý đơn vị tính, giá bán, trạng thái kinh doanh.
- **Quản lý khách hàng**: lưu trữ thông tin cơ bản, lịch sử mua hàng, hỗ trợ tích điểm (nếu có).
- **Quản lý nhân viên và phân quyền**: quản lý tài khoản đăng nhập, gán quyền theo vai trò (thu ngân, quản lý, admin).
- **Bán hàng tại quầy (POS)**: tìm kiếm sản phẩm, thêm vào giỏ, áp dụng giảm giá, xử lý thanh toán, in hoặc xuất hóa đơn.
- **Trả/đổi hàng**: ghi nhận hóa đơn trả hàng, cập nhật tồn kho và doanh thu tương ứng.
- **Quản lý tồn kho**: nhập hàng, điều chỉnh tồn kho, theo dõi lượng tồn theo sản phẩm.
- **Báo cáo – thống kê**: báo cáo doanh thu theo ngày/tháng, danh sách sản phẩm bán chạy, báo cáo chi tiết hóa đơn, xuất Excel/PDF.

Chi tiết từng chức năng sẽ được phân tích trong Chương 2 thông qua sơ đồ Use-case và mô tả luồng nghiệp vụ.

#### 1.4.3. Danh sách tác nhân sử dụng hệ thống

Hệ thống được thiết kế để phục vụ ba nhóm người dùng chính:

- **Thu ngân/nhân viên bán hàng**:
  - Sử dụng ứng dụng POS tại quầy.
  - Thực hiện các thao tác bán hàng, in hóa đơn, xử lý trả hàng.

- **Quản lý cửa hàng/chi nhánh**:
  - Truy cập Web Admin để theo dõi doanh thu, quản lý tồn kho, phê duyệt điều chỉnh giá hoặc khuyến mãi.
  - Xem các báo cáo thống kê và xuất file khi cần.

- **Quản trị hệ thống (Admin)**:
  - Quản lý người dùng, phân quyền truy cập.
  - Cấu hình các tham số hệ thống (ví dụ: cấu hình JWT, tham số báo cáo, backup dữ liệu).

---

### 1.5. Yêu cầu phi chức năng và ràng buộc

#### 1.5.1. Hiệu năng, khả năng mở rộng và trải nghiệm người dùng

- Hệ thống phải phản hồi nhanh cho các thao tác bán hàng tại quầy (thời gian phản hồi trung bình cho thao tác thêm sản phẩm vào giỏ hoặc thanh toán không quá 2–3 giây trong điều kiện mạng bình thường).
- Giao diện POS được thiết kế đơn giản, trực quan, hỗ trợ thao tác bằng chuột và phím tắt; các bước bán hàng được tối ưu để thu ngân có thể thao tác liên tục.
- Kiến trúc backend theo hướng **multi-module** giúp dễ dàng mở rộng thêm chức năng mới (ví dụ: tích hợp ví điện tử, chương trình khách hàng thân thiết) mà không ảnh hưởng nhiều đến các module hiện có.

#### 1.5.2. An toàn – bảo mật – riêng tư dữ liệu

- Hệ thống sử dụng cơ chế **xác thực bằng JWT** (JSON Web Token) kết hợp với **mã hóa mật khẩu bằng BCrypt**.
- Các API quan trọng yêu cầu token hợp lệ và kiểm tra quyền truy cập theo vai trò (RBAC).
- Dữ liệu nhạy cảm của khách hàng (thông tin liên hệ, lịch sử giao dịch) được truy cập có kiểm soát, không hiển thị công khai trong log.
- Hệ thống có cơ chế giới hạn quyền truy cập (ví dụ: thu ngân không được sửa/xóa hóa đơn đã khóa, không truy cập được chức năng cấu hình hệ thống).

#### 1.5.3. Tính sẵn sàng, sao lưu/khôi phục, logging/audit

- Hệ thống cần hoạt động ổn định trong giờ làm việc của cửa hàng; khi xảy ra lỗi phải hiển thị thông báo rõ ràng cho người dùng và ghi log chi tiết ở backend.
- Log hệ thống được ghi theo định dạng **JSON** (sử dụng Logback + Logstash encoder), dễ dàng tích hợp với các công cụ phân tích log.
- Cơ sở dữ liệu cần được sao lưu định kỳ (backup theo ngày), có kế hoạch khôi phục khi xảy ra sự cố.
- Các thao tác quan trọng như tạo/sửa/xóa hóa đơn, điều chỉnh tồn kho nên được lưu vết (ai thực hiện, thời gian, nội dung thay đổi) để phục vụ việc audit.

#### 1.5.4. Ràng buộc kỹ thuật/pháp lý

- Hóa đơn bán hàng phải thể hiện đầy đủ các thông tin cơ bản: tên cửa hàng, mã hóa đơn, ngày giờ giao dịch, danh sách sản phẩm, số lượng, đơn giá, thành tiền, tổng tiền, phương thức thanh toán.
- Việc lưu trữ và xử lý dữ liệu khách hàng cần tuân thủ các nguyên tắc bảo vệ thông tin cá nhân (không chia sẻ trái phép, không sử dụng sai mục đích).
- Hệ thống phải tuân thủ các ràng buộc từ nền tảng sử dụng: giới hạn kết nối đến SQL Server, cấu hình bảo mật của Spring Boot, các quy định về phân quyền trong môi trường triển khai nội bộ.

---

### 1.6. Công cụ và công nghệ sử dụng trong đề tài

#### 1.6.1. Công cụ phát triển

- **IntelliJ IDEA**: môi trường phát triển chính cho backend `retail-platform`, hỗ trợ debug, quản lý multi-module Maven và tích hợp với Git.
- **Visual Studio Code**: sử dụng để phát triển frontend `retail-pos-app` (React, TypeScript), kết hợp với các extension hỗ trợ ESLint, Tailwind CSS.
- **SQL Server Management Studio (SSMS)**: quản lý cơ sở dữ liệu SQL Server, thiết kế bảng, thực thi truy vấn và kiểm tra dữ liệu.
- **Postman** và **Swagger UI**: kiểm thử API REST, gửi request với nhiều tham số và token JWT khác nhau, quan sát response để debug.
- **Git & GitHub/GitLab**: lưu trữ mã nguồn, quản lý phiên bản, hỗ trợ làm việc nhóm.

#### 1.6.2. Nền tảng công nghệ

- **Backend**:
  - **Java 21**, **Spring Boot 3.2.0**.
  - Kiến trúc **multi-module Maven**: `retail-common`, `retail-domain`, `retail-persistence`, `retail-security`, `retail-application`, `retail-api`, `retail-pos-api`, `retail-admin-api`, `retail-migrations`, `retail-bootstrap`.
  - Sử dụng **Hibernate/JPA** để truy cập cơ sở dữ liệu, **Flyway** cho migration, **Redis** cho cache (nếu được bật).

- **Frontend**:
  - **React** với **TypeScript**, toolchain **Vite**.
  - Thư viện UI: Radix UI, Tailwind CSS, Zustand (quản lý state), React Query (quản lý dữ liệu bất đồng bộ).

- **Cơ sở dữ liệu & hạ tầng**:
  - **SQL Server** làm DBMS chính.
  - Hệ thống có thể triển khai trên máy cá nhân cho mục đích demo, hoặc trên máy chủ nội bộ/VM khi mở rộng.

#### 1.6.3. Vai trò của công cụ trong quá trình thực tập

Trong quá trình thực tập, sinh viên sử dụng kết hợp các công cụ trên để:

- Phân tích, thiết kế và hiện thực hóa các yêu cầu nghiệp vụ trên hệ thống POS.
- Triển khai backend và frontend, kiểm thử API và giao diện người dùng.
- Ghi nhận log, theo dõi lỗi và tối ưu hiệu năng ở những chức năng quan trọng (bán hàng, báo cáo).
- Tài liệu hóa hệ thống thông qua Swagger/OpenAPI và các tài liệu Markdown đi kèm project.

#### 1.6.4. Môi trường triển khai hệ thống (tổng quan)

Trong phạm vi đề tài, hệ thống được triển khai trên môi trường giả lập như sau:

- **Máy chủ backend**:
  - Hệ điều hành: Windows 10/11 (máy cá nhân của sinh viên).
  - JVM: Java 21, chạy ứng dụng Spring Boot (`retail-platform`) ở cổng 8081.
  - Cấu hình cơ sở dữ liệu, Redis (nếu dùng), Flyway được khai báo trong file `application.properties`.

- **Máy trạm/frontend**:
  - Trình duyệt Chrome/Edge để chạy ứng dụng React (`retail-pos-app`) ở địa chỉ `http://localhost:5173`.
  - Frontend giao tiếp với backend thông qua HTTP/JSON, các endpoint `/api/v1/...` và `/api/...`.

- **Cơ sở dữ liệu**:
  - SQL Server 2019+ cài đặt trên cùng máy hoặc trên container Docker, database `retail_db`.
  - Migration dữ liệu được thực hiện tự động khi khởi động ứng dụng thông qua Flyway (module `retail-migrations`).

Mô hình triển khai có thể mở rộng lên môi trường thật (server nội bộ hoặc cloud) bằng cách đóng gói ứng dụng backend thành Docker image, triển khai cùng SQL Server trên máy chủ và trỏ frontend đến địa chỉ IP/public domain tương ứng.

Những nội dung lý thuyết và khảo sát trong Chương 1 là cơ sở để bước sang Chương 2 – Phân tích và thiết kế hệ thống, nơi các yêu cầu trên sẽ được cụ thể hóa bằng sơ đồ quy trình, sơ đồ Use-case, ERD và kiến trúc chi tiết.


