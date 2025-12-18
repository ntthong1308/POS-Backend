package com.retail.admin.controller;

import com.retail.application.dto.CustomerDTO;
import com.retail.application.service.customer.CustomerService;
import com.retail.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/v1/admin/customers")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
public class CustomerAdminController {

    private final CustomerService customerService;

    @PostMapping
    public ResponseEntity<ApiResponse<CustomerDTO>> createCustomer(@Valid @RequestBody CustomerDTO dto) {
        log.info("Creating new customer: {}", dto.getMaKhachHang());
        CustomerDTO created = customerService.create(dto);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CustomerDTO>> updateCustomer(
            @PathVariable Long id,
            @Valid @RequestBody CustomerDTO dto) {
        log.info("Updating customer ID: {}", id);
        CustomerDTO updated = customerService.update(id, dto);
        return ResponseEntity.ok(ApiResponse.success(updated));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CustomerDTO>> getCustomer(@PathVariable Long id) {
        CustomerDTO customer = customerService.findById(id);
        return ResponseEntity.ok(ApiResponse.success(customer));
    }

    @GetMapping("/phone/{phone}")
    public ResponseEntity<ApiResponse<CustomerDTO>> getCustomerByPhone(@PathVariable String phone) {
        CustomerDTO customer = customerService.findByPhone(phone);
        return ResponseEntity.ok(ApiResponse.success(customer));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<CustomerDTO>>> getAllCustomers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<CustomerDTO> customers = customerService.findAll(pageable);

        return ResponseEntity.ok(ApiResponse.success(customers,
                ApiResponse.PageInfo.builder()
                        .page(page)
                        .size(size)
                        .totalElements(customers.getTotalElements())
                        .totalPages(customers.getTotalPages())
                        .build()));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<CustomerDTO>>> searchCustomers(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<CustomerDTO> customers = customerService.search(keyword, pageable);

        return ResponseEntity.ok(ApiResponse.success(customers,
                ApiResponse.PageInfo.builder()
                        .page(page)
                        .size(size)
                        .totalElements(customers.getTotalElements())
                        .totalPages(customers.getTotalPages())
                        .build()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteCustomer(@PathVariable Long id) {
        log.info("Deleting customer ID: {}", id);
        customerService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa khách hàng thành công"));
    }

    @PatchMapping("/{id}/points")
    public ResponseEntity<ApiResponse<String>> updateCustomerPoints(
            @PathVariable Long id,
            @RequestParam BigDecimal points) {
        log.info("Updating customer points ID: {} with {}", id, points);
        customerService.updatePoints(id, points);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật điểm thành công"));
    }
}