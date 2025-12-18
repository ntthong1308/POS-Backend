package com.retail.application.service.employee;

import com.retail.application.dto.EmployeeDTO;
import com.retail.application.mapper.EmployeeMapper;
import com.retail.common.constant.ErrorCode;
import com.retail.common.constant.Status;
import com.retail.common.exception.BusinessException;
import com.retail.common.exception.ResourceNotFoundException;
import com.retail.domain.entity.NhanVien;
import com.retail.persistence.repository.NhanVienRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmployeeServiceImpl implements EmployeeService {

    private final NhanVienRepository nhanVienRepository;
    private final EmployeeMapper employeeMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public EmployeeDTO create(EmployeeDTO dto) {
        log.info("Creating new employee: {}", dto.getUsername());

        // Validate username uniqueness
        if (nhanVienRepository.existsByUsername(dto.getUsername())) {
            throw new BusinessException(ErrorCode.BAD_REQUEST,
                    "Username đã tồn tại: " + dto.getUsername());
        }

        // Validate employee code uniqueness
        if (nhanVienRepository.existsByMaNhanVien(dto.getMaNhanVien())) {
            throw new BusinessException(ErrorCode.BAD_REQUEST,
                    "Mã nhân viên đã tồn tại: " + dto.getMaNhanVien());
        }

        NhanVien entity = employeeMapper.toEntity(dto);
        entity.setPassword(passwordEncoder.encode(dto.getPassword()));
        entity.setTrangThai(Status.ACTIVE);

        NhanVien saved = nhanVienRepository.save(entity);
        log.info("Employee created successfully with ID: {}", saved.getId());

        return employeeMapper.toDto(saved);
    }

    @Override
    @Transactional
    public EmployeeDTO update(Long id, EmployeeDTO dto) {
        log.info("Updating employee ID: {}", id);

        NhanVien existing = nhanVienRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Nhân viên", id));

        // Validate username uniqueness (if changed)
        if (!dto.getUsername().equals(existing.getUsername())) {
            if (nhanVienRepository.existsByUsername(dto.getUsername())) {
                throw new BusinessException(ErrorCode.BAD_REQUEST,
                        "Username đã tồn tại: " + dto.getUsername());
            }
        }

        employeeMapper.updateEntityFromDto(dto, existing);
        NhanVien updated = nhanVienRepository.save(existing);

        log.info("Employee updated successfully: {}", id);
        return employeeMapper.toDto(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public EmployeeDTO findById(Long id) {
        NhanVien entity = nhanVienRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Nhân viên", id));
        return employeeMapper.toDto(entity);
    }

    @Override
    @Transactional(readOnly = true)
    public EmployeeDTO findByUsername(String username) {
        NhanVien entity = nhanVienRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy nhân viên với username: " + username));
        return employeeMapper.toDto(entity);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EmployeeDTO> findAll() {
        return employeeMapper.toDtoList(
                nhanVienRepository.findByTrangThai(Status.ACTIVE));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<EmployeeDTO> findAll(Pageable pageable) {
        log.info("Finding all employees with pagination - page: {}, size: {}",
                pageable.getPageNumber(), pageable.getPageSize());

        Page<EmployeeDTO> result = nhanVienRepository.findByTrangThai(Status.ACTIVE, pageable)
                .map(employeeMapper::toDto);

        log.info("Employees found from database: {} items", result.getTotalElements());
        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public List<EmployeeDTO> findByRole(NhanVien.Role role) {
        return employeeMapper.toDtoList(nhanVienRepository.findByRole(role));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        log.info("Deleting employee ID: {}", id);

        NhanVien entity = nhanVienRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Nhân viên", id));

        entity.setTrangThai(Status.DELETED);
        nhanVienRepository.save(entity);

        log.info("Employee marked as deleted: {}", id);
    }

    @Override
    @Transactional
    public void changePassword(Long id, String oldPassword, String newPassword) {
        log.info("Changing password for employee ID: {}", id);

        NhanVien entity = nhanVienRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Nhân viên", id));

        // Verify old password
        if (!passwordEncoder.matches(oldPassword, entity.getPassword())) {
            throw new BusinessException(ErrorCode.INVALID_CREDENTIALS,
                    "Mật khẩu cũ không chính xác");
        }

        entity.setPassword(passwordEncoder.encode(newPassword));
        nhanVienRepository.save(entity);

        log.info("Password changed successfully for employee: {}", id);
    }

    @Override
    @Transactional
    public void resetPassword(String username, String newPassword) {
        log.info("Resetting password for employee: {}", username);
        NhanVien entity = nhanVienRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy nhân viên với username: " + username));
        entity.setPassword(passwordEncoder.encode(newPassword));
        nhanVienRepository.save(entity);
        log.info("Password reset successfully for employee: {}", username);
    }
}