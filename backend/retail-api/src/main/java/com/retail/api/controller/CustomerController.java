package com.retail.api.controller;

import com.retail.application.dto.CustomerDTO;
import com.retail.application.service.customer.CustomerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller REST API cho quản lý khách hàng - Hỗ trợ Redis cache
 */
@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class CustomerController {

    private final CustomerService customerService;

    /**
     * Lấy khách hàng theo ID - Có cache Redis
     */
    @GetMapping("/{id}")
    public ResponseEntity<CustomerDTO> getCustomerById(@PathVariable Long id) {
        log.info("Request to get customer by ID: {}", id);

        CustomerDTO customer = customerService.findById(id);

        log.info("Customer found: {}", customer.getMaKhachHang());
        return ResponseEntity.ok(customer);
    }

    /**
     * Lấy khách hàng theo số điện thoại - Có cache Redis
     */
    @GetMapping("/phone/{phone}")
    public ResponseEntity<CustomerDTO> getCustomerByPhone(@PathVariable String phone) {
        log.info("Request to get customer by phone: {}", phone);

        CustomerDTO customer = customerService.findByPhone(phone);

        log.info("Customer found by phone: {}", customer.getMaKhachHang());
        return ResponseEntity.ok(customer);
    }

    /**
     * Lấy danh sách khách hàng với phân trang - Có cache Redis
     */
    @GetMapping
    public ResponseEntity<Page<CustomerDTO>> getAllCustomers(Pageable pageable) {
        log.info("Request to get all customers - page: {}, size: {}",
                pageable.getPageNumber(), pageable.getPageSize());

        Page<CustomerDTO> customers = customerService.findAll(pageable);

        log.info("Found {} customers", customers.getTotalElements());
        return ResponseEntity.ok(customers);
    }

    /**
     * Tìm kiếm khách hàng theo từ khóa - Có cache Redis
     */
    @GetMapping("/search")
    public ResponseEntity<Page<CustomerDTO>> searchCustomers(
            @RequestParam String keyword,
            Pageable pageable) {
        log.info("Request to search customers with keyword: '{}'", keyword);

        Page<CustomerDTO> customers = customerService.search(keyword, pageable);

        log.info("Search found {} customers", customers.getTotalElements());
        return ResponseEntity.ok(customers);
    }

    /**
     * Tạo khách hàng mới
     */
    @PostMapping
    public ResponseEntity<CustomerDTO> createCustomer(@RequestBody CustomerDTO customerDTO) {
        log.info("Request to create new customer: {}", customerDTO.getMaKhachHang());

        CustomerDTO created = customerService.create(customerDTO);

        log.info("Customer created successfully with ID: {}", created.getId());
        return ResponseEntity.ok(created);
    }

    /**
     * Cập nhật khách hàng
     */
    @PutMapping("/{id}")
    public ResponseEntity<CustomerDTO> updateCustomer(
            @PathVariable Long id,
            @RequestBody CustomerDTO customerDTO) {
        log.info("Request to update customer ID: {}", id);

        CustomerDTO updated = customerService.update(id, customerDTO);

        log.info("Customer updated successfully: {}", id);
        return ResponseEntity.ok(updated);
    }

    /**
     * Xóa khách hàng
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCustomer(@PathVariable Long id) {
        log.info("Request to delete customer ID: {}", id);

        customerService.delete(id);

        log.info("Customer deleted successfully: {}", id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Kiểm tra trạng thái API
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Customer API is running with Redis cache");
    }
}
