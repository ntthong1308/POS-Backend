import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Download, 
  Filter,
  ChevronDown,
  Plus,
  Minus,
  History,
  X,
  FileText,
  RefreshCw,
  Edit,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { inventoryAPI } from '@/lib/api/inventory';
import { productsAPI } from '@/lib/api/products';
import { rawMaterialsAPI, RawMaterial } from '@/lib/api/rawMaterials';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { Product } from '@/lib/types';
import AddRawMaterialDialog from '@/components/features/rawMaterials/AddRawMaterialDialog';
import { logger } from '@/lib/utils/logger';
import { handleApiError } from '@/lib/utils/errorHandler';

// Types
interface InventoryItem {
  id: number;
  tenSanPham: string;
  donViTinh?: string;
  slToiThieu?: number;
  slTonCuoi: number;
  trangThai: 'CON_HANG' | 'SAP_HET' | 'HET_HANG';
  hinhAnh?: string;
  maSanPham?: string;
}

// Interface theo API response
interface ImportReceipt {
  id: number;
  maPhieu: string;
  nguyenLieuId: number;
  tenNguyenLieu: string;
  maNguyenLieu: string;
  ngayNhapXuat: string; // ISO format: "2025-12-07T04:36:38"
  loaiPhieu: 'NHAP';
  soLuong: number;
  nhanVienId: number;
  tenNhanVien: string;
  ghiChu?: string;
}

// ✅ Grouped receipt - gộp nhiều nguyên liệu vào 1 phiếu
interface GroupedImportReceipt {
  maPhieu: string;
  ngayNhapXuat: string;
  nhanVienId: number;
  tenNhanVien: string;
  ghiChu?: string;
  items: Array<{
    id: number;
    nguyenLieuId: number;
    tenNguyenLieu: string;
    maNguyenLieu: string;
    soLuong: number;
    ghiChu?: string;
  }>;
}

interface ExportReceipt {
  id: number;
  maPhieu: string;
  nguyenLieuId: number;
  tenNguyenLieu: string;
  maNguyenLieu: string;
  ngayNhapXuat: string; // ISO format: "2025-12-07T04:40:15"
  loaiPhieu: 'XUAT';
  soLuong: number;
  nhanVienId: number;
  tenNhanVien: string;
  ghiChu?: string;
}

interface TransactionHistory {
  id: number;
  maPhieu: string;
  nguyenLieuId: number;
  tenNguyenLieu: string;
  maNguyenLieu: string;
  ngayNhapXuat: string; // ISO format
  loaiPhieu: 'NHAP' | 'XUAT' | 'DIEU_CHINH';
  soLuong: number;
  soLuongTruoc?: number;
  soLuongConLai?: number;
  nhanVienId: number;
  tenNhanVien: string;
  ghiChu?: string;
  // Getter methods from DTO
  thoiGian?: string;
  tenNguyenLieuHienThi?: string;
  hanhDong?: string;
  thamChieu?: string;
  thayDoi?: string;
  conLai?: number;
}

export default function InventoryPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [activeMainTab, setActiveMainTab] = useState<'stock' | 'import' | 'export' | 'history'>('stock');
  // Removed product tab, only raw materials now
  // const [activeStockTab, setActiveStockTab] = useState<'raw' | 'product'>('raw');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Stock list data
  const [stockItems, setStockItems] = useState<InventoryItem[]>([]);
  
  // Import receipts data
  const [importReceipts, setImportReceipts] = useState<ImportReceipt[]>([]);
  
  // Export receipts data
  const [exportReceipts, setExportReceipts] = useState<ExportReceipt[]>([]);
  
  // Transaction history data
  const [transactions, setTransactions] = useState<TransactionHistory[]>([]);
  
  // Dialog states
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isAdjustStockDialogOpen, setIsAdjustStockDialogOpen] = useState(false);
  const [isSelectItemsDialogOpen, setIsSelectItemsDialogOpen] = useState(false);
  const [isAddRawMaterialDialogOpen, setIsAddRawMaterialDialogOpen] = useState(false);
  const [editingRawMaterial, setEditingRawMaterial] = useState<RawMaterial | null>(null);
  const [deletingRawMaterialId, setDeletingRawMaterialId] = useState<number | null>(null);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [adjustType, setAdjustType] = useState<'increase' | 'decrease'>('increase');
  const [adjustQuantity, setAdjustQuantity] = useState('');

  // Form states for import/export
  const [formType, setFormType] = useState<'import' | 'export'>('import');
  // Auto-set loaiPhieu based on formType
  const loaiPhieu = formType === 'import' ? 'NHAP_HANG' : 'XUAT_HANG';
  const [tenPhieu, setTenPhieu] = useState('');
  const [maPhieu, setMaPhieu] = useState('');
  const [selectedItems, setSelectedItems] = useState<Array<{
    id: number;
    ten: string;
    donViTinh: string;
    soLuong: string;
    type: 'raw' | 'product';
  }>>([]);

  // Select items dialog states
  const [selectDialogTab, setSelectDialogTab] = useState<'raw' | 'product'>('raw');
  const [selectDialogSearch, setSelectDialogSearch] = useState('');
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedItemIds, setSelectedItemIds] = useState<Set<number>>(new Set());
  const [loadingSelectDialog, setLoadingSelectDialog] = useState(false);

  // Load import receipts
  const loadImportReceipts = async () => {
    setLoading(true);
    try {
      const receipts = await rawMaterialsAPI.getImportHistory({ page: 0, size: 1000 });
      // Đảm bảo receipts luôn là array
      setImportReceipts(Array.isArray(receipts) ? receipts : []);
    } catch (error: any) {
      logger.error('Error loading import receipts:', error);
      toast.error('Không thể tải danh sách phiếu nhập kho');
      setImportReceipts([]);
    } finally {
      setLoading(false);
    }
  };

  // Load export receipts
  const loadExportReceipts = async () => {
    setLoading(true);
    try {
      const receipts = await rawMaterialsAPI.getExportHistory({ page: 0, size: 1000 });
      // Đảm bảo receipts luôn là array
      setExportReceipts(Array.isArray(receipts) ? receipts : []);
    } catch (error: any) {
      logger.error('Error loading export receipts:', error);
      toast.error('Không thể tải danh sách phiếu xuất kho');
      setExportReceipts([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Helper function để extract base mã phiếu (bỏ phần suffix cuối cùng như -1, -2)
  // Ví dụ: NHAP-20251214034042-38E1344E-2 → NHAP-20251214034042-38E1344E
  const getBaseMaPhieu = (maPhieu: string): string => {
    // Tìm vị trí dấu - cuối cùng
    const lastDashIndex = maPhieu.lastIndexOf('-');
    if (lastDashIndex === -1) return maPhieu;
    
    // Lấy phần sau dấu - cuối cùng
    const suffix = maPhieu.substring(lastDashIndex + 1);
    
    // Nếu suffix là số (ví dụ: -1, -2, -10), thì bỏ nó đi
    if (/^\d+$/.test(suffix)) {
      return maPhieu.substring(0, lastDashIndex);
    }
    
    // Nếu không phải số, giữ nguyên
    return maPhieu;
  };

  // ✅ Group import receipts theo base maPhieu - gộp nhiều nguyên liệu vào 1 phiếu
  const groupedImportReceipts = useMemo(() => {
    const grouped = new Map<string, GroupedImportReceipt>();
    
    importReceipts.forEach((receipt) => {
      // ✅ Group theo base mã phiếu (bỏ suffix -1, -2, ...)
      const baseMaPhieu = getBaseMaPhieu(receipt.maPhieu);
      
      if (!grouped.has(baseMaPhieu)) {
        // Dùng base mã phiếu (không có suffix) để hiển thị
        grouped.set(baseMaPhieu, {
          maPhieu: baseMaPhieu, // ✅ Hiển thị base mã phiếu (không có suffix -1, -2)
          ngayNhapXuat: receipt.ngayNhapXuat,
          nhanVienId: receipt.nhanVienId,
          tenNhanVien: receipt.tenNhanVien,
          ghiChu: receipt.ghiChu,
          items: [],
        });
      }
      
      const group = grouped.get(baseMaPhieu)!;
      group.items.push({
        id: receipt.id,
        nguyenLieuId: receipt.nguyenLieuId,
        tenNguyenLieu: receipt.tenNguyenLieu,
        maNguyenLieu: receipt.maNguyenLieu,
        soLuong: receipt.soLuong,
        ghiChu: receipt.ghiChu,
      });
    });
    
    return Array.from(grouped.values());
  }, [importReceipts]);

  // ✅ Group export receipts theo base maPhieu - gộp nhiều nguyên liệu vào 1 phiếu
  const groupedExportReceipts = useMemo(() => {
    const grouped = new Map<string, {
      maPhieu: string;
      ngayNhapXuat: string;
      nhanVienId: number;
      tenNhanVien: string;
      ghiChu?: string;
      items: Array<{
        id: number;
        nguyenLieuId: number;
        tenNguyenLieu: string;
        maNguyenLieu: string;
        soLuong: number;
        ghiChu?: string;
      }>;
    }>();
    
    exportReceipts.forEach((receipt) => {
      // ✅ Group theo base mã phiếu (bỏ suffix -1, -2, ...)
      const baseMaPhieu = getBaseMaPhieu(receipt.maPhieu);
      
      if (!grouped.has(baseMaPhieu)) {
        // Dùng base mã phiếu (không có suffix) để hiển thị
        grouped.set(baseMaPhieu, {
          maPhieu: baseMaPhieu, // ✅ Hiển thị base mã phiếu (không có suffix -1, -2)
          ngayNhapXuat: receipt.ngayNhapXuat,
          nhanVienId: receipt.nhanVienId,
          tenNhanVien: receipt.tenNhanVien,
          ghiChu: receipt.ghiChu,
          items: [],
        });
      }
      
      const group = grouped.get(baseMaPhieu)!;
      group.items.push({
        id: receipt.id,
        nguyenLieuId: receipt.nguyenLieuId,
        tenNguyenLieu: receipt.tenNguyenLieu,
        maNguyenLieu: receipt.maNguyenLieu,
        soLuong: receipt.soLuong,
        ghiChu: receipt.ghiChu,
      });
    });
    
    return Array.from(grouped.values());
  }, [exportReceipts]);

  // Load transaction history
  const loadTransactionHistory = async () => {
    setLoading(true);
    try {
      const history = await rawMaterialsAPI.getTransactionHistory({ page: 0, size: 1000 });
      // Đảm bảo history luôn là array
      setTransactions(Array.isArray(history) ? history : []);
    } catch (error: any) {
      logger.error('Error loading transaction history:', error);
      toast.error('Không thể tải lịch sử giao dịch');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  // Load stock items
  useEffect(() => {
    const loadStockItems = async () => {
      setLoading(true);
      try {
        // Only load raw materials now
        const result = await rawMaterialsAPI.getAll({ page: 0, size: 1000 });
        const rawList = result.content || [];
        
        const items: InventoryItem[] = rawList.map(r => {
          const tonKho = r.tonKho ?? r.soLuong ?? 0;
          let trangThai: 'CON_HANG' | 'SAP_HET' | 'HET_HANG' = 'CON_HANG';
          if (tonKho === 0) {
            trangThai = 'HET_HANG';
          } else if (r.tonKhoToiThieu && tonKho < r.tonKhoToiThieu) {
            trangThai = 'SAP_HET';
          }
          
          return {
            id: r.id,
            tenSanPham: r.tenNguyenLieu,
            donViTinh: r.donViTinh || 'Cái',
            slToiThieu: r.tonKhoToiThieu || 0,
            slTonCuoi: tonKho,
            trangThai,
            maSanPham: r.maNguyenLieu,
          };
        });
        
        setStockItems(items);
        // filteredStockItems is a useMemo, no need to set it
      } catch (error: any) {
        logger.error('Error loading stock:', error);
        toast.error('Không thể tải danh sách tồn kho');
      } finally {
        setLoading(false);
      }
    };
    
    if (activeMainTab === 'stock') {
      loadStockItems();
    } else if (activeMainTab === 'import') {
      loadImportReceipts();
    } else if (activeMainTab === 'export') {
      loadExportReceipts();
    } else if (activeMainTab === 'history') {
      loadTransactionHistory();
    }
  }, [activeMainTab]);

  // Memoize filtered stock items to avoid recalculating on every render
  const filteredStockItems = useMemo(() => {
    if (!searchQuery) {
      return stockItems;
    }
    
    const query = searchQuery.toLowerCase();
    return stockItems.filter(item =>
      item.tenSanPham.toLowerCase().includes(query) ||
      item.maSanPham?.toLowerCase().includes(query)
    );
  }, [searchQuery, stockItems]);

  // Memoize total stock calculation
  const totalStock = useMemo(() => {
    return filteredStockItems.reduce((sum, item) => sum + item.slTonCuoi, 0);
  }, [filteredStockItems]);

  // Memoize getStatusBadge function to avoid recreating on every render
  const getStatusBadge = useCallback((status: string) => {
    switch (status) {
      case 'CON_HANG':
        return { label: 'Còn hàng', color: 'bg-blue-100 text-blue-800' };
      case 'SAP_HET':
        return { label: 'Sắp hết hàng', color: 'bg-orange-100 text-orange-800' };
      case 'HET_HANG':
        return { label: 'Hết hàng', color: 'bg-red-100 text-red-800' };
      default:
        return { label: status, color: 'bg-gray-100 text-gray-800' };
    }
  }, []);

  // Memoize handlers to prevent unnecessary re-renders
  const handleAdjustStock = useCallback(async () => {
    if (!selectedItem || !adjustQuantity || !user) {
      toast.error('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    const quantity = Number(adjustQuantity);
    if (quantity <= 0) {
      toast.error('Số lượng phải lớn hơn 0');
      return;
    }

    // Confirmation dialog
    const action = adjustType === 'increase' ? 'nhập kho' : 'xuất kho';
    const confirmMessage = `Bạn có chắc chắn muốn ${action} ${quantity} ${selectedItem.donViTinh || 'sản phẩm'} "${selectedItem.tenSanPham}"?`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      // Tính số lượng mới
      let soLuongMoi: number;
      if (adjustType === 'increase') {
        // Tăng: số lượng mới = số lượng hiện tại + số lượng điều chỉnh
        soLuongMoi = selectedItem.slTonCuoi + quantity;
      } else {
        // Giảm: số lượng mới = số lượng hiện tại - số lượng điều chỉnh
        if (quantity > selectedItem.slTonCuoi) {
          toast.error('Số lượng xuất không được lớn hơn tồn kho hiện tại');
          return;
        }
        soLuongMoi = Math.max(0, selectedItem.slTonCuoi - quantity);
      }

      // Sử dụng API điều chỉnh số lượng (adjustQuantity) để ghi lại lịch sử
      await rawMaterialsAPI.adjustQuantity({
        nguyenLieuId: selectedItem.id,
        soLuongMoi: soLuongMoi,
        nhanVienId: user.id,
        ghiChu: adjustType === 'increase' ? `Điều chỉnh tăng tồn kho: +${quantity}` : `Điều chỉnh giảm tồn kho: -${quantity}`,
      });
      
      toast.success(adjustType === 'increase' ? 'Đã điều chỉnh tăng tồn kho thành công' : 'Đã điều chỉnh giảm tồn kho thành công');

      // Reload stock items
      const result = await rawMaterialsAPI.getAll({ page: 0, size: 1000 });
      const rawList = result.content || [];
      const items: InventoryItem[] = rawList.map(r => {
        const tonKho = r.tonKho ?? r.soLuong ?? 0;
        let trangThai: 'CON_HANG' | 'SAP_HET' | 'HET_HANG' = 'CON_HANG';
        if (tonKho === 0) {
          trangThai = 'HET_HANG';
        } else if (r.tonKhoToiThieu && tonKho < r.tonKhoToiThieu) {
          trangThai = 'SAP_HET';
        }
        return {
          id: r.id,
          tenSanPham: r.tenNguyenLieu,
          donViTinh: r.donViTinh || 'Cái',
          slToiThieu: r.tonKhoToiThieu || 0,
          slTonCuoi: tonKho,
          trangThai,
          maSanPham: r.maNguyenLieu,
        };
      });
      setStockItems(items);

      // Reload transaction history
      await loadTransactionHistory();

      setIsAdjustStockDialogOpen(false);
      setSelectedItem(null);
      setAdjustQuantity('');
    } catch (error: any) {
      logger.error('Error adjusting stock:', error);
      toast.error(error.response?.data?.message || 'Không thể điều chỉnh tồn kho');
    }
  }, [selectedItem, adjustQuantity, adjustType, user, loadTransactionHistory]);

  // Open adjust stock dialog
  const openAdjustStockDialog = useCallback((item: InventoryItem, type: 'increase' | 'decrease') => {
    setSelectedItem(item);
    setAdjustType(type);
    setAdjustQuantity('');
    setIsAdjustStockDialogOpen(true);
  }, []);

  // Open import/export form dialog
  const openImportExportDialog = useCallback((type: 'import' | 'export') => {
    setFormType(type);
    // loaiPhieu is now computed based on formType, no need to set
    setTenPhieu('');
    setMaPhieu('');
    setSelectedItems([]);
    setSelectedItemIds(new Set());
    if (type === 'import') {
      setIsImportDialogOpen(true);
    } else {
      setIsExportDialogOpen(true);
    }
  }, []);

  // Load items for select dialog
  useEffect(() => {
    if (!isSelectItemsDialogOpen) return;

    const loadItems = async () => {
      setLoadingSelectDialog(true);
      try {
        if (selectDialogTab === 'raw') {
          const result = await rawMaterialsAPI.getAll({ page: 0, size: 200 });
          setRawMaterials(result.content || []);
        } else {
          const result = await productsAPI.getAll({ page: 0, size: 200 });
          setProducts(result.content || []);
        }
      } catch (error: any) {
        logger.error('Error loading items:', error);
        toast.error('Không thể tải danh sách');
      } finally {
        setLoadingSelectDialog(false);
      }
    };

    loadItems();
  }, [isSelectItemsDialogOpen, selectDialogTab]);

  // Memoize filtered select items to avoid recalculating on every render
  const filteredSelectItems = useMemo(() => {
    const baseItems = selectDialogTab === 'raw'
      ? rawMaterials.filter(item =>
          item.tenNguyenLieu.toLowerCase().includes(selectDialogSearch.toLowerCase())
        )
      : products.filter(item =>
          item.tenSanPham.toLowerCase().includes(selectDialogSearch.toLowerCase())
        );
    
    // Exclude items that are already in selectedItems
    return baseItems.filter(item => {
      const itemId = selectDialogTab === 'raw' ? (item as RawMaterial).id : (item as Product).id;
      return !selectedItems.some(selected => 
        selected.id === itemId && selected.type === selectDialogTab
      );
    });
  }, [selectDialogTab, rawMaterials, products, selectDialogSearch, selectedItems]);

  // Handle select items
  const handleSelectItems = useCallback(() => {
    const items = filteredSelectItems
      .filter(item => selectedItemIds.has(selectDialogTab === 'raw' ? (item as RawMaterial).id : (item as Product).id))
      .map(item => {
        if (selectDialogTab === 'raw') {
          const raw = item as RawMaterial;
          return {
            id: raw.id,
            ten: raw.tenNguyenLieu,
            donViTinh: raw.donViTinh || 'Cái',
            soLuong: '',
            type: 'raw' as const,
          };
        } else {
          const prod = item as Product;
          return {
            id: prod.id,
            ten: prod.tenSanPham,
            donViTinh: prod.donViTinh || 'Cái',
            soLuong: '',
            type: 'product' as const,
          };
        }
      });
    
    setSelectedItems(prev => [...prev, ...items]);
    setSelectedItemIds(new Set());
    setIsSelectItemsDialogOpen(false);
    setSelectDialogSearch('');
  }, [filteredSelectItems, selectedItemIds, selectDialogTab]);

  // Handle quick select all
  const handleQuickSelect = useCallback(() => {
    const allIds = new Set(filteredSelectItems.map(item =>
      selectDialogTab === 'raw' ? (item as RawMaterial).id : (item as Product).id
    ));
    setSelectedItemIds(allIds);
  }, [filteredSelectItems, selectDialogTab]);

  // Remove item from selected list
  const handleRemoveItem = useCallback((index: number) => {
    setSelectedItems(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Export Excel functions
  const handleExportTonKhoExcel = async () => {
    try {
      const blob = await rawMaterialsAPI.exportTonKhoExcel();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename with current date
      const today = new Date();
      const dateStr = today.toLocaleDateString('vi-VN').replace(/\//g, '');
      link.download = `DanhSachNguyenLieuTonKho_${dateStr}.xlsx`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Đã xuất Excel thành công!');
    } catch (error: any) {
      logger.error('Error exporting Excel:', error);
      toast.error(error.response?.data?.message || 'Không thể xuất Excel. Vui lòng thử lại.');
    }
  };

  const handleExportNhapKhoExcel = async () => {
    try {
      const blob = await rawMaterialsAPI.exportNhapKhoExcel();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename with current date
      const today = new Date();
      const dateStr = today.toLocaleDateString('vi-VN').replace(/\//g, '');
      link.download = `BangNhapKho_${dateStr}.xlsx`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Đã xuất Excel thành công!');
    } catch (error: any) {
      logger.error('Error exporting Excel:', error);
      toast.error(error.response?.data?.message || 'Không thể xuất Excel. Vui lòng thử lại.');
    }
  };

  const handleExportXuatKhoExcel = async () => {
    try {
      const blob = await rawMaterialsAPI.exportXuatKhoExcel();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename with current date
      const today = new Date();
      const dateStr = today.toLocaleDateString('vi-VN').replace(/\//g, '');
      link.download = `BangXuatKho_${dateStr}.xlsx`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Đã xuất Excel thành công!');
    } catch (error: any) {
      logger.error('Error exporting Excel:', error);
      toast.error(error.response?.data?.message || 'Không thể xuất Excel. Vui lòng thử lại.');
    }
  };

  // Handle submit import/export form
  const handleSubmitForm = async () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập');
      return;
    }

    if (selectedItems.length === 0) {
      toast.error('Vui lòng chọn ít nhất một mặt hàng/nguyên liệu');
      return;
    }

    // Validate quantities
    for (const item of selectedItems) {
      if (!item.soLuong || Number(item.soLuong) <= 0) {
        toast.error(`Vui lòng nhập số lượng cho "${item.ten}"`);
        return;
      }
    }

    try {
      if (formType === 'import') {
        // Import logic - using rawMaterialsAPI for raw materials
        const rawItems = selectedItems.filter(item => item.type === 'raw');
        const productItems = selectedItems.filter(item => item.type === 'product');

        // ✅ Gộp tất cả nguyên liệu vào 1 phiếu nhập (batch import)
        if (rawItems.length > 0) {
          await rawMaterialsAPI.batchImport({
            nhanVienId: user.id,
            items: rawItems.map(item => ({
              nguyenLieuId: item.id,
              soLuong: Number(item.soLuong),
              // Không có ghi chú riêng cho từng item, dùng ghi chú chung
            })),
            ghiChu: tenPhieu || undefined,
            maPhieu: maPhieu.trim() || undefined, // Backend tự generate nếu để trống
          });
        }

        // Import products (if using inventoryAPI)
        if (productItems.length > 0) {
          await inventoryAPI.import({
            nhaCungCapId: 1, // Default supplier ID
            chiNhanhId: user.chiNhanhId || 1,
            nhanVienId: user.id,
            items: productItems.map(item => ({
              sanPhamId: item.id,
              soLuong: Number(item.soLuong),
              donGia: 0, // Default price
              ghiChu: '',
            })),
            ghiChu: tenPhieu || undefined,
          });
        }

        toast.success('Nhập kho thành công');
      } else {
        // Export logic
        const rawItems = selectedItems.filter(item => item.type === 'raw');
        const productItems = selectedItems.filter(item => item.type === 'product');

        // ✅ Gộp tất cả nguyên liệu vào 1 phiếu xuất (batch export)
        if (rawItems.length > 0) {
          await rawMaterialsAPI.batchExport({
            nhanVienId: user.id,
            items: rawItems.map(item => ({
              nguyenLieuId: item.id,
              soLuong: Number(item.soLuong),
              // Không có ghi chú riêng cho từng item, dùng ghi chú chung
            })),
            ghiChu: tenPhieu || undefined,
            maPhieu: maPhieu.trim() || undefined, // Backend tự generate nếu để trống
          });
        }

        // Export products - Feature not implemented yet
        if (productItems.length > 0) {
          toast.info('Chức năng xuất kho sản phẩm đang được phát triển');
        }

        toast.success('Xuất kho thành công');
      }

      // Reset form
      setIsImportDialogOpen(false);
      setIsExportDialogOpen(false);
      setSelectedItems([]);
      setTenPhieu('');
      setMaPhieu('');

      // Reload all data after successful operation
      // Reload stock items if on stock tab
      if (activeMainTab === 'stock') {
        const result = await rawMaterialsAPI.getAll({ page: 0, size: 1000 });
        const rawList = result.content || [];
        const items: InventoryItem[] = rawList.map(r => {
          const tonKho = r.tonKho ?? r.soLuong ?? 0;
          let trangThai: 'CON_HANG' | 'SAP_HET' | 'HET_HANG' = 'CON_HANG';
          if (tonKho === 0) {
            trangThai = 'HET_HANG';
          } else if (r.tonKhoToiThieu && tonKho < r.tonKhoToiThieu) {
            trangThai = 'SAP_HET';
          }
          return {
            id: r.id,
            tenSanPham: r.tenNguyenLieu,
            donViTinh: r.donViTinh || 'Cái',
            slToiThieu: r.tonKhoToiThieu || 0,
            slTonCuoi: tonKho,
            trangThai,
            maSanPham: r.maNguyenLieu,
          };
        });
        setStockItems(items);
        // filteredStockItems is a useMemo, no need to set it
      }

      // Always reload import/export receipts and history after successful operation
      await loadImportReceipts();
      await loadExportReceipts();
      await loadTransactionHistory();
    } catch (error: unknown) {
      logger.error('Error submitting form:', error);
      
      // ✅ Standardized error handling với handleApiError utility
      const errorMessage = handleApiError(error, 'Không thể thực hiện thao tác');
      
      // Check error code for specific error types (if available)
      const isErrorWithResponse = (err: unknown): err is { response?: { data?: { errorCode?: string } } } => {
        return typeof err === 'object' && err !== null;
      };
      
      const errorCode = isErrorWithResponse(error) ? error.response?.data?.errorCode : undefined;
      
      // Hiển thị thông báo lỗi chi tiết
      if (errorCode === 'INSUFFICIENT_STOCK') {
        toast.error(`⚠️ Không đủ tồn kho: ${errorMessage}`);
      } else if (errorCode === 'VALIDATION_ERROR') {
        toast.error(`❌ Dữ liệu không hợp lệ: ${errorMessage}`);
      } else if (errorCode === 'RESOURCE_NOT_FOUND') {
        toast.error(`❌ Không tìm thấy: ${errorMessage}`);
      } else {
        toast.error(`❌ Lỗi: ${errorMessage}`);
      }
    }
  };

  // ✅ Delete receipt - Xóa phiếu nhập/xuất và tự động rollback tồn kho
  const handleDeleteReceipt = async (receiptId: number, loaiPhieu: 'NHAP' | 'XUAT', maPhieu: string, tenNguyenLieu: string, soLuong: number) => {
    // Confirm trước khi xóa
    const confirmMessage = loaiPhieu === 'NHAP'
      ? `Bạn có chắc muốn xóa phiếu nhập "${maPhieu}"?\n` +
        `Tồn kho của "${tenNguyenLieu}" sẽ giảm ${soLuong.toLocaleString('vi-VN')}.`
      : `Bạn có chắc muốn xóa phiếu xuất "${maPhieu}"?\n` +
        `Tồn kho của "${tenNguyenLieu}" sẽ tăng ${soLuong.toLocaleString('vi-VN')}.`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      await rawMaterialsAPI.deleteReceipt(receiptId);
      toast.success('Xóa phiếu thành công. Tồn kho đã được rollback.');
      
      // Reload danh sách
      await loadImportReceipts();
      await loadExportReceipts();
      await loadTransactionHistory();
      
      // Reload stock items nếu đang ở tab tồn kho
      if (activeMainTab === 'stock') {
        const result = await rawMaterialsAPI.getAll({ page: 0, size: 1000 });
        const rawList = result.content || [];
        const items: InventoryItem[] = rawList.map(r => {
          const tonKho = r.tonKho ?? r.soLuong ?? 0;
          let trangThai: 'CON_HANG' | 'SAP_HET' | 'HET_HANG' = 'CON_HANG';
          if (tonKho === 0) {
            trangThai = 'HET_HANG';
          } else if (r.tonKhoToiThieu && tonKho < r.tonKhoToiThieu) {
            trangThai = 'SAP_HET';
          }
          return {
            id: r.id,
            tenSanPham: r.tenNguyenLieu,
            donViTinh: r.donViTinh || 'Cái',
            slToiThieu: r.tonKhoToiThieu || 0,
            slTonCuoi: tonKho,
            trangThai,
            maSanPham: r.maNguyenLieu,
          };
        });
        setStockItems(items);
      }
    } catch (error: unknown) {
      logger.error('Error deleting receipt:', error);
      // ✅ Standardized error handling với handleApiError utility
      const errorMessage = handleApiError(error, 'Không thể xóa phiếu');
      toast.error(`❌ Lỗi: ${errorMessage}`);
    }
  };

  // Handle create raw material
  const handleCreateRawMaterial = async (data: any) => {
    try {
      await rawMaterialsAPI.create(data);
      toast.success('Thêm nguyên liệu thành công');
      setIsAddRawMaterialDialogOpen(false);
      // Reload stock items
      const result = await rawMaterialsAPI.getAll({ page: 0, size: 1000 });
        const rawList = result.content || [];
        const items: InventoryItem[] = rawList.map(r => {
          const tonKho = r.tonKho ?? r.soLuong ?? 0;
          let trangThai: 'CON_HANG' | 'SAP_HET' | 'HET_HANG' = 'CON_HANG';
          if (tonKho === 0) {
            trangThai = 'HET_HANG';
          } else if (r.tonKhoToiThieu && tonKho < r.tonKhoToiThieu) {
            trangThai = 'SAP_HET';
          }
          return {
            id: r.id,
            tenSanPham: r.tenNguyenLieu,
            donViTinh: r.donViTinh || 'Cái',
            slToiThieu: r.tonKhoToiThieu || 0,
            slTonCuoi: tonKho,
            trangThai,
            maSanPham: r.maNguyenLieu,
          };
        });
        setStockItems(items);
        // filteredStockItems is a useMemo, no need to set it
    } catch (error: any) {
      console.error('Error creating raw material:', error);
      toast.error(error.response?.data?.message || 'Không thể thêm nguyên liệu');
    }
  };

  // Handle update raw material
  const handleUpdateRawMaterial = async (id: number, data: any) => {
    try {
      await rawMaterialsAPI.update(id, data);
      toast.success('Cập nhật nguyên liệu thành công');
      setIsAddRawMaterialDialogOpen(false);
      setEditingRawMaterial(null);
      // Reload stock items
      const result = await rawMaterialsAPI.getAll({ page: 0, size: 1000 });
        const rawList = result.content || [];
        const items: InventoryItem[] = rawList.map(r => {
          const tonKho = r.tonKho ?? r.soLuong ?? 0;
          let trangThai: 'CON_HANG' | 'SAP_HET' | 'HET_HANG' = 'CON_HANG';
          if (tonKho === 0) {
            trangThai = 'HET_HANG';
          } else if (r.tonKhoToiThieu && tonKho < r.tonKhoToiThieu) {
            trangThai = 'SAP_HET';
          }
          return {
            id: r.id,
            tenSanPham: r.tenNguyenLieu,
            donViTinh: r.donViTinh || 'Cái',
            slToiThieu: r.tonKhoToiThieu || 0,
            slTonCuoi: tonKho,
            trangThai,
            maSanPham: r.maNguyenLieu,
          };
        });
        setStockItems(items);
        // filteredStockItems is a useMemo, no need to set it
    } catch (error: any) {
      console.error('Error updating raw material:', error);
      toast.error(error.response?.data?.message || 'Không thể cập nhật nguyên liệu');
    }
  };

  // Handle delete raw material
  const handleDeleteRawMaterial = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa nguyên liệu này?')) {
      return;
    }

    setDeletingRawMaterialId(id);
    try {
      await rawMaterialsAPI.delete(id);
      toast.success('Xóa nguyên liệu thành công');
      // Reload stock items
      const result = await rawMaterialsAPI.getAll({ page: 0, size: 1000 });
        const rawList = result.content || [];
        const items: InventoryItem[] = rawList.map(r => {
          const tonKho = r.tonKho ?? r.soLuong ?? 0;
          let trangThai: 'CON_HANG' | 'SAP_HET' | 'HET_HANG' = 'CON_HANG';
          if (tonKho === 0) {
            trangThai = 'HET_HANG';
          } else if (r.tonKhoToiThieu && tonKho < r.tonKhoToiThieu) {
            trangThai = 'SAP_HET';
          }
          return {
            id: r.id,
            tenSanPham: r.tenNguyenLieu,
            donViTinh: r.donViTinh || 'Cái',
            slToiThieu: r.tonKhoToiThieu || 0,
            slTonCuoi: tonKho,
            trangThai,
            maSanPham: r.maNguyenLieu,
          };
        });
        setStockItems(items);
        // filteredStockItems is a useMemo, no need to set it
    } catch (error: any) {
      console.error('Error deleting raw material:', error);
      toast.error(error.response?.data?.message || 'Không thể xóa nguyên liệu');
    } finally {
      setDeletingRawMaterialId(null);
    }
  };

  // Handle edit raw material
  const handleEditRawMaterial = async (item: InventoryItem) => {
    try {
      const rawMaterial = await rawMaterialsAPI.getById(item.id);
      setEditingRawMaterial(rawMaterial);
      setIsAddRawMaterialDialogOpen(true);
    } catch (error: any) {
      console.error('Error loading raw material:', error);
      toast.error('Không thể tải thông tin nguyên liệu');
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Nguyên liệu</h1>
        <div className="flex items-center gap-3">
          {activeMainTab === 'stock' && (
            <Button 
              className="bg-orange-500 hover:bg-orange-600 text-white"
              onClick={() => {
                setEditingRawMaterial(null);
                setIsAddRawMaterialDialogOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Thêm nguyên liệu
            </Button>
          )}
          {activeMainTab === 'import' && (
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => openImportExportDialog('import')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Thêm phiếu nhập
            </Button>
          )}
          {activeMainTab === 'export' && (
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => openImportExportDialog('export')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Thêm phiếu xuất
            </Button>
          )}
        </div>
      </div>

      {/* Main Tabs */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveMainTab('stock')}
              className={cn(
                "px-6 py-4 text-sm font-medium border-b-2 transition-colors",
                activeMainTab === 'stock'
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              )}
            >
              Danh sách tồn kho
            </button>
            <button
              onClick={() => setActiveMainTab('import')}
              className={cn(
                "px-6 py-4 text-sm font-medium border-b-2 transition-colors",
                activeMainTab === 'import'
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              )}
            >
              Nhập kho
            </button>
            <button
              onClick={() => setActiveMainTab('export')}
              className={cn(
                "px-6 py-4 text-sm font-medium border-b-2 transition-colors",
                activeMainTab === 'export'
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              )}
            >
              Xuất kho
            </button>
            <button
              onClick={() => setActiveMainTab('history')}
              className={cn(
                "px-6 py-4 text-sm font-medium border-b-2 transition-colors",
                activeMainTab === 'history'
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              )}
            >
              <div className="flex items-center gap-2">
                <History className="w-4 h-4" />
                Lịch sử
              </div>
            </button>
          </div>
        </div>

        {/* Stock List Tab */}
        {activeMainTab === 'stock' && (
          <>
            {/* Page Title */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Danh sách nguyên liệu</h2>
              <Button
                variant="outline"
                onClick={handleExportTonKhoExcel}
                className="border-gray-300"
              >
                <Download className="w-4 h-4 mr-2" />
                Xuất Excel
              </Button>
            </div>

            {/* Search and Filter */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Button variant="outline" className="border-gray-300">
                    <Filter className="w-4 h-4 mr-2" />
                    Lọc nguyên liệu
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </div>
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Tìm kiếm theo tên nguyên liệu/ mặt hàng"
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Stock Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Tên nguyên liệu</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Đơn vị</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">SL tối thiểu</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">SL tồn cuối</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Trạng thái</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Thao tác kho</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Quản lý</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-gray-500">
                        Đang tải...
                      </td>
                    </tr>
                  ) : filteredStockItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-gray-500">
                        Không có dữ liệu
                      </td>
                    </tr>
                  ) : (
                    <>
                      {filteredStockItems.map((item) => {
                        const statusBadge = getStatusBadge(item.trangThai);
                        return (
                          <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                            <td className="py-3 px-4">
                              <span className="text-sm font-medium text-gray-900">{item.tenSanPham}</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-sm text-gray-600">{item.donViTinh || 'Cái'}</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-sm text-gray-600">{item.slToiThieu || 0}</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-sm font-medium text-gray-900">{item.slTonCuoi}</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className={cn(
                                "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
                                statusBadge.color
                              )}>
                                {statusBadge.label}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => openAdjustStockDialog(item, 'decrease')}
                                  className="w-8 h-8 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center transition-colors"
                                  title="Giảm tồn kho"
                                  aria-label={`Giảm tồn kho cho ${item.tenSanPham}`}
                                >
                                  <Minus className="w-4 h-4 text-red-600" />
                                </button>
                                <button
                                  onClick={() => openAdjustStockDialog(item, 'increase')}
                                  className="w-8 h-8 rounded-full bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-colors"
                                  title="Tăng tồn kho"
                                  aria-label={`Tăng tồn kho cho ${item.tenSanPham}`}
                                >
                                  <Plus className="w-4 h-4 text-blue-600" />
                                </button>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => handleEditRawMaterial(item)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Chỉnh sửa"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteRawMaterial(item.id)}
                                  disabled={deletingRawMaterialId === item.id}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                  title="Xóa"
                                >
                                  {deletingRawMaterialId === item.id ? (
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {/* Total Row */}
                      <tr className="bg-gray-50 font-semibold">
                        <td colSpan={3} className="py-3 px-4 text-sm text-gray-900">
                          TỔNG CỘNG
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900">
                          {totalStock.toLocaleString('vi-VN')}
                        </td>
                        <td colSpan={3}></td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Import Receipts Tab */}
        {activeMainTab === 'import' && (
          <>
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Danh sách phiếu nhập kho</h2>
              <Button
                variant="outline"
                onClick={handleExportNhapKhoExcel}
                className="border-gray-300"
              >
                <Download className="w-4 h-4 mr-2" />
                Xuất Excel
              </Button>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
              <div className="flex px-4">
                <button className="px-4 py-3 text-sm font-medium border-b-2 border-orange-500 text-orange-600">
                  Tất cả phiếu nhập
                </button>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-4">
                <Button variant="outline" className="border-gray-300">
                  <Filter className="w-4 h-4 mr-2" />
                  Lọc phiếu nhập kho
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Tìm kiếm theo Mã phiếu hoặc Tên phiếu"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Import Receipts Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Ngày giờ</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Mã phiếu</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Nguyên liệu</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Mã NL</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Số lượng</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Nhân viên</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Ghi chú</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {groupedImportReceipts.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-gray-500">
                        Chưa có phiếu nhập kho nào
                      </td>
                    </tr>
                  ) : (
                    groupedImportReceipts.map((groupedReceipt) => {
                      const formatDateTime = (dateString: string) => {
                        try {
                          const date = new Date(dateString);
                          return date.toLocaleString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          });
                        } catch {
                          return dateString;
                        }
                      };
                      
                      const firstItem = groupedReceipt.items[0];
                      
                      return (
                        <React.Fragment key={groupedReceipt.maPhieu}>
                          {groupedReceipt.items.map((item, itemIndex) => (
                            <tr key={`${groupedReceipt.maPhieu}-${item.id}`} className="hover:bg-gray-50">
                              {/* Ngày giờ - chỉ hiển thị ở dòng đầu tiên */}
                              {itemIndex === 0 && (
                                <td rowSpan={groupedReceipt.items.length} className="py-3 px-4 text-sm text-gray-900 align-top">
                                  {formatDateTime(groupedReceipt.ngayNhapXuat)}
                                </td>
                              )}
                              
                              {/* Mã phiếu - chỉ hiển thị ở dòng đầu tiên */}
                              {itemIndex === 0 && (
                                <td rowSpan={groupedReceipt.items.length} className="py-3 px-4 align-top">
                                  <button
                                    onClick={() => navigate(`/inventory/receipts/import/${firstItem.id}`)}
                                    className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                                  >
                                    {groupedReceipt.maPhieu}
                                  </button>
                                </td>
                              )}
                              
                              {/* Nguyên liệu */}
                              <td className="py-3 px-4 text-sm text-gray-900">{item.tenNguyenLieu}</td>
                              
                              {/* Mã NL */}
                              <td className="py-3 px-4 text-sm text-gray-600">{item.maNguyenLieu}</td>
                              
                              {/* Số lượng */}
                              <td className="py-3 px-4 text-sm text-gray-900">{item.soLuong.toLocaleString('vi-VN')}</td>
                              
                              {/* Nhân viên - chỉ hiển thị ở dòng đầu tiên */}
                              {itemIndex === 0 && (
                                <td rowSpan={groupedReceipt.items.length} className="py-3 px-4 text-sm text-gray-600 align-top">
                                  {groupedReceipt.tenNhanVien}
                                </td>
                              )}
                              
                              {/* Ghi chú - chỉ hiển thị ở dòng đầu tiên */}
                              {itemIndex === 0 && (
                                <td rowSpan={groupedReceipt.items.length} className="py-3 px-4 text-sm text-gray-500 align-top">
                                  {groupedReceipt.ghiChu || '-'}
                                </td>
                              )}
                              
                              {/* Thao tác - chỉ hiển thị ở dòng đầu tiên */}
                              {itemIndex === 0 && (
                                <td rowSpan={groupedReceipt.items.length} className="py-3 px-4 align-top">
                                  <button
                                    onClick={async () => {
                                      // Xóa tất cả items trong phiếu
                                      const confirmMessage = `Bạn có chắc muốn xóa phiếu nhập "${groupedReceipt.maPhieu}"?\n` +
                                        `Phiếu này có ${groupedReceipt.items.length} nguyên liệu. Tồn kho sẽ được giảm lại.`;
                                      
                                      if (!window.confirm(confirmMessage)) {
                                        return;
                                      }
                                      
                                      try {
                                        // Xóa từng item (hoặc có thể backend hỗ trợ xóa toàn bộ phiếu)
                                        for (const item of groupedReceipt.items) {
                                          await rawMaterialsAPI.deleteReceipt(item.id);
                                        }
                                        toast.success('Xóa phiếu thành công. Tồn kho đã được rollback.');
                                        
                                        // Reload danh sách
                                        await loadImportReceipts();
                                        await loadExportReceipts();
                                        await loadTransactionHistory();
                                        
                                        // Reload stock items nếu đang ở tab tồn kho
                                        if (activeMainTab === 'stock') {
                                          const result = await rawMaterialsAPI.getAll({ page: 0, size: 1000 });
                                          const rawList = result.content || [];
                                          const items: InventoryItem[] = rawList.map(r => {
                                            const tonKho = r.tonKho ?? r.soLuong ?? 0;
                                            let trangThai: 'CON_HANG' | 'SAP_HET' | 'HET_HANG' = 'CON_HANG';
                                            if (tonKho === 0) {
                                              trangThai = 'HET_HANG';
                                            } else if (r.tonKhoToiThieu && tonKho < r.tonKhoToiThieu) {
                                              trangThai = 'SAP_HET';
                                            }
                                            return {
                                              id: r.id,
                                              tenSanPham: r.tenNguyenLieu,
                                              donViTinh: r.donViTinh || 'Cái',
                                              slToiThieu: r.tonKhoToiThieu || 0,
                                              slTonCuoi: tonKho,
                                              trangThai,
                                              maSanPham: r.maNguyenLieu,
                                            };
                                          });
                                          setStockItems(items);
                                        }
                                      } catch (error: any) {
                                        console.error('Error deleting receipt:', error);
                                        const errorMessage = error.response?.data?.message || error.message || 'Không thể xóa phiếu';
                                        toast.error(`❌ Lỗi: ${errorMessage}`);
                                      }
                                    }}
                                    className="text-red-600 hover:text-red-800 hover:underline text-sm font-medium"
                                    title="Xóa phiếu nhập"
                                  >
                                    <Trash2 className="w-4 h-4 inline mr-1" />
                                    Xóa
                                  </button>
                                </td>
                              )}
                            </tr>
                          ))}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Export Receipts Tab */}
        {activeMainTab === 'export' && (
          <>
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Danh sách phiếu xuất kho</h2>
              <Button
                variant="outline"
                onClick={handleExportXuatKhoExcel}
                className="border-gray-300"
              >
                <Download className="w-4 h-4 mr-2" />
                Xuất Excel
              </Button>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
              <div className="flex px-4">
                <button className="px-4 py-3 text-sm font-medium border-b-2 border-orange-500 text-orange-600">
                  Tất cả phiếu xuất
                </button>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-4">
                <Button variant="outline" className="border-gray-300">
                  <Filter className="w-4 h-4 mr-2" />
                  Lọc phiếu xuất kho
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Tìm kiếm theo Mã phiếu hoặc Tên phiếu"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Export Receipts Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      <input type="checkbox" className="w-4 h-4" />
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Ngày giờ</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Mã phiếu</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Nguyên liệu</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Mã NL</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Số lượng</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Nhân viên</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Ghi chú</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {groupedExportReceipts.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-gray-500">
                        Chưa có phiếu xuất kho nào
                      </td>
                    </tr>
                  ) : (
                    groupedExportReceipts.map((groupedReceipt) => {
                      const formatDateTime = (dateString: string) => {
                        try {
                          const date = new Date(dateString);
                          return date.toLocaleString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          });
                        } catch {
                          return dateString;
                        }
                      };
                      
                      const firstItem = groupedReceipt.items[0];
                      
                      return (
                        <React.Fragment key={groupedReceipt.maPhieu}>
                          {groupedReceipt.items.map((item, itemIndex) => (
                            <tr key={`${groupedReceipt.maPhieu}-${item.id}`} className="hover:bg-gray-50">
                              {/* Checkbox - chỉ hiển thị ở dòng đầu tiên */}
                              {itemIndex === 0 && (
                                <td rowSpan={groupedReceipt.items.length} className="py-3 px-4 align-top">
                                  <input type="checkbox" className="w-4 h-4" />
                                </td>
                              )}
                              
                              {/* Ngày giờ - chỉ hiển thị ở dòng đầu tiên */}
                              {itemIndex === 0 && (
                                <td rowSpan={groupedReceipt.items.length} className="py-3 px-4 text-sm text-gray-900 align-top">
                                  {formatDateTime(groupedReceipt.ngayNhapXuat)}
                                </td>
                              )}
                              
                              {/* Mã phiếu - chỉ hiển thị ở dòng đầu tiên */}
                              {itemIndex === 0 && (
                                <td rowSpan={groupedReceipt.items.length} className="py-3 px-4 align-top">
                                  <button
                                    onClick={() => navigate(`/inventory/receipts/export/${firstItem.id}`)}
                                    className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                                  >
                                    {groupedReceipt.maPhieu}
                                  </button>
                                </td>
                              )}
                              
                              {/* Nguyên liệu */}
                              <td className="py-3 px-4 text-sm text-gray-900">{item.tenNguyenLieu}</td>
                              
                              {/* Mã NL */}
                              <td className="py-3 px-4 text-sm text-gray-600">{item.maNguyenLieu}</td>
                              
                              {/* Số lượng */}
                              <td className="py-3 px-4 text-sm text-gray-900">{item.soLuong.toLocaleString('vi-VN')}</td>
                              
                              {/* Nhân viên - chỉ hiển thị ở dòng đầu tiên */}
                              {itemIndex === 0 && (
                                <td rowSpan={groupedReceipt.items.length} className="py-3 px-4 text-sm text-gray-600 align-top">
                                  {groupedReceipt.tenNhanVien}
                                </td>
                              )}
                              
                              {/* Ghi chú - chỉ hiển thị ở dòng đầu tiên */}
                              {itemIndex === 0 && (
                                <td rowSpan={groupedReceipt.items.length} className="py-3 px-4 text-sm text-gray-500 align-top">
                                  {groupedReceipt.ghiChu || '-'}
                                </td>
                              )}
                              
                              {/* Thao tác - chỉ hiển thị ở dòng đầu tiên */}
                              {itemIndex === 0 && (
                                <td rowSpan={groupedReceipt.items.length} className="py-3 px-4 align-top">
                                  <button
                                    onClick={async () => {
                                      // Xóa tất cả items trong phiếu
                                      const confirmMessage = `Bạn có chắc muốn xóa phiếu xuất "${groupedReceipt.maPhieu}"?\n` +
                                        `Phiếu này có ${groupedReceipt.items.length} nguyên liệu. Tồn kho sẽ được tăng lại.`;
                                      
                                      if (!window.confirm(confirmMessage)) {
                                        return;
                                      }
                                      
                                      try {
                                        // Xóa từng item (hoặc có thể backend hỗ trợ xóa toàn bộ phiếu)
                                        for (const item of groupedReceipt.items) {
                                          await rawMaterialsAPI.deleteReceipt(item.id);
                                        }
                                        toast.success('Xóa phiếu thành công. Tồn kho đã được rollback.');
                                        
                                        // Reload danh sách
                                        await loadImportReceipts();
                                        await loadExportReceipts();
                                        await loadTransactionHistory();
                                        
                                        // Reload stock items nếu đang ở tab tồn kho
                                        if (activeMainTab === 'stock') {
                                          const result = await rawMaterialsAPI.getAll({ page: 0, size: 1000 });
                                          const rawList = result.content || [];
                                          const items: InventoryItem[] = rawList.map(r => {
                                            const tonKho = r.tonKho ?? r.soLuong ?? 0;
                                            let trangThai: 'CON_HANG' | 'SAP_HET' | 'HET_HANG' = 'CON_HANG';
                                            if (tonKho === 0) {
                                              trangThai = 'HET_HANG';
                                            } else if (r.tonKhoToiThieu && tonKho < r.tonKhoToiThieu) {
                                              trangThai = 'SAP_HET';
                                            }
                                            return {
                                              id: r.id,
                                              tenSanPham: r.tenNguyenLieu,
                                              donViTinh: r.donViTinh || 'Cái',
                                              slToiThieu: r.tonKhoToiThieu || 0,
                                              slTonCuoi: tonKho,
                                              trangThai,
                                              maSanPham: r.maNguyenLieu,
                                            };
                                          });
                                          setStockItems(items);
                                        }
                                      } catch (error: any) {
                                        console.error('Error deleting receipt:', error);
                                        const errorMessage = error.response?.data?.message || error.message || 'Không thể xóa phiếu';
                                        toast.error(`❌ Lỗi: ${errorMessage}`);
                                      }
                                    }}
                                    className="text-red-600 hover:text-red-800 hover:underline text-sm font-medium"
                                    title="Xóa phiếu xuất"
                                  >
                                    <Trash2 className="w-4 h-4 inline mr-1" />
                                    Xóa
                                  </button>
                                </td>
                              )}
                            </tr>
                          ))}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* History Tab */}
        {activeMainTab === 'history' && (
          <>
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Lịch sử</h2>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Tìm kiếm theo tên nguyên liệu/ mặt hàng"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Transaction History Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Thời gian</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Nguyên liệu / Mặt hàng</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Hành động</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Tham chiếu</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Thay đổi</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Còn lại</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-500">
                        Chưa có giao dịch nào
                      </td>
                    </tr>
                  ) : (
                    transactions.map((transaction) => {
                      const formatDateTime = (dateString: string) => {
                        try {
                          const date = new Date(dateString);
                          return date.toLocaleString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          });
                        } catch {
                          return dateString;
                        }
                      };
                      
                      // Sử dụng getter methods từ DTO nếu có, fallback về field cũ
                      const thoiGian = transaction.thoiGian || transaction.ngayNhapXuat;
                      const tenNguyenLieuHienThi = transaction.tenNguyenLieuHienThi || 
                        `${transaction.tenNguyenLieu} (${transaction.maNguyenLieu})`;
                      const hanhDong = transaction.hanhDong || 
                        (transaction.loaiPhieu === 'NHAP' ? 'Nhập' : 
                         transaction.loaiPhieu === 'XUAT' ? 'Xuất' : 'Điều chỉnh');
                      const thamChieu = transaction.thamChieu || transaction.maPhieu;
                      const thayDoi = transaction.thayDoi || 
                        (transaction.loaiPhieu === 'NHAP' ? `+${transaction.soLuong}` :
                         transaction.loaiPhieu === 'XUAT' ? `-${transaction.soLuong}` :
                         transaction.soLuongTruoc !== undefined ? 
                           `${transaction.soLuongTruoc} → ${transaction.soLuong}` : 
                           `${transaction.soLuong}`);
                      const conLai = transaction.conLai ?? transaction.soLuongConLai ?? transaction.soLuong;
                      
                      // Xác định màu sắc cho thay đổi
                      const getThayDoiColor = () => {
                        if (transaction.loaiPhieu === 'NHAP') return 'text-green-600';
                        if (transaction.loaiPhieu === 'XUAT') return 'text-red-600';
                        return 'text-blue-600';
                      };
                      
                      return (
                        <tr key={transaction.id} className="hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm text-gray-900">{formatDateTime(thoiGian)}</td>
                          <td className="py-3 px-4 text-sm text-gray-900">{tenNguyenLieuHienThi}</td>
                          <td className="py-3 px-4">
                            <span className={cn(
                              "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
                              transaction.loaiPhieu === 'NHAP'
                                ? "bg-green-100 text-green-800"
                                : transaction.loaiPhieu === 'XUAT'
                                ? "bg-red-100 text-red-800"
                                : "bg-blue-100 text-blue-800"
                            )}>
                              {hanhDong}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">{thamChieu}</td>
                          <td className="py-3 px-4">
                            <span className={cn("text-sm font-semibold", getThayDoiColor())}>
                              {thayDoi}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-900">
                            {conLai !== undefined && conLai !== null ? conLai.toLocaleString('vi-VN') : '-'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Adjust Stock Dialog */}
      <Dialog open={isAdjustStockDialogOpen} onOpenChange={setIsAdjustStockDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {adjustType === 'increase' ? 'Nhập kho' : 'Xuất kho'}
            </DialogTitle>
          </DialogHeader>

          {selectedItem && (
            <div className="space-y-4 mt-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Nguyên liệu / Mặt hàng</p>
                <p className="font-semibold text-gray-900">{selectedItem.tenSanPham}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Tồn kho hiện tại: <span className="font-medium">{selectedItem.slTonCuoi}</span> {selectedItem.donViTinh}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Số lượng {adjustType === 'increase' ? 'nhập' : 'xuất'}</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={adjustQuantity}
                  onChange={(e) => setAdjustQuantity(e.target.value)}
                  min="1"
                />
              </div>

              {adjustQuantity && Number(adjustQuantity) > 0 && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-600 mb-1">
                    Tồn kho sau {adjustType === 'increase' ? 'nhập' : 'xuất'}:
                  </p>
                  <p className="text-lg font-bold text-blue-900">
                    {adjustType === 'increase' 
                      ? selectedItem.slTonCuoi + Number(adjustQuantity)
                      : Math.max(0, selectedItem.slTonCuoi - Number(adjustQuantity))
                    } {selectedItem.donViTinh}
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsAdjustStockDialogOpen(false)}
                >
                  Hủy
                </Button>
                <Button
                  className={cn(
                    "flex-1",
                    adjustType === 'increase' 
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-red-600 hover:bg-red-700"
                  )}
                  onClick={handleAdjustStock}
                  disabled={!adjustQuantity || Number(adjustQuantity) <= 0}
                >
                  Xác nhận
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Import/Export Form Dialog */}
      <Dialog open={isImportDialogOpen || isExportDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsImportDialogOpen(false);
          setIsExportDialogOpen(false);
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {formType === 'import' ? 'Tạo phiếu nhập kho' : 'Tạo phiếu xuất kho'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Loại phiếu section */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Loại phiếu</Label>
                <Input
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  value={formType === 'import' ? 'Phiếu nhập' : 'Phiếu xuất'}
                  disabled
                  readOnly
                />
              </div>
              <div className="space-y-2">
                <Label>Tên phiếu</Label>
                <Input
                  placeholder="Nhập tên phiếu"
                  value={tenPhieu}
                  onChange={(e) => setTenPhieu(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Mã phiếu</Label>
                <Input
                  placeholder="Mã sinh tự động nếu để trống"
                  value={maPhieu}
                  onChange={(e) => setMaPhieu(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>File chứng từ</Label>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Tải file chứng từ
                </Button>
              </div>
            </div>

            {/* Thông tin mặt hàng, nguyên liệu section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Thông tin mặt hàng, nguyên liệu</h3>
              
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Tìm mặt hàng / nguyên liệu"
                    className="pl-10"
                    onFocus={() => setIsSelectItemsDialogOpen(true)}
                  />
                </div>
                <Button onClick={() => setIsSelectItemsDialogOpen(true)}>
                  Tìm kiếm
                </Button>
              </div>

              {/* Selected items table */}
              {selectedItems.length > 0 ? (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Tên mặt hàng / nguyên liệu</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Đơn vị</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Số lượng</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {selectedItems.map((item, index) => (
                        <tr key={`${item.type}-${item.id}-${index}`} className="hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm text-gray-900">{item.ten}</td>
                          <td className="py-3 px-4">
                            <select
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              value={item.donViTinh}
                              onChange={(e) => {
                                const updated = [...selectedItems];
                                updated[index].donViTinh = e.target.value;
                                setSelectedItems(updated);
                              }}
                            >
                              <option value="Cái">Cái</option>
                              <option value="Chai">Chai</option>
                              <option value="Lon">Lon</option>
                              <option value="Gói">Gói</option>
                              <option value="Hộp">Hộp</option>
                              <option value="Ly">Ly</option>
                              <option value="Kg">Kg</option>
                              <option value="Lít">Lít</option>
                            </select>
                          </td>
                          <td className="py-3 px-4">
                            <Input
                              type="number"
                              placeholder="Nhập số lượng"
                              className="w-full"
                              value={item.soLuong}
                              onChange={(e) => {
                                const updated = [...selectedItems];
                                updated[index].soLuong = e.target.value;
                                setSelectedItems(updated);
                              }}
                              min="1"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => handleRemoveItem(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="border border-gray-200 rounded-lg p-8 text-center text-gray-500">
                  Chọn mặt hàng / nguyên liệu {formType === 'import' ? 'nhập' : 'xuất'} kho
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setIsImportDialogOpen(false);
                  setIsExportDialogOpen(false);
                }}
              >
                Hủy
              </Button>
              <Button
                variant="outline"
                className="text-blue-600 border-blue-600 hover:bg-blue-50"
              >
                Đặt hàng
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleSubmitForm}
              >
                {formType === 'import' ? 'Đặt hàng & Nhập kho' : 'Xuất kho'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Select Items Dialog */}
      <Dialog open={isSelectItemsDialogOpen} onOpenChange={setIsSelectItemsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Chọn nguyên liệu, mặt hàng</DialogTitle>
          </DialogHeader>

          <div className="flex-1 flex flex-col space-y-4 mt-4">
            {/* Tabs */}
            <div className="flex items-center justify-between border-b">
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setSelectDialogTab('raw');
                    setSelectedItemIds(new Set());
                  }}
                  className={cn(
                    "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                    selectDialogTab === 'raw'
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  )}
                >
                  Nguyên liệu
                </button>
                <button
                  onClick={() => {
                    setSelectDialogTab('product');
                    setSelectedItemIds(new Set());
                  }}
                  className={cn(
                    "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                    selectDialogTab === 'product'
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  )}
                >
                  Mặt hàng
                </button>
              </div>
              <button
                onClick={handleQuickSelect}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Chọn nhanh
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Tìm kiếm..."
                className="pl-10"
                value={selectDialogSearch}
                onChange={(e) => setSelectDialogSearch(e.target.value)}
              />
              {selectDialogSearch && (
                <button
                  onClick={() => setSelectDialogSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Items list */}
            <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg">
              <div className="p-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                  {selectDialogTab === 'raw' ? 'Nguyên liệu' : 'Mặt hàng'}
                </h4>
                {loadingSelectDialog ? (
                  <div className="text-center py-8 text-gray-500">Đang tải...</div>
                ) : filteredSelectItems.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">Không có dữ liệu</div>
                ) : (
                  <div className="space-y-2">
                    {filteredSelectItems.map((item) => {
                      const itemId = selectDialogTab === 'raw' ? (item as RawMaterial).id : (item as Product).id;
                      const itemName = selectDialogTab === 'raw' ? (item as RawMaterial).tenNguyenLieu : (item as Product).tenSanPham;
                      const isSelected = selectedItemIds.has(itemId);
                      
                      return (
                        <label
                          key={itemId}
                          className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              const newSet = new Set(selectedItemIds);
                              if (e.target.checked) {
                                newSet.add(itemId);
                              } else {
                                newSet.delete(itemId);
                              }
                              setSelectedItemIds(newSet);
                            }}
                            className="w-4 h-4 text-blue-600 rounded"
                          />
                          <span className="text-sm text-gray-900">{itemName}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t">
              <span className="text-sm text-gray-600">
                Đã chọn {selectedItemIds.size}/200 mặt hàng, nguyên liệu
              </span>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsSelectItemsDialogOpen(false);
                    setSelectedItemIds(new Set());
                    setSelectDialogSearch('');
                  }}
                >
                  Hủy
                </Button>
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={handleSelectItems}
                  disabled={selectedItemIds.size === 0}
                >
                  Chọn
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Raw Material Dialog */}
      <AddRawMaterialDialog
        open={isAddRawMaterialDialogOpen}
        onClose={() => {
          setIsAddRawMaterialDialogOpen(false);
          setEditingRawMaterial(null);
        }}
        onSave={editingRawMaterial ? (data) => handleUpdateRawMaterial(editingRawMaterial.id, data) : handleCreateRawMaterial}
        editingMaterial={editingRawMaterial}
      />
    </div>
  );
}
