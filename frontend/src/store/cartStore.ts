import { create } from 'zustand';
import { Product } from '@/lib/types';

export interface CartItem {
  product: Product;
  quantity: number;
  note?: string;
}

// Promotion theo PromotionDTO trong tài liệu
export interface Promotion {
  id: number;
  maKhuyenMai: string;
  tenKhuyenMai: string;
  moTa?: string;
  loaiKhuyenMai: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'BOGO' | 'BUNDLE' | 'FREE_SHIPPING' | 'BUY_X_GET_Y';
  chiNhanhId?: number;
  tenChiNhanh?: string;
  ngayBatDau: string;
  ngayKetThuc: string;
  giaTriKhuyenMai: number;
  giaTriToiThieu?: number;
  giamToiDa?: number;
  soLuongMua?: number;
  soLuongTang?: number;
  soLanSuDungToiDa?: number;
  tongSoLanSuDungToiDa?: number;
  soLanDaSuDung?: number;
  trangThai: 'ACTIVE' | 'INACTIVE';
  anhKhuyenMai?: string;
  dieuKien?: string;
  isActive?: boolean;
  sanPhamIds?: number[];
  // Tương thích ngược
  code?: string; // Alias cho maKhuyenMai
  name?: string; // Alias cho tenKhuyenMai
  description?: string; // Alias cho moTa
  type?: string; // Alias cho loaiKhuyenMai
  value?: number; // Alias cho giaTriKhuyenMai
  minPurchaseAmount?: number; // Alias cho giaTriToiThieu
  maxDiscountAmount?: number; // Alias cho giamToiDa
  startDate?: string; // Alias cho ngayBatDau
  endDate?: string; // Alias cho ngayKetThuc
  usageLimit?: number; // Alias cho soLanSuDungToiDa
  usedCount?: number; // Alias cho soLanDaSuDung
}

interface CartState {
  items: CartItem[];
  customer: { id?: number; name?: string; phone?: string; points?: number } | null;
  discount: number;
  promotion: Promotion | null;
  selectedTable: string;
  orderType: 'Dine-in' | 'Takeaway' | 'Delivery';
  currentInvoiceId: number | null; // Track đơn PENDING đang được resume
  
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  updateNote: (productId: number, note: string) => void;
  setCustomer: (customer: { id?: number; name?: string; phone?: string; points?: number } | null) => void;
  setDiscount: (discount: number) => void;
  setPromotion: (promotion: Promotion | null) => void;
  setSelectedTable: (table: string) => void;
  setOrderType: (type: 'Dine-in' | 'Takeaway' | 'Delivery') => void;
  setCurrentInvoiceId: (invoiceId: number | null) => void;
  clearCart: () => void;
  restoreCartFromInvoice: (invoice: { id?: number; chiTietHoaDons?: Array<{ sanPhamId: number; soLuong: number; donGia: number; ghiChu?: string }>; khachHangId?: number; giamGia?: number; maKhuyenMai?: string }, products: Product[]) => void;
  
  // Computed values
  getSubtotal: () => number;
  getTax: () => number;
  getTotal: () => number;
  calculatePromotionDiscount: (promotion: Promotion | null) => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  customer: null,
  discount: 0,
  promotion: null,
  selectedTable: 'A-128',
  orderType: 'Dine-in',
  currentInvoiceId: null,

  addItem: (product, quantity = 1) => {
    const { items } = get();
    
    // Validation: Check stock
    if (product.tonKho <= 0) {
      return; // Error message đã được hiển thị ở ProductCard
    }

    // Validation: Check status
    if (product.trangThai !== 'ACTIVE') {
      return; // Error message đã được hiển thị ở ProductCard
    }

    const existingItem = items.find(item => item.product.id === product.id);

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      // Check if new quantity exceeds stock
      if (newQuantity > product.tonKho) {
        return; // Error message đã được hiển thị ở ProductCard
      }
      set({
        items: items.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: newQuantity }
            : item
        ),
      });
    } else {
      // Check if quantity exceeds stock
      if (quantity > product.tonKho) {
        return; // Error message đã được hiển thị ở ProductCard
      }
      set({ items: [...items, { product, quantity, note: '' }] });
    }
  },

  removeItem: (productId) => {
    set({ items: get().items.filter(item => item.product.id !== productId) });
  },

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }
    
    const { items } = get();
    const item = items.find(i => i.product.id === productId);
    if (item) {
      // Check if quantity exceeds stock
      if (quantity > item.product.tonKho) {
        return; // Don't update if exceeds stock
      }
    }
    
    set({
      items: items.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      ),
    });
  },

  updateNote: (productId, note) => {
    set({
      items: get().items.map(item =>
        item.product.id === productId ? { ...item, note } : item
      ),
    });
  },

  setCustomer: (customer) => {
    set({ customer });
  },

  setDiscount: (discount) => {
    set({ discount });
  },

  setPromotion: (promotion) => {
    set({ promotion });
    // Auto-calculate discount when promotion is set
    const subtotal = get().getSubtotal();
    if (promotion) {
      // Check minimum purchase amount (dùng field chính)
      const minPurchase = promotion.giaTriToiThieu || promotion.minPurchaseAmount;
      if (minPurchase && subtotal < minPurchase) {
        set({ discount: 0 });
        return;
      }
      
      let discount = 0;
      // Dùng field chính loaiKhuyenMai và giaTriKhuyenMai
      const loaiKM = promotion.loaiKhuyenMai || promotion.type;
      const giaTriKM = promotion.giaTriKhuyenMai || promotion.value;
      
      if (loaiKM === 'PERCENTAGE') {
        discount = (subtotal * giaTriKM) / 100;
        const maxDiscount = promotion.giamToiDa || promotion.maxDiscountAmount;
        if (maxDiscount && discount > maxDiscount) {
          discount = maxDiscount;
        }
      } else if (loaiKM === 'FIXED_AMOUNT') {
        discount = giaTriKM;
      }
      
      set({ discount: Math.floor(discount) });
    } else {
      set({ discount: 0 });
    }
  },

  setSelectedTable: (table) => {
    set({ selectedTable: table });
  },

  setOrderType: (type) => {
    set({ orderType: type });
  },

  setCurrentInvoiceId: (invoiceId) => {
    set({ currentInvoiceId: invoiceId });
  },

  clearCart: () => {
    set({ items: [], customer: null, discount: 0, promotion: null, currentInvoiceId: null });
  },

  restoreCartFromInvoice: (invoice, products) => {
    if (!invoice.chiTietHoaDons || !Array.isArray(invoice.chiTietHoaDons)) {
      console.warn('[CartStore] No invoice details to restore');
      return;
    }

    const restoredItems: CartItem[] = [];
    
    // Restore items from invoice details
    invoice.chiTietHoaDons.forEach(detail => {
      const product = products.find(p => p.id === detail.sanPhamId);
      if (product) {
        restoredItems.push({
          product,
          quantity: detail.soLuong,
          note: detail.ghiChu || '',
        });
      } else {
        console.warn(`[CartStore] Product not found: ${detail.sanPhamId}`);
      }
    });

    // Restore customer if exists
    const customer = invoice.khachHangId ? {
      id: invoice.khachHangId,
    } : null;

    // Restore discount
    const discount = invoice.giamGia || 0;

    // Set currentInvoiceId để track đơn đang được resume
    const invoiceId = invoice.id || null;

    set({
      items: restoredItems,
      customer,
      discount,
      promotion: null, // Promotion sẽ được restore sau nếu cần
      currentInvoiceId: invoiceId, // ✅ Track đơn đang được resume
    });

    console.log('[CartStore] Cart restored from invoice:', {
      invoiceId,
      itemsCount: restoredItems.length,
      customer,
      discount,
    });
  },

  getSubtotal: () => {
    return get().items.reduce((total, item) => total + item.product.giaBan * item.quantity, 0);
  },

  getTax: () => {
    return 0; // Thuế không được tính ở frontend
  },

  getTotal: () => {
    const subtotal = get().getSubtotal();
    const discount = get().discount;
    return subtotal - discount;
  },

  calculatePromotionDiscount: (promotion) => {
    if (!promotion) return 0;
    
    const subtotal = get().getSubtotal();
    
    // Check minimum purchase amount (dùng field chính)
    const minPurchase = promotion.giaTriToiThieu || promotion.minPurchaseAmount;
    if (minPurchase && subtotal < minPurchase) {
      return 0;
    }
    
    let discount = 0;
    // Dùng field chính loaiKhuyenMai và giaTriKhuyenMai
    const loaiKM = promotion.loaiKhuyenMai || promotion.type;
    const giaTriKM = promotion.giaTriKhuyenMai || promotion.value;
    
    if (loaiKM === 'PERCENTAGE') {
      discount = (subtotal * giaTriKM) / 100;
      const maxDiscount = promotion.giamToiDa || promotion.maxDiscountAmount;
      if (maxDiscount && discount > maxDiscount) {
        discount = maxDiscount;
      }
    } else if (loaiKM === 'FIXED_AMOUNT') {
      discount = giaTriKM;
    }
    
    return Math.floor(discount);
  },
}));