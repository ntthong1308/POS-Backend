package com.retail.admin.controller;

import com.retail.application.dto.DanhMucDTO;
import com.retail.application.service.danhmuc.DanhMucService;
import com.retail.common.constant.Status;
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

@RestController
@RequestMapping("/api/v1/admin/danh-muc")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
public class DanhMucAdminController {

    private final DanhMucService danhMucService;

    @PostMapping
    public ResponseEntity<ApiResponse<DanhMucDTO>> createDanhMuc(@Valid @RequestBody DanhMucDTO dto) {
        log.info("Creating new danh muc: {}", dto.getMaDanhMuc());
        DanhMucDTO created = danhMucService.create(dto);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<DanhMucDTO>> updateDanhMuc(
            @PathVariable Long id,
            @Valid @RequestBody DanhMucDTO dto) {
        log.info("Updating danh muc ID: {}", id);
        DanhMucDTO updated = danhMucService.update(id, dto);
        return ResponseEntity.ok(ApiResponse.success(updated));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DanhMucDTO>> getDanhMuc(@PathVariable Long id) {
        DanhMucDTO danhMuc = danhMucService.findById(id);
        return ResponseEntity.ok(ApiResponse.success(danhMuc));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<DanhMucDTO>>> getAllDanhMuc(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<DanhMucDTO> danhMucList = danhMucService.findAll(pageable);

        return ResponseEntity.ok(ApiResponse.success(danhMucList,
                ApiResponse.PageInfo.builder()
                        .page(page)
                        .size(size)
                        .totalElements(danhMucList.getTotalElements())
                        .totalPages(danhMucList.getTotalPages())
                        .build()));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<DanhMucDTO>>> searchDanhMuc(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<DanhMucDTO> danhMucList = danhMucService.search(keyword, pageable);

        return ResponseEntity.ok(ApiResponse.success(danhMucList,
                ApiResponse.PageInfo.builder()
                        .page(page)
                        .size(size)
                        .totalElements(danhMucList.getTotalElements())
                        .totalPages(danhMucList.getTotalPages())
                        .build()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteDanhMuc(@PathVariable Long id) {
        log.info("Deleting danh muc ID: {}", id);
        danhMucService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa danh mục thành công"));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<String>> updateDanhMucStatus(
            @PathVariable Long id,
            @RequestParam Status status) {
        log.info("Updating danh muc status ID: {} to {}", id, status);
        danhMucService.updateStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật trạng thái thành công"));
    }
}

