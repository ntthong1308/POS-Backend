package com.retail.pos.controller;

import com.retail.application.dto.PaymentResponse;
import com.retail.application.service.payment.impl.VNPayPaymentGateway;
import com.retail.domain.entity.PaymentTransaction;
import com.retail.persistence.repository.PaymentTransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

/**
 * Controller xử lý VNPay callbacks (IPN và Return URL)
 */
@RestController
@RequestMapping("/api/v1/payments/vnpay")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class VNPayController {

    private final VNPayPaymentGateway vnPayPaymentGateway;
    private final PaymentTransactionRepository paymentTransactionRepository;
    
    @Value("${app.vnpay.frontend-return-url:http://localhost:5173/payments/vnpay/return}")
    private String frontendReturnUrl;

    /**
     * IPN (Instant Payment Notification) callback từ VNPay
     * VNPay sẽ gọi URL này để thông báo kết quả thanh toán
     * 
     * URL: POST /api/v1/payments/vnpay/ipn
     */
    @PostMapping("/ipn")
    public ResponseEntity<String> handleIpn(@RequestParam Map<String, String> params) {
        log.info("Received VNPay IPN callback: {}", params);

        try {
            // Verify IPN signature
            boolean isValid = vnPayPaymentGateway.verifyIpnCallback(params);
            if (!isValid) {
                log.warn("Invalid VNPay IPN signature");
                return ResponseEntity.badRequest().body("Invalid signature");
            }

            // Parse IPN response
            PaymentResponse ipnResponse = vnPayPaymentGateway.parseIpnResponse(params);
            
            // Update payment transaction
            String vnp_TxnRef = params.get("vnp_TxnRef");
            if (vnp_TxnRef != null) {
                // Extract invoice ID from TxnRef (format: INV{invoiceId}_{timestamp})
                String invoiceIdStr = vnp_TxnRef.replace("INV", "").split("_")[0];
                try {
                    Long invoiceId = Long.parseLong(invoiceIdStr);
                    
                    // Find and update transaction by gateway transaction ID
                    PaymentTransaction transaction = paymentTransactionRepository
                            .findByGatewayTransactionId(ipnResponse.getGatewayTransactionId())
                            .orElse(null);
                    
                    // If not found, try to find by invoice ID (latest VNPay transaction)
                    if (transaction == null) {
                        transaction = paymentTransactionRepository
                                .findByHoaDonId(invoiceId)
                                .stream()
                                .filter(t -> t.getGatewayTransactionId() != null && 
                                           t.getGatewayTransactionId().startsWith("VNPAY"))
                                .findFirst()
                                .orElse(null);
                    }
                    
                    if (transaction != null) {
                        transaction.setStatus(ipnResponse.getStatus());
                        transaction.setGatewayTransactionId(ipnResponse.getGatewayTransactionId());
                        if (ipnResponse.getErrorMessage() != null) {
                            transaction.setErrorMessage(ipnResponse.getErrorMessage());
                        }
                        paymentTransactionRepository.save(transaction);
                        log.info("Updated payment transaction: {} - Status: {}", 
                                transaction.getTransactionCode(), transaction.getStatus());
                    }
                } catch (NumberFormatException e) {
                    log.error("Error parsing invoice ID from TxnRef: {}", vnp_TxnRef);
                }
            }

            // Return success response to VNPay
            return ResponseEntity.ok("OK");

        } catch (Exception e) {
            log.error("Error processing VNPay IPN: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body("Error processing IPN");
        }
    }

    /**
     * Return URL callback từ VNPay
     * User sẽ được redirect về URL này sau khi thanh toán
     * Backend verify signature, sau đó redirect user về frontend
     * 
     * URL: GET /api/v1/payments/vnpay/return
     */
    @GetMapping("/return")
    public RedirectView handleReturn(@RequestParam Map<String, String> params) {
        log.info("Received VNPay return callback: {}", params);

        try {
            // Verify return URL signature
            boolean isValid = vnPayPaymentGateway.verifyIpnCallback(params);
            if (!isValid) {
                log.warn("Invalid VNPay return signature");
                // Redirect về frontend với error
                String errorUrl = frontendReturnUrl + "?error=invalid_signature";
                return new RedirectView(errorUrl);
            }

            // Parse response
            PaymentResponse returnResponse = vnPayPaymentGateway.parseIpnResponse(params);
            
            String vnp_TxnRef = params.get("vnp_TxnRef");
            String vnp_ResponseCode = params.get("vnp_ResponseCode");
            
            // Build redirect URL với tất cả params để frontend xử lý
            StringBuilder redirectUrl = new StringBuilder(frontendReturnUrl);
            redirectUrl.append("?");
            
            boolean first = true;
            for (Map.Entry<String, String> entry : params.entrySet()) {
                if (!first) {
                    redirectUrl.append("&");
                }
                redirectUrl.append(URLEncoder.encode(entry.getKey(), StandardCharsets.UTF_8));
                redirectUrl.append("=");
                redirectUrl.append(URLEncoder.encode(entry.getValue(), StandardCharsets.UTF_8));
                first = false;
            }
            
            log.info("Redirecting to frontend: {}", redirectUrl.toString());
            return new RedirectView(redirectUrl.toString());

        } catch (Exception e) {
            log.error("Error processing VNPay return: {}", e.getMessage(), e);
            // Redirect về frontend với error
            String errorUrl = frontendReturnUrl + "?error=processing_error&message=" 
                    + URLEncoder.encode(e.getMessage(), StandardCharsets.UTF_8);
            return new RedirectView(errorUrl);
        }
    }
}

