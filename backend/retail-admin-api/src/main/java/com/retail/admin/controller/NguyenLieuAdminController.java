package com.retail.admin.controller;

import com.retail.application.dto.BatchNhapXuatNguyenLieuRequest;
import com.retail.application.dto.DieuChinhSoLuongRequest;
import com.retail.application.dto.NguyenLieuDTO;
import com.retail.application.dto.NhapXuatNguyenLieuRequest;
import com.retail.application.dto.PhieuNhapXuatNguyenLieuDTO;
import com.retail.application.service.nguyenlieu.NguyenLieuService;
import com.retail.application.service.report.NguyenLieuReportService;
import com.retail.common.constant.Status;
import com.retail.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/api/v1/admin/nguyen-lieu")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
public class NguyenLieuAdminController {

    private final NguyenLieuService nguyenLieuService;
    private final NguyenLieuReportService nguyenLieuReportService;

    @PostMapping
    public ResponseEntity<ApiResponse<NguyenLieuDTO>> createNguyenLieu(@Valid @RequestBody NguyenLieuDTO dto) {
        log.info("Creating new nguyen lieu: {}", dto.getMaNguyenLieu());
        NguyenLieuDTO created = nguyenLieuService.create(dto);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<NguyenLieuDTO>> updateNguyenLieu(
            @PathVariable Long id,
            @Valid @RequestBody NguyenLieuDTO dto) {
        log.info("Updating nguyen lieu ID: {}", id);
        NguyenLieuDTO updated = nguyenLieuService.update(id, dto);
        return ResponseEntity.ok(ApiResponse.success(updated));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<NguyenLieuDTO>> getNguyenLieu(@PathVariable Long id) {
        NguyenLieuDTO nguyenLieu = nguyenLieuService.findById(id);
        return ResponseEntity.ok(ApiResponse.success(nguyenLieu));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<NguyenLieuDTO>>> getAllNguyenLieu(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<NguyenLieuDTO> nguyenLieu = nguyenLieuService.findAll(pageable);

        return ResponseEntity.ok(ApiResponse.success(nguyenLieu,
                ApiResponse.PageInfo.builder()
                        .page(page)
                        .size(size)
                        .totalElements(nguyenLieu.getTotalElements())
                        .totalPages(nguyenLieu.getTotalPages())
                        .build()));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<NguyenLieuDTO>>> searchNguyenLieu(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<NguyenLieuDTO> nguyenLieu = nguyenLieuService.search(keyword, pageable);

        return ResponseEntity.ok(ApiResponse.success(nguyenLieu,
                ApiResponse.PageInfo.builder()
                        .page(page)
                        .size(size)
                        .totalElements(nguyenLieu.getTotalElements())
                        .totalPages(nguyenLieu.getTotalPages())
                        .build()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteNguyenLieu(@PathVariable Long id) {
        log.info("Deleting nguyen lieu ID: {}", id);
        nguyenLieuService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa nguyên liệu thành công"));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<String>> updateNguyenLieuStatus(
            @PathVariable Long id,
            @RequestParam Status status) {
        log.info("Updating nguyen lieu status ID: {} to {}", id, status);
        nguyenLieuService.updateStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật trạng thái thành công"));
    }

    /**
     * Nhập nguyên liệu (single item) - Backward compatible
     */
    @PostMapping("/nhap")
    public ResponseEntity<ApiResponse<String>> nhapNguyenLieu(@Valid @RequestBody NhapXuatNguyenLieuRequest request) {
        log.info("Nhap nguyen lieu ID: {}, so luong: {}", request.getNguyenLieuId(), request.getSoLuong());
        nguyenLieuService.nhapNguyenLieu(request);
        return ResponseEntity.ok(ApiResponse.success("Nhập nguyên liệu thành công"));
    }

    /**
     * Nhập nguyên liệu batch (nhiều items)
     * Hỗ trợ nhiều nguyên liệu trong 1 request, có thể dùng chung mã phiếu
     */
    @PostMapping("/nhap/batch")
    public ResponseEntity<ApiResponse<String>> nhapNguyenLieuBatch(@Valid @RequestBody BatchNhapXuatNguyenLieuRequest request) {
        log.info("Batch nhap nguyen lieu - {} items", request.getItems().size());
        nguyenLieuService.nhapNguyenLieuBatch(request);
        return ResponseEntity.ok(ApiResponse.success(
                String.format("Nhập %d nguyên liệu thành công", request.getItems().size())));
    }

    /**
     * Xuất nguyên liệu (single item) - Backward compatible
     */
    @PostMapping("/xuat")
    public ResponseEntity<ApiResponse<String>> xuatNguyenLieu(@Valid @RequestBody NhapXuatNguyenLieuRequest request) {
        log.info("Xuat nguyen lieu ID: {}, so luong: {}", request.getNguyenLieuId(), request.getSoLuong());
        nguyenLieuService.xuatNguyenLieu(request);
        return ResponseEntity.ok(ApiResponse.success("Xuất nguyên liệu thành công"));
    }

    /**
     * Xuất nguyên liệu batch (nhiều items)
     * Hỗ trợ nhiều nguyên liệu trong 1 request, có thể dùng chung mã phiếu
     */
    @PostMapping("/xuat/batch")
    public ResponseEntity<ApiResponse<String>> xuatNguyenLieuBatch(@Valid @RequestBody BatchNhapXuatNguyenLieuRequest request) {
        log.info("Batch xuat nguyen lieu - {} items", request.getItems().size());
        nguyenLieuService.xuatNguyenLieuBatch(request);
        return ResponseEntity.ok(ApiResponse.success(
                String.format("Xuất %d nguyên liệu thành công", request.getItems().size())));
    }

    /**
     * Xóa phiếu nhập/xuất và rollback tồn kho
     * - Nếu là phiếu NHAP: Trừ lại số lượng từ tồn kho
     * - Nếu là phiếu XUAT: Cộng lại số lượng vào tồn kho
     * - Nếu là phiếu DIEU_CHINH: Khôi phục số lượng cũ
     */
    @DeleteMapping("/phieu/{id}")
    public ResponseEntity<ApiResponse<String>> deletePhieu(@PathVariable Long id) {
        log.info("Deleting phieu ID: {}", id);
        nguyenLieuService.deletePhieu(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa phiếu thành công. Tồn kho đã được rollback."));
    }

    @PostMapping("/dieu-chinh")
    public ResponseEntity<ApiResponse<String>> dieuChinhSoLuong(@Valid @RequestBody DieuChinhSoLuongRequest request) {
        log.info("Dieu chinh so luong nguyen lieu ID: {}, so luong moi: {}", 
                request.getNguyenLieuId(), request.getSoLuongMoi());
        nguyenLieuService.dieuChinhSoLuong(request);
        return ResponseEntity.ok(ApiResponse.success("Điều chỉnh số lượng thành công"));
    }

    @GetMapping("/nhap/history")
    public ResponseEntity<ApiResponse<Page<PhieuNhapXuatNguyenLieuDTO>>> getNhapHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        log.info("Getting nhap history - page: {}, size: {}", page, size);
        Pageable pageable = PageRequest.of(page, size);
        Page<PhieuNhapXuatNguyenLieuDTO> history = nguyenLieuService.getNhapHistory(pageable);

        return ResponseEntity.ok(ApiResponse.success(history,
                ApiResponse.PageInfo.builder()
                        .page(page)
                        .size(size)
                        .totalElements(history.getTotalElements())
                        .totalPages(history.getTotalPages())
                        .build()));
    }

    @GetMapping("/xuat/history")
    public ResponseEntity<ApiResponse<Page<PhieuNhapXuatNguyenLieuDTO>>> getXuatHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        log.info("Getting xuat history - page: {}, size: {}", page, size);
        Pageable pageable = PageRequest.of(page, size);
        Page<PhieuNhapXuatNguyenLieuDTO> history = nguyenLieuService.getXuatHistory(pageable);

        return ResponseEntity.ok(ApiResponse.success(history,
                ApiResponse.PageInfo.builder()
                        .page(page)
                        .size(size)
                        .totalElements(history.getTotalElements())
                        .totalPages(history.getTotalPages())
                        .build()));
    }

    @GetMapping("/transactions")
    public ResponseEntity<ApiResponse<Page<PhieuNhapXuatNguyenLieuDTO>>> getAllTransactions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        log.info("Getting all transactions - page: {}, size: {}", page, size);
        Pageable pageable = PageRequest.of(page, size);
        Page<PhieuNhapXuatNguyenLieuDTO> transactions = nguyenLieuService.getAllTransactions(pageable);

        return ResponseEntity.ok(ApiResponse.success(transactions,
                ApiResponse.PageInfo.builder()
                        .page(page)
                        .size(size)
                        .totalElements(transactions.getTotalElements())
                        .totalPages(transactions.getTotalPages())
                        .build()));
    }

    /**
     * Xuất Excel danh sách nguyên liệu tồn kho
     */
    @GetMapping("/ton-kho/excel")
    public ResponseEntity<byte[]> exportTonKhoExcel() {
        log.info("Request to export ton kho Excel");

        try {
            byte[] excelData = nguyenLieuReportService.exportTonKhoExcel();

            String filename = String.format("DanhSachNguyenLieuTonKho_%s.xlsx",
                    LocalDate.now().format(DateTimeFormatter.ofPattern("ddMMyyyy")));

            log.info("Ton kho Excel generated successfully, size: {} bytes, filename: {}",
                    excelData.length, filename);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + filename + "\"")
                    .contentType(MediaType.parseMediaType(
                            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(excelData);

        } catch (Exception e) {
            log.error("Error generating ton kho Excel", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Xuất Excel bảng nhập kho
     */
    @GetMapping("/nhap-kho/excel")
    public ResponseEntity<byte[]> exportNhapKhoExcel() {
        log.info("Request to export nhap kho Excel");

        try {
            byte[] excelData = nguyenLieuReportService.exportNhapKhoExcel();

            String filename = String.format("BangNhapKho_%s.xlsx",
                    LocalDate.now().format(DateTimeFormatter.ofPattern("ddMMyyyy")));

            log.info("Nhap kho Excel generated successfully, size: {} bytes, filename: {}",
                    excelData.length, filename);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + filename + "\"")
                    .contentType(MediaType.parseMediaType(
                            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(excelData);

        } catch (Exception e) {
            log.error("Error generating nhap kho Excel", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Xuất Excel bảng xuất kho
     */
    @GetMapping("/xuat-kho/excel")
    public ResponseEntity<byte[]> exportXuatKhoExcel() {
        log.info("Request to export xuat kho Excel");

        try {
            byte[] excelData = nguyenLieuReportService.exportXuatKhoExcel();

            String filename = String.format("BangXuatKho_%s.xlsx",
                    LocalDate.now().format(DateTimeFormatter.ofPattern("ddMMyyyy")));

            log.info("Xuat kho Excel generated successfully, size: {} bytes, filename: {}",
                    excelData.length, filename);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + filename + "\"")
                    .contentType(MediaType.parseMediaType(
                            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(excelData);

        } catch (Exception e) {
            log.error("Error generating xuat kho Excel", e);
            return ResponseEntity.internalServerError().build();
        }
    }
}

