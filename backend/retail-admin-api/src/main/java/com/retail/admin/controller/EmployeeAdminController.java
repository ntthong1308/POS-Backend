package com.retail.admin.controller;

import com.retail.application.dto.EmployeeDTO;
import com.retail.application.service.employee.EmployeeService;
import com.retail.common.response.ApiResponse;
import com.retail.domain.entity.NhanVien;
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

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/employees")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')")
public class EmployeeAdminController {

    private final EmployeeService employeeService;

    @PostMapping
    public ResponseEntity<ApiResponse<EmployeeDTO>> createEmployee(@Valid @RequestBody EmployeeDTO dto) {
        log.info("Creating new employee: {}", dto.getUsername());
        EmployeeDTO created = employeeService.create(dto);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<EmployeeDTO>> updateEmployee(
            @PathVariable Long id,
            @Valid @RequestBody EmployeeDTO dto) {
        log.info("Updating employee ID: {}", id);
        EmployeeDTO updated = employeeService.update(id, dto);
        return ResponseEntity.ok(ApiResponse.success(updated));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EmployeeDTO>> getEmployee(@PathVariable Long id) {
        EmployeeDTO employee = employeeService.findById(id);
        return ResponseEntity.ok(ApiResponse.success(employee));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<EmployeeDTO>>> getAllEmployees(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        log.info("Getting all employees - page: {}, size: {}", page, size);
        
        Pageable pageable = PageRequest.of(page, size);
        Page<EmployeeDTO> employees = employeeService.findAll(pageable);
        
        return ResponseEntity.ok(ApiResponse.success(employees,
                ApiResponse.PageInfo.builder()
                        .page(page)
                        .size(size)
                        .totalElements(employees.getTotalElements())
                        .totalPages(employees.getTotalPages())
                        .build()));
    }

    @GetMapping("/by-role")
    public ResponseEntity<ApiResponse<List<EmployeeDTO>>> getEmployeesByRole(
            @RequestParam NhanVien.Role role) {
        List<EmployeeDTO> employees = employeeService.findByRole(role);
        return ResponseEntity.ok(ApiResponse.success(employees));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteEmployee(@PathVariable Long id) {
        log.info("Deleting employee ID: {}", id);
        employeeService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa nhân viên thành công"));
    }

    @PostMapping("/{id}/change-password")
    public ResponseEntity<ApiResponse<String>> changePassword(
            @PathVariable Long id,
            @RequestParam String oldPassword,
            @RequestParam String newPassword) {
        log.info("Changing password for employee ID: {}", id);
        employeeService.changePassword(id, oldPassword, newPassword);
        return ResponseEntity.ok(ApiResponse.success("Đổi mật khẩu thành công"));
    }
}