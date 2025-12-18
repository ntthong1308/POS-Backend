package com.retail.application.service.customer;

import com.retail.application.dto.CustomerDTO;
import com.retail.application.mapper.CustomerMapper;
import com.retail.common.constant.ErrorCode;
import com.retail.common.constant.Status;
import com.retail.common.exception.BusinessException;
import com.retail.common.exception.ResourceNotFoundException;
import com.retail.domain.entity.HoaDon;
import com.retail.domain.entity.KhachHang;
import com.retail.persistence.repository.HoaDonRepository;
import com.retail.persistence.repository.KhachHangRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

/**
 * Service xử lý quản lý khách hàng - Hỗ trợ Redis cache với TTL 15 phút
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CustomerServiceImpl implements CustomerService {

    private final KhachHangRepository khachHangRepository;
    private final CustomerMapper customerMapper;
    private final HoaDonRepository hoaDonRepository;

    /**
     * Tạo khách hàng mới - Xóa cache sau khi tạo
     */
    @Override
    @Transactional
    @CacheEvict(value = "customers", allEntries = true)
    public CustomerDTO create(CustomerDTO dto) {
        // Tự động generate mã khách hàng nếu FE không gửi
        if (dto.getMaKhachHang() == null || dto.getMaKhachHang().trim().isEmpty()) {
            dto.setMaKhachHang(generateCustomerCode());
            log.info("Auto-generated customer code: {}", dto.getMaKhachHang());
        } else {
            // Kiểm tra mã khách hàng trùng lặp nếu FE tự nhập (chỉ check ACTIVE, không check DELETED)
            if (khachHangRepository.existsByMaKhachHangAndActive(dto.getMaKhachHang())) {
                throw new BusinessException(ErrorCode.BAD_REQUEST,
                        "Mã khách hàng đã tồn tại: " + dto.getMaKhachHang());
            }
        }

        log.info("Creating new customer: {}", dto.getMaKhachHang());

        // Kiểm tra số điện thoại trùng lặp (chỉ check ACTIVE, không check DELETED)
        if (dto.getSoDienThoai() != null &&
                khachHangRepository.existsBySoDienThoaiAndActive(dto.getSoDienThoai())) {
            throw new BusinessException(ErrorCode.BAD_REQUEST,
                    "Số điện thoại đã tồn tại: " + dto.getSoDienThoai());
        }

        KhachHang entity = customerMapper.toEntity(dto);
        entity.setTrangThai(Status.ACTIVE);
        entity.setDiemTichLuy(BigDecimal.ZERO);

        KhachHang saved = khachHangRepository.save(entity);
        log.info("Customer created successfully with ID: {} - Cache cleared", saved.getId());

        return customerMapper.toDto(saved);
    }

    /**
     * Cập nhật khách hàng - Cập nhật cache và xóa list cache
     */
    @Override
    @Transactional
    @Caching(
            put = @CachePut(value = "customers", key = "#id"),
            evict = @CacheEvict(value = "customers", allEntries = true)
    )
    public CustomerDTO update(Long id, CustomerDTO dto) {
        log.info("Updating customer ID: {}", id);

        KhachHang existing = khachHangRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khách hàng", id));

        customerMapper.updateEntityFromDto(dto, existing);
        KhachHang updated = khachHangRepository.save(existing);

        log.info("Customer updated successfully: {} - Cache updated", id);
        return customerMapper.toDto(updated);
    }

    /**
     * ⭐ CACHED - Find customer by ID
     *
     * First call: Query database (slow ~200-500ms)
     * Subsequent calls: Get from Redis (fast ~10-50ms)
     * Cache TTL: 15 minutes
     */
    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "customers", key = "#id", unless = "#result == null")
    public CustomerDTO findById(Long id) {
        log.info("Finding customer by ID: {} - Checking cache first", id);

        KhachHang entity = khachHangRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khách hàng", id));

        log.info("Customer found from database: {} - Will be cached", id);
        return customerMapper.toDto(entity);
    }

    /**
     * ⭐ CACHED - Find customer by phone number
     *
     * Cache key: "phone:{phone}"
     * Cache TTL: 15 minutes
     */
    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "customers", key = "'phone:' + #phone", unless = "#result == null")
    public CustomerDTO findByPhone(String phone) {
        log.info("Finding customer by phone: {} - Checking cache first", phone);
        KhachHang entity = khachHangRepository.findBySoDienThoai(phone)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy khách hàng với SĐT: " + phone));

        log.info("Customer found by phone from database: {} - Will be cached", phone);
        return customerMapper.toDto(entity);
    }

    /**
     * Find all customers with pagination
     * 
     * ⚠️ NOT CACHED - Page objects cannot be serialized to Redis properly
     * Individual customer records are cached via findById() instead
     */
    @Override
    @Transactional(readOnly = true)
    public Page<CustomerDTO> findAll(Pageable pageable) {
        log.info("Finding all customers - page: {}, size: {}",
                pageable.getPageNumber(), pageable.getPageSize());

        Page<CustomerDTO> result = khachHangRepository.findByTrangThai(Status.ACTIVE, pageable)
                .map(customerMapper::toDto);

        log.info("Customers found from database: {} items", result.getTotalElements());
        return result;
    }

    /**
     * Search customers by keyword
     * 
     * ⚠️ NOT CACHED - Page objects cannot be serialized to Redis properly
     * Individual customer records are cached via findById() instead
     */
    @Override
    @Transactional(readOnly = true)
    public Page<CustomerDTO> search(String keyword, Pageable pageable) {
        log.info("Searching customers with keyword: '{}'", keyword);

        Page<CustomerDTO> result = khachHangRepository.searchByKeyword(keyword, pageable)
                .map(customerMapper::toDto);

        log.info("Search found: {} items from database", result.getTotalElements());
        return result;
    }

    /**
     * Delete customer - Hard delete (xóa hoàn toàn khỏi database)
     * 
     * ⚠️ Lưu ý: 
     * - Nếu customer có hóa đơn, sẽ set khach_hang_id = NULL trong hóa đơn trước khi xóa
     * - Sau khi xóa, có thể tạo lại customer với cùng số điện thoại
     */
    @Override
    @Transactional
    @CacheEvict(value = "customers", allEntries = true)
    public void delete(Long id) {
        log.info("Deleting customer ID: {} - Hard delete (xóa hoàn toàn)", id);

        KhachHang entity = khachHangRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khách hàng", id));

        // Bước 1: Set khach_hang_id = NULL trong TẤT CẢ hóa đơn liên quan (tất cả trạng thái)
        // Để tránh foreign key constraint violation
        List<HoaDon> relatedInvoices = hoaDonRepository.findByKhachHangId(id);
        if (!relatedInvoices.isEmpty()) {
            log.info("Found {} invoices related to customer {} - Setting khach_hang_id = NULL", 
                    relatedInvoices.size(), id);
            relatedInvoices.forEach(hoaDon -> {
                    hoaDon.setKhachHang(null);
                    hoaDonRepository.save(hoaDon);
                log.debug("Set khach_hang_id = NULL for invoice: {} (status: {})", 
                        hoaDon.getMaHoaDon(), hoaDon.getTrangThai());
                });
        }

        // Bước 2: Xóa hoàn toàn khỏi database (hard delete)
        khachHangRepository.delete(entity);

        log.info("Customer deleted completely: {} - All related invoices updated - All cache cleared", id);
    }

    /**
     * Update customer points - Evict cache for this customer and list cache
     * Points change frequently, so we clear cache to show real-time data
     */
    @Override
    @Transactional
    @Caching(
            evict = {
                    @CacheEvict(value = "customers", key = "#id"),
                    @CacheEvict(value = "customers", allEntries = true)
            }
    )
    public void updatePoints(Long id, BigDecimal points) {
        log.info("Updating customer points ID: {} with {}", id, points);

        KhachHang entity = khachHangRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khách hàng", id));

        entity.setDiemTichLuy(entity.getDiemTichLuy().add(points));
        khachHangRepository.save(entity);

        log.info("Customer points updated: {} - Cache cleared", id);
    }

    /**
     * Tự động generate mã khách hàng ngắn gọn: 6-7 ký tự
     * Format: KH + 4-5 số ngẫu nhiên
     * Ví dụ: KH1234, KH56789
     */
    private String generateCustomerCode() {
        String prefix = "KH";
        // Tạo 4-5 số ngẫu nhiên (tổng 6-7 ký tự)
        int randomDigits = 1000 + (int) (Math.random() * 90000); // 1000-99999
        String code = prefix + randomDigits;

        // Đảm bảo mã không trùng (retry nếu trùng)
        int retryCount = 0;
        while (khachHangRepository.existsByMaKhachHang(code) && retryCount < 10) {
            randomDigits = 1000 + (int) (Math.random() * 90000);
            code = prefix + randomDigits;
            retryCount++;
        }

        // Nếu vẫn trùng sau 10 lần, thêm timestamp ngắn
        if (retryCount >= 10) {
            String timestamp = String.valueOf(System.currentTimeMillis()).substring(7); // 6 số cuối
            code = prefix + timestamp;
        }

        return code;
    }
}