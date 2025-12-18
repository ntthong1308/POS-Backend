package com.retail.application.service.product;

import com.retail.application.dto.ProductDTO;
import com.retail.application.mapper.ProductMapper;
import com.retail.common.constant.ErrorCode;
import com.retail.common.constant.Status;
import com.retail.common.exception.BusinessException;
import com.retail.common.exception.ResourceNotFoundException;
import com.retail.domain.entity.SanPham;
import com.retail.persistence.repository.SanPhamRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for ProductServiceImpl
 * Tests all business logic without Spring context
 *
 * Coverage target: >= 80%
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("ProductService Unit Tests")
class ProductServiceImplTest {

    @Mock
    private SanPhamRepository sanPhamRepository;

    @Mock
    private ProductMapper productMapper;

    @InjectMocks
    private ProductServiceImpl productService;

    private SanPham sampleProduct;
    private ProductDTO sampleProductDTO;

    @BeforeEach
    void setUp() {
        // Sample entity
        sampleProduct = SanPham.builder()
                .id(1L)
                .maSanPham("SP001")
                .tenSanPham("Coca Cola 330ml")
                .barcode("8934588123456")
                .giaBan(new BigDecimal("10000"))
                .tonKho(100)
                .trangThai(Status.ACTIVE)
                .build();

        // Sample DTO
        sampleProductDTO = ProductDTO.builder()
                .id(1L)
                .maSanPham("SP001")
                .tenSanPham("Coca Cola 330ml")
                .barcode("8934588123456")
                .giaBan(new BigDecimal("10000"))
                .tonKho(100)
                .trangThai(Status.ACTIVE)
                .build();
    }

    // ==================== CREATE TESTS ====================

    @Nested
    @DisplayName("Create Product Tests")
    class CreateTests {

        @Test
        @DisplayName("✅ Should create product successfully with valid data")
        void create_WithValidData_ShouldReturnCreatedProduct() {
            // Arrange
            ProductDTO inputDTO = ProductDTO.builder()
                    .maSanPham("SP002")
                    .tenSanPham("Pepsi 330ml")
                    .barcode("8934588999999")
                    .giaBan(new BigDecimal("9000"))
                    .tonKho(50)
                    .build();

            SanPham entityToSave = SanPham.builder()
                    .maSanPham("SP002")
                    .tenSanPham("Pepsi 330ml")
                    .barcode("8934588999999")
                    .giaBan(new BigDecimal("9000"))
                    .tonKho(50)
                    .build();

            SanPham savedEntity = SanPham.builder()
                    .id(2L)
                    .maSanPham("SP002")
                    .tenSanPham("Pepsi 330ml")
                    .barcode("8934588999999")
                    .giaBan(new BigDecimal("9000"))
                    .tonKho(50)
                    .trangThai(Status.ACTIVE)
                    .build();

            ProductDTO expectedDTO = ProductDTO.builder()
                    .id(2L)
                    .maSanPham("SP002")
                    .tenSanPham("Pepsi 330ml")
                    .barcode("8934588999999")
                    .giaBan(new BigDecimal("9000"))
                    .tonKho(50)
                    .trangThai(Status.ACTIVE)
                    .build();

            when(sanPhamRepository.existsByBarcode("8934588999999")).thenReturn(false);
            when(sanPhamRepository.existsByMaSanPham("SP002")).thenReturn(false);
            when(productMapper.toEntity(inputDTO)).thenReturn(entityToSave);
            when(sanPhamRepository.save(any(SanPham.class))).thenReturn(savedEntity);
            when(productMapper.toDto(savedEntity)).thenReturn(expectedDTO);

            // Act
            ProductDTO result = productService.create(inputDTO);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getId()).isEqualTo(2L);
            assertThat(result.getMaSanPham()).isEqualTo("SP002");
            assertThat(result.getTrangThai()).isEqualTo(Status.ACTIVE);

            verify(sanPhamRepository).existsByBarcode("8934588999999");
            verify(sanPhamRepository).existsByMaSanPham("SP002");
            verify(sanPhamRepository).save(any(SanPham.class));
            verify(productMapper).toEntity(inputDTO);
            verify(productMapper).toDto(savedEntity);
        }

        @Test
        @DisplayName("❌ Should throw exception when barcode already exists")
        void create_WithDuplicateBarcode_ShouldThrowBusinessException() {
            // Arrange
            ProductDTO inputDTO = ProductDTO.builder()
                    .maSanPham("SP003")
                    .barcode("8934588123456") // Existing barcode
                    .build();

            when(sanPhamRepository.existsByBarcode("8934588123456")).thenReturn(true);

            // Act & Assert
            assertThatThrownBy(() -> productService.create(inputDTO))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("Barcode đã tồn tại");

            verify(sanPhamRepository).existsByBarcode("8934588123456");
            verify(sanPhamRepository, never()).save(any());
        }

        @Test
        @DisplayName("❌ Should throw exception when product code already exists")
        void create_WithDuplicateProductCode_ShouldThrowBusinessException() {
            // Arrange
            ProductDTO inputDTO = ProductDTO.builder()
                    .maSanPham("SP001") // Existing code
                    .barcode("8934588111111")
                    .build();

            when(sanPhamRepository.existsByBarcode("8934588111111")).thenReturn(false);
            when(sanPhamRepository.existsByMaSanPham("SP001")).thenReturn(true);

            // Act & Assert
            assertThatThrownBy(() -> productService.create(inputDTO))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("Mã sản phẩm đã tồn tại");

            verify(sanPhamRepository).existsByBarcode("8934588111111");
            verify(sanPhamRepository).existsByMaSanPham("SP001");
            verify(sanPhamRepository, never()).save(any());
        }

        @Test
        @DisplayName("✅ Should set status to ACTIVE when creating product")
        void create_ShouldSetStatusToActive() {
            // Arrange
            ProductDTO inputDTO = ProductDTO.builder()
                    .maSanPham("SP004")
                    .barcode("8934588222222")
                    .build();

            SanPham entityToSave = new SanPham();
            SanPham savedEntity = SanPham.builder()
                    .id(3L)
                    .trangThai(Status.ACTIVE)
                    .build();

            when(sanPhamRepository.existsByBarcode(anyString())).thenReturn(false);
            when(sanPhamRepository.existsByMaSanPham(anyString())).thenReturn(false);
            when(productMapper.toEntity(inputDTO)).thenReturn(entityToSave);
            when(sanPhamRepository.save(any(SanPham.class))).thenReturn(savedEntity);
            when(productMapper.toDto(savedEntity)).thenReturn(sampleProductDTO);

            // Act
            productService.create(inputDTO);

            // Assert
            verify(sanPhamRepository).save(argThat(entity ->
                    entity.getTrangThai() == Status.ACTIVE
            ));
        }
    }

    // ==================== UPDATE TESTS ====================

    @Nested
    @DisplayName("Update Product Tests")
    class UpdateTests {

        @Test
        @DisplayName("✅ Should update product successfully")
        void update_WithValidData_ShouldReturnUpdatedProduct() {
            // Arrange
            Long productId = 1L;
            ProductDTO updateDTO = ProductDTO.builder()
                    .tenSanPham("Coca Cola 500ml")
                    .giaBan(new BigDecimal("15000"))
                    .barcode("8934588123456") // Same barcode
                    .build();

            SanPham existingProduct = SanPham.builder()
                    .id(1L)
                    .maSanPham("SP001")
                    .tenSanPham("Coca Cola 330ml")
                    .barcode("8934588123456")
                    .giaBan(new BigDecimal("10000"))
                    .build();

            SanPham updatedProduct = SanPham.builder()
                    .id(1L)
                    .maSanPham("SP001")
                    .tenSanPham("Coca Cola 500ml")
                    .barcode("8934588123456")
                    .giaBan(new BigDecimal("15000"))
                    .build();

            ProductDTO expectedDTO = ProductDTO.builder()
                    .id(1L)
                    .tenSanPham("Coca Cola 500ml")
                    .giaBan(new BigDecimal("15000"))
                    .build();

            when(sanPhamRepository.findById(productId)).thenReturn(Optional.of(existingProduct));
            doNothing().when(productMapper).updateEntityFromDto(updateDTO, existingProduct);
            when(sanPhamRepository.save(existingProduct)).thenReturn(updatedProduct);
            when(productMapper.toDto(updatedProduct)).thenReturn(expectedDTO);

            // Act
            ProductDTO result = productService.update(productId, updateDTO);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getTenSanPham()).isEqualTo("Coca Cola 500ml");
            assertThat(result.getGiaBan()).isEqualByComparingTo(new BigDecimal("15000"));

            verify(sanPhamRepository).findById(productId);
            verify(productMapper).updateEntityFromDto(updateDTO, existingProduct);
            verify(sanPhamRepository).save(existingProduct);
        }

        @Test
        @DisplayName("❌ Should throw exception when product not found")
        void update_WhenProductNotExists_ShouldThrowResourceNotFoundException() {
            // Arrange
            Long productId = 999L;
            ProductDTO updateDTO = new ProductDTO();

            when(sanPhamRepository.findById(productId)).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> productService.update(productId, updateDTO))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("Sản phẩm");

            verify(sanPhamRepository).findById(productId);
            verify(sanPhamRepository, never()).save(any());
        }

        @Test
        @DisplayName("❌ Should throw exception when updating to duplicate barcode")
        void update_WithDuplicateBarcode_ShouldThrowBusinessException() {
            // Arrange
            Long productId = 1L;
            ProductDTO updateDTO = ProductDTO.builder()
                    .barcode("8934588999999") // Different barcode (already exists)
                    .build();

            SanPham existingProduct = SanPham.builder()
                    .id(1L)
                    .barcode("8934588123456") // Current barcode
                    .build();

            when(sanPhamRepository.findById(productId)).thenReturn(Optional.of(existingProduct));
            when(sanPhamRepository.existsByBarcode("8934588999999")).thenReturn(true);

            // Act & Assert
            assertThatThrownBy(() -> productService.update(productId, updateDTO))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("Barcode đã tồn tại");

            verify(sanPhamRepository).findById(productId);
            verify(sanPhamRepository).existsByBarcode("8934588999999");
            verify(sanPhamRepository, never()).save(any());
        }

        @Test
        @DisplayName("✅ Should allow same barcode when updating")
        void update_WithSameBarcode_ShouldNotCheckDuplicate() {
            // Arrange
            Long productId = 1L;
            ProductDTO updateDTO = ProductDTO.builder()
                    .barcode("8934588123456") // Same barcode
                    .tenSanPham("Updated Name")
                    .build();

            SanPham existingProduct = SanPham.builder()
                    .id(1L)
                    .barcode("8934588123456")
                    .build();

            when(sanPhamRepository.findById(productId)).thenReturn(Optional.of(existingProduct));
            when(sanPhamRepository.save(any())).thenReturn(existingProduct);
            when(productMapper.toDto(any())).thenReturn(sampleProductDTO);

            // Act
            productService.update(productId, updateDTO);

            // Assert
            verify(sanPhamRepository, never()).existsByBarcode(anyString());
        }
    }

    // ==================== FIND TESTS ====================

    @Nested
    @DisplayName("Find Product Tests")
    class FindTests {

        @Test
        @DisplayName("✅ Should find product by ID successfully")
        void findById_WhenProductExists_ShouldReturnProduct() {
            // Arrange
            Long productId = 1L;

            when(sanPhamRepository.findById(productId)).thenReturn(Optional.of(sampleProduct));
            when(productMapper.toDto(sampleProduct)).thenReturn(sampleProductDTO);

            // Act
            ProductDTO result = productService.findById(productId);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getId()).isEqualTo(1L);
            assertThat(result.getMaSanPham()).isEqualTo("SP001");

            verify(sanPhamRepository).findById(productId);
            verify(productMapper).toDto(sampleProduct);
        }

        @Test
        @DisplayName("❌ Should throw exception when product not found by ID")
        void findById_WhenProductNotExists_ShouldThrowResourceNotFoundException() {
            // Arrange
            Long productId = 999L;

            when(sanPhamRepository.findById(productId)).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> productService.findById(productId))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("Sản phẩm");

            verify(sanPhamRepository).findById(productId);
            verify(productMapper, never()).toDto(any());
        }

        @Test
        @DisplayName("✅ Should find product by barcode successfully")
        void findByBarcode_WhenProductExists_ShouldReturnProduct() {
            // Arrange
            String barcode = "8934588123456";

            when(sanPhamRepository.findByBarcode(barcode)).thenReturn(Optional.of(sampleProduct));
            when(productMapper.toDto(sampleProduct)).thenReturn(sampleProductDTO);

            // Act
            ProductDTO result = productService.findByBarcode(barcode);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getBarcode()).isEqualTo(barcode);

            verify(sanPhamRepository).findByBarcode(barcode);
            verify(productMapper).toDto(sampleProduct);
        }

        @Test
        @DisplayName("❌ Should throw exception when product not found by barcode")
        void findByBarcode_WhenProductNotExists_ShouldThrowResourceNotFoundException() {
            // Arrange
            String barcode = "9999999999999";

            when(sanPhamRepository.findByBarcode(barcode)).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> productService.findByBarcode(barcode))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("barcode");

            verify(sanPhamRepository).findByBarcode(barcode);
        }

        @Test
        @DisplayName("✅ Should find all active products with pagination")
        void findAll_ShouldReturnPageOfProducts() {
            // Arrange
            Pageable pageable = PageRequest.of(0, 10);
            List<SanPham> productList = List.of(sampleProduct);
            Page<SanPham> productPage = new PageImpl<>(productList, pageable, 1);

            when(sanPhamRepository.findByTrangThai(Status.ACTIVE, pageable)).thenReturn(productPage);
            when(productMapper.toDto(sampleProduct)).thenReturn(sampleProductDTO);

            // Act
            Page<ProductDTO> result = productService.findAll(pageable);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getContent()).hasSize(1);
            assertThat(result.getTotalElements()).isEqualTo(1);

            verify(sanPhamRepository).findByTrangThai(Status.ACTIVE, pageable);
        }

        @Test
        @DisplayName("✅ Should search products by keyword")
        void search_WithKeyword_ShouldReturnMatchingProducts() {
            // Arrange
            String keyword = "Coca";
            Pageable pageable = PageRequest.of(0, 10);
            List<SanPham> productList = List.of(sampleProduct);
            Page<SanPham> productPage = new PageImpl<>(productList, pageable, 1);

            when(sanPhamRepository.searchByKeyword(keyword, pageable)).thenReturn(productPage);
            when(productMapper.toDto(sampleProduct)).thenReturn(sampleProductDTO);

            // Act
            Page<ProductDTO> result = productService.search(keyword, pageable);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getContent()).hasSize(1);

            verify(sanPhamRepository).searchByKeyword(keyword, pageable);
        }

        @Test
        @DisplayName("✅ Should find low stock products")
        void findLowStockProducts_ShouldReturnList() {
            // Arrange
            List<SanPham> lowStockProducts = List.of(sampleProduct);
            List<ProductDTO> expectedDTOs = List.of(sampleProductDTO);

            when(sanPhamRepository.findLowStockProducts(Status.ACTIVE)).thenReturn(lowStockProducts);
            when(productMapper.toDtoList(lowStockProducts)).thenReturn(expectedDTOs);

            // Act
            List<ProductDTO> result = productService.findLowStockProducts();

            // Assert
            assertThat(result).isNotNull();
            assertThat(result).hasSize(1);

            verify(sanPhamRepository).findLowStockProducts(Status.ACTIVE);
            verify(productMapper).toDtoList(lowStockProducts);
        }
    }

    // ==================== DELETE TESTS ====================

    @Nested
    @DisplayName("Delete Product Tests")
    class DeleteTests {

        @Test
        @DisplayName("✅ Should soft delete product successfully")
        void delete_WhenProductExists_ShouldMarkAsDeleted() {
            // Arrange
            Long productId = 1L;

            when(sanPhamRepository.findById(productId)).thenReturn(Optional.of(sampleProduct));
            when(sanPhamRepository.save(any(SanPham.class))).thenReturn(sampleProduct);

            // Act
            productService.delete(productId);

            // Assert
            verify(sanPhamRepository).findById(productId);
            verify(sanPhamRepository).save(argThat(entity ->
                    entity.getTrangThai() == Status.DELETED
            ));
        }

        @Test
        @DisplayName("❌ Should throw exception when deleting non-existent product")
        void delete_WhenProductNotExists_ShouldThrowResourceNotFoundException() {
            // Arrange
            Long productId = 999L;

            when(sanPhamRepository.findById(productId)).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> productService.delete(productId))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("Sản phẩm");

            verify(sanPhamRepository).findById(productId);
            verify(sanPhamRepository, never()).save(any());
        }
    }

    // ==================== UPDATE STATUS TESTS ====================

    @Nested
    @DisplayName("Update Status Tests")
    class UpdateStatusTests {

        @Test
        @DisplayName("✅ Should update product status successfully")
        void updateStatus_WhenProductExists_ShouldUpdateStatus() {
            // Arrange
            Long productId = 1L;
            Status newStatus = Status.INACTIVE;

            when(sanPhamRepository.findById(productId)).thenReturn(Optional.of(sampleProduct));
            when(sanPhamRepository.save(any(SanPham.class))).thenReturn(sampleProduct);

            // Act
            productService.updateStatus(productId, newStatus);

            // Assert
            verify(sanPhamRepository).findById(productId);
            verify(sanPhamRepository).save(argThat(entity ->
                    entity.getTrangThai() == Status.INACTIVE
            ));
        }

        @Test
        @DisplayName("❌ Should throw exception when updating status of non-existent product")
        void updateStatus_WhenProductNotExists_ShouldThrowResourceNotFoundException() {
            // Arrange
            Long productId = 999L;
            Status newStatus = Status.INACTIVE;

            when(sanPhamRepository.findById(productId)).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> productService.updateStatus(productId, newStatus))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("Sản phẩm");

            verify(sanPhamRepository).findById(productId);
            verify(sanPhamRepository, never()).save(any());
        }

        @Test
        @DisplayName("✅ Should update to DELETED status")
        void updateStatus_ToDeleted_ShouldWork() {
            // Arrange
            Long productId = 1L;

            when(sanPhamRepository.findById(productId)).thenReturn(Optional.of(sampleProduct));
            when(sanPhamRepository.save(any())).thenReturn(sampleProduct);

            // Act
            productService.updateStatus(productId, Status.DELETED);

            // Assert
            verify(sanPhamRepository).save(argThat(entity ->
                    entity.getTrangThai() == Status.DELETED
            ));
        }
    }
}