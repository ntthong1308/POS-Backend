// Auth types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  type: string;
  id: number;
  username: string;
  tenNhanVien: string;
  email: string;
  role: string;
  chiNhanhId: number;
  tenChiNhanh?: string;
}

export interface User {
  id: number;
  username: string;
  tenNhanVien: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'CASHIER';
  chiNhanhId: number;
}

// Product types (theo ProductDTO trong tài liệu)
export interface Product {
  id: number;
  maSanPham: string;
  barcode?: string;
  tenSanPham: string;
  moTa?: string;
  donViTinh?: string;
  giaBan: number;
  giaNhap?: number; // Giá nhập (không phải giaVon)
  tonKho: number;
  tonKhoToiThieu?: number;
  chiNhanhId?: number;
  tenChiNhanh?: string;
  nhaCungCapId?: number;
  tenNhaCungCap?: string;
  trangThai: 'ACTIVE' | 'INACTIVE'; // Theo tài liệu - chỉ có ACTIVE và INACTIVE
  hinhAnh?: string;
  // Category fields (theo tài liệu mới)
  danhMucId?: number; // ID danh mục
  tenDanhMuc?: string; // Tên danh mục (read-only từ backend)
  // LƯU Ý: danhMuc KHÔNG có trong backend, chỉ dùng cho frontend display (deprecated)
  danhMuc?: string; // Deprecated - dùng tenDanhMuc thay thế
}

// Customer types (theo CustomerDTO trong tài liệu)
export interface Customer {
  id: number;
  maKhachHang: string;
  tenKhachHang: string;
  soDienThoai?: string;
  email?: string;
  diaChi?: string;
  diemTichLuy?: number;
  trangThai: 'ACTIVE' | 'INACTIVE'; // Theo tài liệu
}

// Invoice types (theo InvoiceDTO trong tài liệu)
export interface Invoice {
  id: number;
  maHoaDon: string;
  khachHangId?: number;
  tenKhachHang?: string;
  soDienThoaiKhachHang?: string;
  nhanVienId: number;
  tenNhanVien?: string;
  chiNhanhId: number;
  tenChiNhanh?: string;
  ngayTao: string;
  tongTien: number;
  giamGia?: number; // Giảm giá (không phải tienGiam)
  thanhTien: number; // Thành tiền (không phải thanhToan)
  phuongThucThanhToan?: string; // TIEN_MAT, CHUYEN_KHOAN, THE, VI_DIEN_TU, VNPAY
  diemTichLuy?: number; // 1000 VND = 1 điểm (backend đã tính: thanhTien / 1000)
  ghiChu?: string;
  trangThai: 'COMPLETED' | 'CANCELLED' | 'REFUNDED'; // Theo tài liệu
  chiTietHoaDons?: InvoiceDetail[];
  // Tương thích ngược
  tienGiam?: number; // Alias cho giamGia
  thanhToan?: number; // Alias cho thanhTien
}

// InvoiceDetail types (theo InvoiceDetailDTO trong tài liệu)
export interface InvoiceDetail {
  id: number;
  hoaDonId?: number;
  sanPhamId: number;
  tenSanPham?: string;
  maSanPham?: string; // Theo tài liệu
  soLuong: number;
  donGia: number;
  thanhTien: number;
  ghiChu?: string;
}

// === INVENTORY TYPES ===
export interface InventoryItem {
  id: number;
  sanPhamId: number;
  tenSanPham: string;
  maSanPham: string; // SKU
  tonKho: number;
  tonKhoToiThieu: number; // Mức tồn kho tối thiểu để cảnh báo
  donViTinh: string;
  giaNhap: number; // Giá vốn
  giaBan: number;
  danhMuc?: string;
  viTri?: string; // Ví dụ: Kệ A1, Kho 2
  ngayNhapGanNhat?: string;
}

export interface InventoryTransaction {
  id: number;
  sanPhamId: number;
  tenSanPham: string;
  loaiGiaoDich: 'NHAP' | 'XUAT' | 'DIEU_CHINH' | 'BAN_HANG' | 'TRA_HANG';
  soLuong: number;
  donGia: number;
  tongTien: number;
  lyDo?: string;
  nguoiThucHien: string; // Tên nhân viên
  ngayGiaoDich: string; // ISO Date string
  maPhieu?: string; // Mã phiếu nhập/xuất
}

// API Response wrapper (theo Response Format trong tài liệu)
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string | null;
  errorCode?: string | null;
  pageInfo?: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}

export interface PaginatedResponse<T> {
  content: T[];
  pageable?: {
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  // Tương thích ngược
  data?: T[];
  meta?: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
  };
}