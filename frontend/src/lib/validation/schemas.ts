import { z } from 'zod';
import { validatePhoneNumber, formatPhoneNumber } from '@/lib/utils/phone';

/**
 * Common validation schemas
 */

// Phone number validation
export const phoneSchema = z
  .string()
  .min(1, 'Số điện thoại không được để trống')
  .refine(
    (val) => validatePhoneNumber(val),
    {
      message: 'Số điện thoại không hợp lệ. Vui lòng nhập 10 số bắt đầu bằng 0',
    }
  )
  .transform((val) => formatPhoneNumber(val));

// Email validation
export const emailSchema = z
  .string()
  .email('Email không hợp lệ')
  .optional()
  .or(z.literal(''));

// Price validation (must be > 0)
export const priceSchema = z
  .number({ required_error: 'Giá không được để trống', invalid_type_error: 'Giá phải là số' })
  .positive('Giá phải lớn hơn 0')
  .or(
    z
      .string()
      .min(1, 'Giá không được để trống')
      .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: 'Giá phải là số lớn hơn 0',
      })
      .transform((val) => Number(val))
  );

// Quantity validation (must be > 0, integer) - dùng cho số lượng mua/bán
export const quantitySchema = z
  .number({ required_error: 'Số lượng không được để trống', invalid_type_error: 'Số lượng phải là số' })
  .int('Số lượng phải là số nguyên')
  .positive('Số lượng phải lớn hơn 0')
  .or(
    z
      .string()
      .min(1, 'Số lượng không được để trống')
      .refine((val) => !isNaN(Number(val)) && Number(val) > 0 && Number.isInteger(Number(val)), {
        message: 'Số lượng phải là số nguyên lớn hơn 0',
      })
      .transform((val) => Number(val))
  );

// Stock validation (must be >= 0, integer) - dùng cho tồn kho (cho phép = 0)
export const stockSchema = z
  .number({ required_error: 'Tồn kho không được để trống', invalid_type_error: 'Tồn kho phải là số' })
  .int('Tồn kho phải là số nguyên')
  .min(0, 'Tồn kho không được âm')
  .or(
    z
      .string()
      .min(1, 'Tồn kho không được để trống')
      .refine((val) => !isNaN(Number(val)) && Number(val) >= 0 && Number.isInteger(Number(val)), {
        message: 'Tồn kho phải là số nguyên không âm (có thể bằng 0)',
      })
      .transform((val) => Number(val))
  );

// Date validation
export const dateSchema = z.string().min(1, 'Ngày không được để trống');

// Date range validation (end date must be after start date)
export const dateRangeSchema = z
  .object({
    ngayBatDau: dateSchema,
    ngayKetThuc: dateSchema,
  })
  .refine((data) => {
    if (!data.ngayBatDau || !data.ngayKetThuc) return true;
    return new Date(data.ngayKetThuc) > new Date(data.ngayBatDau);
  }, {
    message: 'Ngày kết thúc phải sau ngày bắt đầu',
    path: ['ngayKetThuc'],
  });

// Product validation schema
export const productSchema = z.object({
  maSanPham: z.string().min(1, 'Mã sản phẩm không được để trống'),
  tenSanPham: z.string().min(1, 'Tên sản phẩm không được để trống'),
  moTa: z.string().optional(),
  giaBan: priceSchema,
  tonKho: stockSchema, // Sử dụng stockSchema thay vì quantitySchema (cho phép = 0)
  donViTinh: z.string().min(1, 'Đơn vị tính không được để trống'),
  trangThai: z.enum(['ACTIVE', 'INACTIVE']),
  hinhAnh: z.string().optional(),
  danhMucId: z.string().min(1, 'Danh mục không được để trống').or(z.number()).optional(),
});

// Employee validation schema
export const employeeSchema = z.object({
  maNhanVien: z.string().min(1, 'Mã nhân viên không được để trống'),
  tenNhanVien: z.string().min(1, 'Tên nhân viên không được để trống'),
  username: z
    .string()
    .min(4, 'Username phải có ít nhất 4 ký tự')
    .max(50, 'Username không được vượt quá 50 ký tự')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username chỉ được chứa chữ cái, số và dấu gạch dưới'),
  password: z
    .string()
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
    .optional(), // Optional for edit
  email: emailSchema,
  soDienThoai: phoneSchema.optional().or(z.literal('')),
  role: z.enum(['ADMIN', 'MANAGER', 'CASHIER']),
  chiNhanhId: z.number().optional(),
  trangThai: z.enum(['ACTIVE', 'INACTIVE']),
  ngayBatDau: dateSchema.optional().or(z.literal('')),
});

// Customer validation schema
export const customerSchema = z.object({
  tenKhachHang: z.string().min(1, 'Tên khách hàng không được để trống'),
  soDienThoai: phoneSchema,
  email: emailSchema,
  diaChi: z.string().optional(),
  diemTichLuy: z.number().min(0, 'Điểm tích lũy không được âm').default(0),
  trangThai: z.enum(['ACTIVE', 'INACTIVE']),
});

// Promotion validation schema
export const promotionSchema = z
  .object({
    maKhuyenMai: z.string().min(1, 'Mã khuyến mãi không được để trống'),
    tenKhuyenMai: z.string().min(1, 'Tên khuyến mãi không được để trống'),
    moTa: z.string().optional(),
    loaiKhuyenMai: z.enum(['PERCENTAGE', 'FIXED_AMOUNT', 'BOGO', 'BUY_X_GET_Y']),
    giaTriKhuyenMai: z.number().positive('Giá trị khuyến mãi phải lớn hơn 0'),
    giaTriToiThieu: z.number().min(0, 'Giá trị tối thiểu không được âm').optional(),
    giamToiDa: z.number().min(0, 'Giảm tối đa không được âm').optional(),
    soLuongMua: z.number().int().positive('Số lượng mua phải là số nguyên dương').optional(),
    soLuongTang: z.number().int().positive('Số lượng tặng phải là số nguyên dương').optional(),
    chiNhanhId: z.number().optional(),
    ngayBatDau: dateSchema,
    ngayKetThuc: dateSchema,
    soLanSuDungToiDa: z.number().int().positive().optional(),
    trangThai: z.enum(['ACTIVE', 'INACTIVE']),
  })
  .refine(
    (data) => {
      // PERCENTAGE: giá trị phải trong khoảng 0-100
      if (data.loaiKhuyenMai === 'PERCENTAGE') {
        return data.giaTriKhuyenMai >= 0 && data.giaTriKhuyenMai <= 100;
      }
      return true;
    },
    {
      message: 'Giá trị khuyến mãi phần trăm phải trong khoảng 0-100',
      path: ['giaTriKhuyenMai'],
    }
  )
  .refine(
    (data) => {
      // BOGO/BUY_X_GET_Y: cần có soLuongMua và soLuongTang
      if (data.loaiKhuyenMai === 'BOGO' || data.loaiKhuyenMai === 'BUY_X_GET_Y') {
        return data.soLuongMua !== undefined && data.soLuongTang !== undefined;
      }
      return true;
    },
    {
      message: 'Loại khuyến mãi này yêu cầu số lượng mua và số lượng tặng',
      path: ['soLuongMua'],
    }
  )
  .refine(
    (data) => {
      // Ngày kết thúc phải sau ngày bắt đầu
      if (!data.ngayBatDau || !data.ngayKetThuc) return true;
      return new Date(data.ngayKetThuc) > new Date(data.ngayBatDau);
    },
    {
      message: 'Ngày kết thúc phải sau ngày bắt đầu',
      path: ['ngayKetThuc'],
    }
  );

// Inventory receipt validation
export const inventoryReceiptSchema = z.object({
  tenPhieu: z.string().min(1, 'Tên phiếu không được để trống'),
  maPhieu: z.string().optional(),
  loaiPhieu: z.enum(['NHAP_HANG', 'XUAT_HANG']),
  ngayTao: dateSchema,
  ghiChu: z.string().optional(),
  items: z
    .array(
      z.object({
        nguyenLieuId: z.number().min(1, 'Nguyên liệu không được để trống'),
        soLuong: quantitySchema,
        donGia: priceSchema.optional(),
      })
    )
    .min(1, 'Phải có ít nhất một nguyên liệu'),
});

// Stock adjustment validation
export const stockAdjustmentSchema = z.object({
  soLuong: quantitySchema,
  lyDo: z.string().min(1, 'Lý do không được để trống'),
});

// Payment validation
export const paymentSchema = z.object({
  phuongThucThanhToan: z.enum(['CASH', 'VISA', 'MASTER', 'JCB', 'BANK_TRANSFER', 'VNPAY']),
  giamGia: z.number().min(0, 'Giảm giá không được âm').default(0),
  diemSuDung: z.number().int().min(0, 'Điểm sử dụng không được âm').default(0),
});

// Raw material validation
export const rawMaterialSchema = z.object({
  tenNguyenLieu: z.string().min(1, 'Tên nguyên liệu không được để trống'),
  donViTinh: z.string().min(1, 'Đơn vị tính không được để trống'),
  slToiThieu: z.number().int().min(0, 'Số lượng tối thiểu không được âm').optional(),
  ghiChu: z.string().optional(),
});

// Export types
export type ProductFormData = z.infer<typeof productSchema>;
export type EmployeeFormData = z.infer<typeof employeeSchema>;
export type CustomerFormData = z.infer<typeof customerSchema>;
export type PromotionFormData = z.infer<typeof promotionSchema>;
export type InventoryReceiptFormData = z.infer<typeof inventoryReceiptSchema>;
export type StockAdjustmentFormData = z.infer<typeof stockAdjustmentSchema>;
export type PaymentFormData = z.infer<typeof paymentSchema>;
export type RawMaterialFormData = z.infer<typeof rawMaterialSchema>;
