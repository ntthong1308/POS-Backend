import { Product } from '@/lib/types';
import { CheckoutRequest, CheckoutResponse } from '../pos';

// Extended Product type for mock data (includes additional fields)
interface MockProduct extends Product {
  barcode?: string;
  giaNhap?: number;
  tonKhoToiThieu?: number;
  chiNhanhId?: number;
  tenChiNhanh?: string;
  nhaCungCapId?: number;
  tenNhaCungCap?: string;
}

// Mock Products Data
export const mockProducts: MockProduct[] = [
  {
    id: 1,
    maSanPham: 'SP001',
    barcode: '8934567890123',
    tenSanPham: 'Cà phê đen đá',
    moTa: 'Cà phê đen đá truyền thống',
    donViTinh: 'Ly',
    giaBan: 25000,
    giaVon: 15000,
    giaNhap: 15000,
    tonKho: 100,
    tonKhoToiThieu: 20,
    chiNhanhId: 1,
    tenChiNhanh: 'Chi nhánh Trung tâm',
    nhaCungCapId: 1,
    tenNhaCungCap: 'Nhà cung cấp A',
    trangThai: 'ACTIVE',
    danhMuc: 'Beverages',
    hinhAnh: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400',
  },
  {
    id: 2,
    maSanPham: 'SP002',
    barcode: '8934567890124',
    tenSanPham: 'Trà sữa trân châu',
    moTa: 'Trà sữa trân châu đặc biệt',
    donViTinh: 'Ly',
    giaBan: 35000,
    giaVon: 20000,
    giaNhap: 20000,
    tonKho: 80,
    tonKhoToiThieu: 30,
    chiNhanhId: 1,
    tenChiNhanh: 'Chi nhánh Trung tâm',
    nhaCungCapId: 1,
    tenNhaCungCap: 'Nhà cung cấp A',
    trangThai: 'ACTIVE',
    danhMuc: 'Beverages',
    hinhAnh: 'https://images.unsplash.com/photo-1525385444278-5d59a51f66c7?w=400',
  },
  {
    id: 3,
    maSanPham: 'SP003',
    barcode: '8934567890125',
    tenSanPham: 'Bánh mì thịt nguội',
    moTa: 'Bánh mì thịt nguội đặc biệt',
    donViTinh: 'Cái',
    giaBan: 30000,
    giaVon: 18000,
    giaNhap: 18000,
    tonKho: 50,
    tonKhoToiThieu: 10,
    chiNhanhId: 1,
    tenChiNhanh: 'Chi nhánh Trung tâm',
    nhaCungCapId: 2,
    tenNhaCungCap: 'Nhà cung cấp B',
    trangThai: 'ACTIVE',
    danhMuc: 'Main Course',
    hinhAnh: 'https://images.unsplash.com/photo-1619894991209-4f6106c0c8f9?w=400',
  },
  {
    id: 4,
    maSanPham: 'SP004',
    barcode: '8934567890126',
    tenSanPham: 'Cappuccino',
    moTa: 'Cappuccino Ý đậm đà',
    donViTinh: 'Ly',
    giaBan: 45000,
    giaVon: 25000,
    giaNhap: 25000,
    tonKho: 60,
    tonKhoToiThieu: 20,
    chiNhanhId: 1,
    tenChiNhanh: 'Chi nhánh Trung tâm',
    nhaCungCapId: 1,
    tenNhaCungCap: 'Nhà cung cấp A',
    trangThai: 'ACTIVE',
    danhMuc: 'Beverages',
    hinhAnh: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400',
  },
  {
    id: 5,
    maSanPham: 'SP005',
    barcode: '8934567890127',
    tenSanPham: 'Sinh tố bơ',
    moTa: 'Sinh tố bơ tươi ngon',
    donViTinh: 'Ly',
    giaBan: 55000,
    giaVon: 30000,
    giaNhap: 30000,
    tonKho: 40,
    tonKhoToiThieu: 15,
    chiNhanhId: 1,
    tenChiNhanh: 'Chi nhánh Trung tâm',
    nhaCungCapId: 1,
    tenNhaCungCap: 'Nhà cung cấp A',
    trangThai: 'ACTIVE',
    danhMuc: 'Beverages',
    hinhAnh: 'https://images.unsplash.com/photo-1553909489-ec2175ef8f17?w=400',
  },
  {
    id: 6,
    maSanPham: 'SP006',
    barcode: '8934567890128',
    tenSanPham: 'Phở bò tái',
    moTa: 'Phở bò tái thơm ngon',
    donViTinh: 'Tô',
    giaBan: 75000,
    giaVon: 40000,
    giaNhap: 40000,
    tonKho: 30,
    tonKhoToiThieu: 10,
    chiNhanhId: 1,
    tenChiNhanh: 'Chi nhánh Trung tâm',
    nhaCungCapId: 2,
    tenNhaCungCap: 'Nhà cung cấp B',
    trangThai: 'ACTIVE',
    danhMuc: 'Main Course',
    hinhAnh: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400',
  },
  {
    id: 7,
    maSanPham: 'SP007',
    barcode: '8934567890129',
    tenSanPham: 'Kem chanh dây',
    moTa: 'Kem chanh dây mát lạnh',
    donViTinh: 'Ly',
    giaBan: 35000,
    giaVon: 20000,
    giaNhap: 20000,
    tonKho: 25,
    tonKhoToiThieu: 10,
    chiNhanhId: 1,
    tenChiNhanh: 'Chi nhánh Trung tâm',
    nhaCungCapId: 1,
    tenNhaCungCap: 'Nhà cung cấp A',
    trangThai: 'ACTIVE',
    danhMuc: 'Dessert',
    hinhAnh: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400',
  },
  {
    id: 8,
    maSanPham: 'SP008',
    barcode: '8934567890130',
    tenSanPham: 'Nước ép cam tươi',
    moTa: 'Nước ép cam tươi nguyên chất',
    donViTinh: 'Ly',
    giaBan: 40000,
    giaVon: 22000,
    giaNhap: 22000,
    tonKho: 45,
    tonKhoToiThieu: 15,
    chiNhanhId: 1,
    tenChiNhanh: 'Chi nhánh Trung tâm',
    nhaCungCapId: 1,
    tenNhaCungCap: 'Nhà cung cấp A',
    trangThai: 'ACTIVE',
    danhMuc: 'Beverages',
    hinhAnh: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400',
  },
  {
    id: 9,
    maSanPham: 'SP009',
    barcode: '8934567890131',
    tenSanPham: 'Bánh croissant',
    moTa: 'Bánh croissant Pháp thơm ngon',
    donViTinh: 'Cái',
    giaBan: 25000,
    giaVon: 15000,
    giaNhap: 15000,
    tonKho: 35,
    tonKhoToiThieu: 10,
    chiNhanhId: 1,
    tenChiNhanh: 'Chi nhánh Trung tâm',
    nhaCungCapId: 2,
    tenNhaCungCap: 'Nhà cung cấp B',
    trangThai: 'ACTIVE',
    danhMuc: 'Appetizer',
    hinhAnh: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400',
  },
  {
    id: 10,
    maSanPham: 'SP010',
    barcode: '8934567890132',
    tenSanPham: 'Bánh ngọt',
    moTa: 'Bánh ngọt đa dạng',
    donViTinh: 'Cái',
    giaBan: 20000,
    giaVon: 12000,
    giaNhap: 12000,
    tonKho: 20,
    tonKhoToiThieu: 10,
    chiNhanhId: 1,
    tenChiNhanh: 'Chi nhánh Trung tâm',
    nhaCungCapId: 2,
    tenNhaCungCap: 'Nhà cung cấp B',
    trangThai: 'ACTIVE',
    danhMuc: 'Dessert',
    hinhAnh: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400',
  },
];

// Mock delay function
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API responses
export const mockPOSAPI = {
  // Get products
  getProducts: async (params?: { page?: number; size?: number; search?: string }): Promise<Product[]> => {
    await delay(500); // Simulate network delay
    
    // Convert MockProduct to Product (remove extra fields)
    let result: Product[] = mockProducts.map(p => ({
      id: p.id,
      maSanPham: p.maSanPham,
      tenSanPham: p.tenSanPham,
      moTa: p.moTa,
      giaBan: p.giaBan,
      giaVon: p.giaVon,
      tonKho: p.tonKho,
      donViTinh: p.donViTinh,
      danhMuc: p.danhMuc,
      trangThai: p.trangThai,
      hinhAnh: p.hinhAnh,
    }));
    
    // Filter by search
    if (params?.search) {
      const keyword = params.search.toLowerCase();
      result = result.filter(p => 
        p.tenSanPham.toLowerCase().includes(keyword) ||
        p.maSanPham.toLowerCase().includes(keyword)
      );
    }
    
    // Pagination
    if (params?.page !== undefined && params?.size) {
      const start = params.page * params.size;
      const end = start + params.size;
      result = result.slice(start, end);
    }
    
    console.log('📦 Mock API: Returning', result.length, 'products');
    return result;
  },

  // Search products
  searchProducts: async (keyword: string): Promise<Product[]> => {
    await delay(300);
    
    // Convert MockProduct to Product
    let result: Product[] = mockProducts.map(p => ({
      id: p.id,
      maSanPham: p.maSanPham,
      tenSanPham: p.tenSanPham,
      moTa: p.moTa,
      giaBan: p.giaBan,
      giaVon: p.giaVon,
      tonKho: p.tonKho,
      donViTinh: p.donViTinh,
      danhMuc: p.danhMuc,
      trangThai: p.trangThai,
      hinhAnh: p.hinhAnh,
    }));
    
    if (!keyword.trim()) {
      return result;
    }
    
    const lowerKeyword = keyword.toLowerCase();
    result = result.filter(p => 
      p.tenSanPham.toLowerCase().includes(lowerKeyword) ||
      p.maSanPham.toLowerCase().includes(lowerKeyword)
    );
    
    console.log('🔍 Mock API: Search found', result.length, 'products');
    return result;
  },

  // Scan barcode
  scanBarcode: async (barcode: string): Promise<Product> => {
    await delay(200);
    
    const product = mockProducts.find(p => p.barcode === barcode);
    if (!product) {
      throw new Error('Không tìm thấy sản phẩm với barcode này');
    }
    // Convert to Product type
    return {
      id: product.id,
      maSanPham: product.maSanPham,
      tenSanPham: product.tenSanPham,
      moTa: product.moTa,
      giaBan: product.giaBan,
      giaVon: product.giaVon,
      tonKho: product.tonKho,
      donViTinh: product.donViTinh,
      danhMuc: product.danhMuc,
      trangThai: product.trangThai,
      hinhAnh: product.hinhAnh,
    };
  },

  // Get product by ID
  getProductById: async (id: number): Promise<Product> => {
    await delay(200);
    
    const product = mockProducts.find(p => p.id === id);
    if (!product) {
      throw new Error('Không tìm thấy sản phẩm');
    }
    // Convert to Product type
    return {
      id: product.id,
      maSanPham: product.maSanPham,
      tenSanPham: product.tenSanPham,
      moTa: product.moTa,
      giaBan: product.giaBan,
      giaVon: product.giaVon,
      tonKho: product.tonKho,
      donViTinh: product.donViTinh,
      danhMuc: product.danhMuc,
      trangThai: product.trangThai,
      hinhAnh: product.hinhAnh,
    };
  },

  // Validate checkout
  validateCheckout: async (items: CheckoutRequest['items']): Promise<{ valid: boolean; errors?: string[] }> => {
    await delay(300);
    
    const errors: string[] = [];
    
    for (const item of items) {
      const product = mockProducts.find(p => p.id === item.sanPhamId);
      
      if (!product) {
        errors.push(`Sản phẩm ID ${item.sanPhamId} không tồn tại`);
        continue;
      }
      
      if (product.trangThai !== 'ACTIVE') {
        errors.push(`${product.tenSanPham} không còn hoạt động`);
        continue;
      }
      
      if (item.soLuong <= 0) {
        errors.push(`Số lượng ${product.tenSanPham} phải lớn hơn 0`);
        continue;
      }
      
      if (item.soLuong > product.tonKho) {
        errors.push(`${product.tenSanPham} không đủ tồn kho (còn ${product.tonKho})`);
      }
    }
    
    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  },

  // Checkout
  checkout: async (data: CheckoutRequest): Promise<CheckoutResponse> => {
    await delay(1000); // Simulate processing time
    
    // Calculate totals
    let tongTien = 0;
    for (const item of data.items) {
      const product = mockProducts.find(p => p.id === item.sanPhamId);
      if (product) {
        tongTien += product.giaBan * item.soLuong;
      }
    }
    
    const giamGia = data.giamGia || 0;
    const thanhTien = tongTien - giamGia;
    
    // Generate invoice code
    const invoiceId = Math.floor(Math.random() * 1000000);
    const maHoaDon = `HD${new Date().getFullYear()}${String(invoiceId).padStart(6, '0')}`;
    
    return {
      id: invoiceId,
      maHoaDon,
      tongTien,
      giamGia,
      thanhTien,
      phuongThucThanhToan: data.phuongThucThanhToan,
      trangThai: 'COMPLETED',
      ngayTao: new Date().toISOString(),
    };
  },
};

