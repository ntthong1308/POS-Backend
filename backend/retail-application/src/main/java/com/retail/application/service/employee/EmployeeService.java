package com.retail.application.service.employee;

import com.retail.application.dto.EmployeeDTO;
import com.retail.domain.entity.NhanVien;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface EmployeeService {

    EmployeeDTO create(EmployeeDTO dto);

    EmployeeDTO update(Long id, EmployeeDTO dto);

    EmployeeDTO findById(Long id);

    EmployeeDTO findByUsername(String username);

    List<EmployeeDTO> findAll();

    Page<EmployeeDTO> findAll(Pageable pageable);

    List<EmployeeDTO> findByRole(NhanVien.Role role);

    void delete(Long id);

    void changePassword(Long id, String oldPassword, String newPassword);

    /**
     * Reset password for a user (admin/development only)
         * Note: This method should have proper authorization in production
     */
    void resetPassword(String username, String newPassword);
}