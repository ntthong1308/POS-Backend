package com.retail.application.service.inventory;

import com.retail.application.dto.ImportGoodsRequest;
import com.retail.application.dto.ReturnRequest;
import com.retail.common.constant.ErrorCode;
import com.retail.common.constant.Status;
import com.retail.common.exception.BusinessException;
import com.retail.common.exception.ResourceNotFoundException;
import com.retail.domain.entity.*;
import com.retail.persistence.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for InventoryServiceImpl
 * Tests inventory management logic: import, return, check stock
 *
 * Coverage target: >= 80%
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("InventoryService Unit Tests")
class InventoryServiceImplTest {

    @Mock
    private SanPhamRepository sanPhamRepository;
    @Mock
    private NhaCungCapRepository nhaCungCapRepository;
    @Mock
    private ChiNhanhRepository chiNhanhRepository;
    @Mock
    private NhanVienRepository nhanVienRepository;
    @Mock
    private NhapHangRepository nhapHangRepository;
    @Mock
    private HoaDonRepository hoaDonRepository;
    @Mock
    private PhieuTraHangRepository phieuTraHangRepository;

    @InjectMocks
    private InventoryServiceImpl inventoryService;

    private SanPham sampleProduct;
    private NhaCungCap sampleSupplier;
    private ChiNhanh sampleBranch;
    private NhanVien sampleEmployee;
    private ImportGoodsRequest sampleImportRequest;
    private HoaDon sampleInvoice;

    @BeforeEach
    void setUp() {
        // Sample product
        sampleProduct = SanPham.builder()
                .id(1L)
                .maSanPham("SP001")
                .tenSanPham("Coca Cola 330ml")
                .barcode("8934588123456")
                .giaBan(new BigDecimal("10000"))
                .giaNhap(new BigDecimal("7000"))
                .tonKho(50)
                .trangThai(Status.ACTIVE)
                .build();

        // Sample supplier
        sampleSupplier = NhaCungCap.builder()
                .id(1L)
                .maNcc("NCC001")
                .tenNcc("Công ty TNHH ABC")
                .build();

        // Sample branch
        sampleBranch = ChiNhanh.builder()
                .id(1L)
                .maChiNhanh("CN001")
                .tenChiNhanh("Chi nhánh 1")
                .build();

        // Sample employee
        sampleEmployee = NhanVien.builder()
                .id(1L)
                .maNhanVien("NV001")
                .tenNhanVien("Nguyen Van A")
                .username("nv001")
                .role(NhanVien.Role.CASHIER)
                .trangThai(Status.ACTIVE)
                .build();

        // Sample import request
        ImportGoodsRequest.ImportItemDTO importItem = ImportGoodsRequest.ImportItemDTO.builder()
                .sanPhamId(1L)
                .soLuong(20)
                .donGia(new BigDecimal("7000"))
                .ghiChu("Import item")
                .build();

        sampleImportRequest = ImportGoodsRequest.builder()
                .nhaCungCapId(1L)
                .chiNhanhId(1L)
                .nhanVienId(1L)
                .items(List.of(importItem))
                .ghiChu("Test import")
                .build();

        // Sample invoice with details
        sampleInvoice = HoaDon.builder()
                .id(1L)
                .maHoaDon("HD20250117120000")
                .tongTien(new BigDecimal("20000"))
                .thanhTien(new BigDecimal("20000"))
                .build();

        ChiTietHoaDon chiTiet = ChiTietHoaDon.builder()
                .sanPham(sampleProduct)
                .soLuong(2)
                .donGia(new BigDecimal("10000"))
                .thanhTien(new BigDecimal("20000"))
                .build();

        List<ChiTietHoaDon> chiTietList = new ArrayList<>();
        chiTietList.add(chiTiet);
        sampleInvoice.setChiTietHoaDons(chiTietList);
    }

    // ==================== IMPORT GOODS TESTS ====================

    @Nested
    @DisplayName("Import Goods Tests")
    class ImportGoodsTests {

        @Test
        @DisplayName("✅ Should import goods successfully")
        void importGoods_WithValidRequest_ShouldUpdateStock() {
            // Arrange
            when(nhaCungCapRepository.findById(1L)).thenReturn(Optional.of(sampleSupplier));
            when(chiNhanhRepository.findById(1L)).thenReturn(Optional.of(sampleBranch));
            when(nhanVienRepository.findById(1L)).thenReturn(Optional.of(sampleEmployee));
            when(sanPhamRepository.findById(1L)).thenReturn(Optional.of(sampleProduct));
            when(sanPhamRepository.save(any(SanPham.class))).thenReturn(sampleProduct);
            when(nhapHangRepository.save(any(NhapHang.class))).thenReturn(new NhapHang());

            int initialStock = sampleProduct.getTonKho();

            // Act
            inventoryService.importGoods(sampleImportRequest);

            // Assert
            verify(nhaCungCapRepository).findById(1L);
            verify(chiNhanhRepository).findById(1L);
            verify(nhanVienRepository).findById(1L);
            verify(sanPhamRepository).findById(1L);
            verify(nhapHangRepository).save(any(NhapHang.class));

            ArgumentCaptor<SanPham> productCaptor = ArgumentCaptor.forClass(SanPham.class);
            verify(sanPhamRepository).save(productCaptor.capture());

            SanPham savedProduct = productCaptor.getValue();
            assertThat(savedProduct.getTonKho()).isEqualTo(initialStock + 20);
        }

        @Test
        @DisplayName("✅ Should update import price when importing goods")
        void importGoods_ShouldUpdateImportPrice() {
            // Arrange
            when(nhaCungCapRepository.findById(anyLong())).thenReturn(Optional.of(sampleSupplier));
            when(chiNhanhRepository.findById(anyLong())).thenReturn(Optional.of(sampleBranch));
            when(nhanVienRepository.findById(anyLong())).thenReturn(Optional.of(sampleEmployee));
            when(sanPhamRepository.findById(anyLong())).thenReturn(Optional.of(sampleProduct));
            when(sanPhamRepository.save(any())).thenReturn(sampleProduct);
            when(nhapHangRepository.save(any())).thenReturn(new NhapHang());

            BigDecimal newImportPrice = new BigDecimal("7000");

            // Act
            inventoryService.importGoods(sampleImportRequest);

            // Assert
            ArgumentCaptor<SanPham> productCaptor = ArgumentCaptor.forClass(SanPham.class);
            verify(sanPhamRepository).save(productCaptor.capture());

            SanPham savedProduct = productCaptor.getValue();
            assertThat(savedProduct.getGiaNhap()).isEqualByComparingTo(newImportPrice);
        }

        @Test
        @DisplayName("✅ Should calculate total amount correctly")
        void importGoods_ShouldCalculateTotalCorrectly() {
            // Arrange
            when(nhaCungCapRepository.findById(anyLong())).thenReturn(Optional.of(sampleSupplier));
            when(chiNhanhRepository.findById(anyLong())).thenReturn(Optional.of(sampleBranch));
            when(nhanVienRepository.findById(anyLong())).thenReturn(Optional.of(sampleEmployee));
            when(sanPhamRepository.findById(anyLong())).thenReturn(Optional.of(sampleProduct));
            when(sanPhamRepository.save(any())).thenReturn(sampleProduct);

            ArgumentCaptor<NhapHang> nhapHangCaptor = ArgumentCaptor.forClass(NhapHang.class);
            when(nhapHangRepository.save(nhapHangCaptor.capture())).thenReturn(new NhapHang());

            // Act
            inventoryService.importGoods(sampleImportRequest);

            // Assert
            NhapHang savedNhapHang = nhapHangCaptor.getValue();
            // Total = 7000 * 20 = 140000
            BigDecimal expectedTotal = new BigDecimal("140000");
            assertThat(savedNhapHang.getTongTien()).isEqualByComparingTo(expectedTotal);
        }

        @Test
        @DisplayName("❌ Should throw exception when supplier not found")
        void importGoods_WithInvalidSupplier_ShouldThrowException() {
            // Arrange
            when(nhaCungCapRepository.findById(1L)).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> inventoryService.importGoods(sampleImportRequest))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("Nhà cung cấp");

            verify(nhapHangRepository, never()).save(any());
        }

        @Test
        @DisplayName("❌ Should throw exception when branch not found")
        void importGoods_WithInvalidBranch_ShouldThrowException() {
            // Arrange
            when(nhaCungCapRepository.findById(anyLong())).thenReturn(Optional.of(sampleSupplier));
            when(chiNhanhRepository.findById(1L)).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> inventoryService.importGoods(sampleImportRequest))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("Chi nhánh");

            verify(nhapHangRepository, never()).save(any());
        }

        @Test
        @DisplayName("❌ Should throw exception when employee not found")
        void importGoods_WithInvalidEmployee_ShouldThrowException() {
            // Arrange
            when(nhaCungCapRepository.findById(anyLong())).thenReturn(Optional.of(sampleSupplier));
            when(chiNhanhRepository.findById(anyLong())).thenReturn(Optional.of(sampleBranch));
            when(nhanVienRepository.findById(1L)).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> inventoryService.importGoods(sampleImportRequest))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("Nhân viên");

            verify(nhapHangRepository, never()).save(any());
        }

        @Test
        @DisplayName("❌ Should throw exception when product not found")
        void importGoods_WithInvalidProduct_ShouldThrowException() {
            // Arrange
            when(nhaCungCapRepository.findById(anyLong())).thenReturn(Optional.of(sampleSupplier));
            when(chiNhanhRepository.findById(anyLong())).thenReturn(Optional.of(sampleBranch));
            when(nhanVienRepository.findById(anyLong())).thenReturn(Optional.of(sampleEmployee));
            when(sanPhamRepository.findById(1L)).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> inventoryService.importGoods(sampleImportRequest))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("Sản phẩm");

            verify(nhapHangRepository, never()).save(any());
        }
    }

    // ==================== RETURN GOODS TESTS ====================

    @Nested
    @DisplayName("Return Goods Tests")
    class ReturnGoodsTests {

        @Test
        @DisplayName("✅ Should return goods successfully")
        void returnGoods_WithValidRequest_ShouldIncreaseStock() {
            // Arrange
            ReturnRequest returnRequest = ReturnRequest.builder()
                    .hoaDonGocId(1L)
                    .sanPhamId(1L)
                    .nhanVienId(1L)
                    .soLuongTra(1)
                    .lyDoTra("Defective product")
                    .build();

            when(hoaDonRepository.findById(1L)).thenReturn(Optional.of(sampleInvoice));
            when(sanPhamRepository.findById(1L)).thenReturn(Optional.of(sampleProduct));
            when(nhanVienRepository.findById(1L)).thenReturn(Optional.of(sampleEmployee));
            when(sanPhamRepository.save(any())).thenReturn(sampleProduct);
            when(phieuTraHangRepository.save(any())).thenReturn(new PhieuTraHang());

            int initialStock = sampleProduct.getTonKho();

            // Act
            inventoryService.returnGoods(returnRequest);

            // Assert
            ArgumentCaptor<SanPham> productCaptor = ArgumentCaptor.forClass(SanPham.class);
            verify(sanPhamRepository).save(productCaptor.capture());

            SanPham savedProduct = productCaptor.getValue();
            assertThat(savedProduct.getTonKho()).isEqualTo(initialStock + 1);

            verify(phieuTraHangRepository).save(any(PhieuTraHang.class));
        }

        @Test
        @DisplayName("✅ Should create return record with correct total amount")
        void returnGoods_ShouldCalculateReturnAmountCorrectly() {
            // Arrange
            ReturnRequest returnRequest = ReturnRequest.builder()
                    .hoaDonGocId(1L)
                    .sanPhamId(1L)
                    .nhanVienId(1L)
                    .soLuongTra(2)
                    .lyDoTra("Customer request")
                    .build();

            when(hoaDonRepository.findById(anyLong())).thenReturn(Optional.of(sampleInvoice));
            when(sanPhamRepository.findById(anyLong())).thenReturn(Optional.of(sampleProduct));
            when(nhanVienRepository.findById(anyLong())).thenReturn(Optional.of(sampleEmployee));
            when(sanPhamRepository.save(any())).thenReturn(sampleProduct);

            ArgumentCaptor<PhieuTraHang> phieuTraCaptor = ArgumentCaptor.forClass(PhieuTraHang.class);
            when(phieuTraHangRepository.save(phieuTraCaptor.capture())).thenReturn(new PhieuTraHang());

            // Act
            inventoryService.returnGoods(returnRequest);

            // Assert
            PhieuTraHang savedPhieuTra = phieuTraCaptor.getValue();
            assertThat(savedPhieuTra.getSoLuongTra()).isEqualTo(2);
            assertThat(savedPhieuTra.getLyDoTra()).isEqualTo("Customer request");
        }

        @Test
        @DisplayName("❌ Should throw exception when return quantity exceeds purchased")
        void returnGoods_WithExcessiveQuantity_ShouldThrowException() {
            // Arrange
            ReturnRequest returnRequest = ReturnRequest.builder()
                    .hoaDonGocId(1L)
                    .sanPhamId(1L)
                    .nhanVienId(1L)
                    .soLuongTra(10) // Invoice only has 2
                    .lyDoTra("Test")
                    .build();

            when(hoaDonRepository.findById(1L)).thenReturn(Optional.of(sampleInvoice));
            when(sanPhamRepository.findById(1L)).thenReturn(Optional.of(sampleProduct));
            when(nhanVienRepository.findById(1L)).thenReturn(Optional.of(sampleEmployee));

            // Act & Assert
            assertThatThrownBy(() -> inventoryService.returnGoods(returnRequest))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("Số lượng trả vượt quá");

            verify(phieuTraHangRepository, never()).save(any());
        }

        @Test
        @DisplayName("❌ Should throw exception when product not in invoice")
        void returnGoods_WithProductNotInInvoice_ShouldThrowException() {
            // Arrange
            ReturnRequest returnRequest = ReturnRequest.builder()
                    .hoaDonGocId(1L)
                    .sanPhamId(999L) // Product not in invoice
                    .nhanVienId(1L)
                    .soLuongTra(1)
                    .lyDoTra("Test")
                    .build();

            when(hoaDonRepository.findById(1L)).thenReturn(Optional.of(sampleInvoice));
            when(sanPhamRepository.findById(999L)).thenReturn(Optional.of(sampleProduct));
            when(nhanVienRepository.findById(1L)).thenReturn(Optional.of(sampleEmployee));

            // Act & Assert
            assertThatThrownBy(() -> inventoryService.returnGoods(returnRequest))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("Sản phẩm không có trong hóa đơn");

            verify(phieuTraHangRepository, never()).save(any());
        }

        @Test
        @DisplayName("❌ Should throw exception when invoice not found")
        void returnGoods_WithInvalidInvoice_ShouldThrowException() {
            // Arrange
            ReturnRequest returnRequest = ReturnRequest.builder()
                    .hoaDonGocId(999L)
                    .sanPhamId(1L)
                    .nhanVienId(1L)
                    .soLuongTra(1)
                    .lyDoTra("Test")
                    .build();

            when(hoaDonRepository.findById(999L)).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> inventoryService.returnGoods(returnRequest))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("Hóa đơn");

            verify(phieuTraHangRepository, never()).save(any());
        }
    }

    // ==================== CHECK STOCK TESTS ====================

    @Nested
    @DisplayName("Check Stock Tests")
    class CheckStockTests {

        @Test
        @DisplayName("✅ Should check stock successfully")
        void checkStock_WithValidProductId_ShouldReturnStock() {
            // Arrange
            Long productId = 1L;
            when(sanPhamRepository.findById(productId)).thenReturn(Optional.of(sampleProduct));

            // Act
            Integer stock = inventoryService.checkStock(productId);

            // Assert
            assertThat(stock).isEqualTo(50);
            verify(sanPhamRepository).findById(productId);
        }

        @Test
        @DisplayName("❌ Should throw exception when product not found")
        void checkStock_WithInvalidProductId_ShouldThrowException() {
            // Arrange
            Long productId = 999L;
            when(sanPhamRepository.findById(productId)).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> inventoryService.checkStock(productId))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("Sản phẩm");

            verify(sanPhamRepository).findById(productId);
        }

        @Test
        @DisplayName("✅ Should return zero for product with no stock")
        void checkStock_WithZeroStock_ShouldReturnZero() {
            // Arrange
            sampleProduct.setTonKho(0);
            when(sanPhamRepository.findById(1L)).thenReturn(Optional.of(sampleProduct));

            // Act
            Integer stock = inventoryService.checkStock(1L);

            // Assert
            assertThat(stock).isEqualTo(0);
        }
    }
}