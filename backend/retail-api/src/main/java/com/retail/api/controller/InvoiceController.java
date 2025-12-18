package com.retail.api.controller;

import com.retail.application.dto.InvoiceDTO;
import com.retail.application.service.pos.PosService;
import com.retail.application.service.report.PdfInvoiceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller REST API cho quản lý hóa đơn - Hỗ trợ cache và xuất PDF
 */
@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*") // Allow CORS for frontend
public class InvoiceController {

    private final PosService posService;
    private final PdfInvoiceService pdfInvoiceService;

    /**
     * Lấy hóa đơn theo ID - Có cache Redis
     */
    @GetMapping("/{id}")
    public ResponseEntity<InvoiceDTO> getInvoiceById(@PathVariable Long id) {
        log.info("Request to get invoice by ID: {}", id);

        InvoiceDTO invoice = posService.getInvoice(id);

        log.info("Invoice found: {}", invoice.getMaHoaDon());
        return ResponseEntity.ok(invoice);
    }

    /**
     * Lấy danh sách hóa đơn theo ngày - Có cache Redis
     */
    @GetMapping("/by-date")
    public ResponseEntity<List<InvoiceDTO>> getInvoicesByDate(@RequestParam String date) {
        log.info("Request to get invoices by date: {}", date);

        List<InvoiceDTO> invoices = posService.getInvoicesByDate(date);

        log.info("Found {} invoices for date {}", invoices.size(), date);
        return ResponseEntity.ok(invoices);
    }

    /**
     * Tải xuống hóa đơn dạng PDF - Mẫu hóa đơn thanh toán
     */
    @GetMapping("/{id}/print")
    public ResponseEntity<byte[]> printInvoice(@PathVariable Long id) {
        log.info("Request to print invoice PDF ID: {}", id);

        try {
            byte[] pdfBytes = pdfInvoiceService.generateInvoicePdf(id);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment",
                    "invoice-" + id + ".pdf");
            headers.setContentLength(pdfBytes.length);

            log.info("Invoice PDF generated successfully, size: {} bytes", pdfBytes.length);

            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);

        } catch (Exception e) {
            log.error("Error generating invoice PDF for ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Kiểm tra trạng thái API
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Invoice API is running with Redis cache");
    }
}