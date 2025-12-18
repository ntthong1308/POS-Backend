package com.retail.application.service.payment.impl;

import com.retail.application.dto.PaymentRequest;
import com.retail.application.dto.PaymentResponse;
import com.retail.common.constant.PaymentMethod;
import com.retail.common.constant.PaymentStatus;
import com.retail.application.service.payment.PaymentGateway;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.*;
import java.util.Iterator;
import java.util.Calendar;
import java.util.TimeZone;
import java.text.SimpleDateFormat;

/**
 * VNPay Payment Gateway Integration
 * 
 * Thông tin test:
 * - Terminal ID: X8VWWPJ2
 * - Secret Key: UL37T5AM49OJ8KAIREZZJMD3YUD0XUN6
 * - URL: https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
 * - Email: 2251120056@ut.edu.vn
 */
@Component
@Slf4j
public class VNPayPaymentGateway implements PaymentGateway {

    @Value("${vnpay.tmn-code:X8VWWPJ2}")
    private String vnp_TmnCode;

    @Value("${vnpay.hash-secret:UL37T5AM49OJ8KAIREZZJMD3YUD0XUN6}")
    private String vnp_HashSecret;

    @Value("${vnpay.url:https://sandbox.vnpayment.vn/paymentv2/vpcpay.html}")
    private String vnp_Url;

    @Value("${vnpay.return-url:http://localhost:8081/api/v1/payments/vnpay/return}")
    private String vnp_ReturnUrl;

    @Value("${vnpay.ipn-url:http://localhost:8081/api/v1/payments/vnpay/ipn}")
    private String vnp_IpnUrl;

    private static final String vnp_Version = "2.1.0";
    private static final String vnp_Command = "pay";
    private static final String vnp_CurrCode = "VND";
    private static final String vnp_Locale = "vn";
    private static final String vnp_OrderType = "other";

    @Override
    public boolean supports(PaymentMethod paymentMethod) {
        // VNPay hỗ trợ thanh toán qua VNPay gateway, thẻ và ví điện tử
        return paymentMethod == PaymentMethod.VNPAY ||
               paymentMethod == PaymentMethod.VISA || 
               paymentMethod == PaymentMethod.MASTER || 
               paymentMethod == PaymentMethod.JCB ||
               paymentMethod == PaymentMethod.BANK_TRANSFER;
    }

    @Override
    public PaymentResponse processPayment(PaymentRequest request) {
        log.info("Processing VNPay payment: Invoice {} - Amount: {} - Method: {}", 
                request.getInvoiceId(), request.getAmount(), request.getPaymentMethod());

        try {
            // Tạo payment URL với VNPay
            String paymentUrl = createPaymentUrl(request);

            return PaymentResponse.builder()
                    .transactionCode("VNPAY_" + System.currentTimeMillis())
                    .invoiceId(request.getInvoiceId())
                    .paymentMethod(request.getPaymentMethod())
                    .amount(request.getAmount())
                    .transactionDate(LocalDateTime.now())
                    .status(PaymentStatus.PENDING) // Pending until user completes payment on VNPay
                    .gatewayTransactionId("VNPAY_" + System.currentTimeMillis())
                    .redirectUrl(paymentUrl) // URL để redirect user đến VNPay
                    .paymentUrl(paymentUrl) // URL để redirect user đến VNPay
                    .requiresConfirmation(true) // Cần xác nhận từ VNPay IPN
                    .build();

        } catch (Exception e) {
            log.error("Error processing VNPay payment: {}", e.getMessage(), e);
            return PaymentResponse.builder()
                    .invoiceId(request.getInvoiceId())
                    .paymentMethod(request.getPaymentMethod())
                    .amount(request.getAmount())
                    .status(PaymentStatus.FAILED)
                    .errorMessage("Lỗi xử lý thanh toán VNPay: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Tạo payment URL để redirect user đến VNPay
     */
    private String createPaymentUrl(PaymentRequest request) throws Exception {
        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", vnp_Version);
        vnp_Params.put("vnp_Command", vnp_Command);
        vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
        
        // Số tiền (nhân 100 vì VNPay dùng đơn vị nhỏ nhất)
        long amount = request.getAmount().multiply(BigDecimal.valueOf(100)).longValue();
        vnp_Params.put("vnp_Amount", String.valueOf(amount));
        
        vnp_Params.put("vnp_CurrCode", vnp_CurrCode);
        
        // TxnRef: Mã giao dịch (Invoice ID + timestamp)
        String vnp_TxnRef = "INV" + request.getInvoiceId() + "_" + System.currentTimeMillis();
        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
        
        // Order info - đơn giản hóa, loại bỏ khoảng trắng để tránh lỗi code 03
        // VNPay error code 03 có thể do khoảng trắng trong vnp_OrderInfo
        vnp_Params.put("vnp_OrderInfo", "Invoice" + request.getInvoiceId());
        vnp_Params.put("vnp_OrderType", vnp_OrderType);
        
        // Return URL và IPN URL
        vnp_Params.put("vnp_ReturnUrl", vnp_ReturnUrl);
        // Lưu ý: IPN URL chỉ thêm vào hash data nếu URL là public (không phải localhost)
        // VNPay không thể truy cập localhost, nên sẽ reject nếu có trong hash data
        // IPN URL vẫn được gửi trong query string nhưng KHÔNG tính vào hash
        // vnp_Params.put("vnp_IpnUrl", vnp_IpnUrl); // Bỏ qua IPN URL khi dùng localhost
        
        // vnp_IpAddr - thêm lại theo code demo VNPay
        vnp_Params.put("vnp_IpAddr", "127.0.0.1");
        
        // Locale
        vnp_Params.put("vnp_Locale", vnp_Locale);
        
        // Create date - Dùng TimeZone GMT+7 như code demo VNPay
        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnp_CreateDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);
        
        // Expire date (15 phút) - Dùng TimeZone GMT+7 như code demo VNPay
        cld.add(Calendar.MINUTE, 15);
        String vnp_ExpireDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

        // Sort params theo alphabet để tạo hash data
        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);
        
        // Build hash data: URL encode cả field name và field value (theo chuẩn VNPay demo)
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        Iterator<String> itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = vnp_Params.get(fieldName);
            if (fieldValue != null && !fieldValue.isEmpty()) {
                // Build hash data - URL encode theo chuẩn VNPay (US_ASCII)
                hashData.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII.toString()));
                hashData.append('=');
                hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                
                // Build query string (URL encoded - UTF_8)
                query.append(URLEncoder.encode(fieldName, StandardCharsets.UTF_8.toString()));
                query.append('=');
                query.append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8.toString()));
                
                // Append & nếu còn field tiếp theo - Logic giống code demo VNPay
                if (itr.hasNext()) {
                    hashData.append('&');
                    query.append('&');
                }
            }
        }
        
        // Tạo secure hash
        String hashDataString = hashData.toString();
        log.info("VNPay hash data (for debugging): {}", hashDataString);
        log.info("VNPay secret key length: {}", vnp_HashSecret != null ? vnp_HashSecret.length() : 0);
        String vnp_SecureHash = hmacSHA512(vnp_HashSecret, hashDataString);
        log.info("VNPay secure hash: {}", vnp_SecureHash);
        
        // Thêm IPN URL vào query string (không tính vào hash nếu là localhost)
        // Chỉ thêm nếu URL là public
        if (vnp_IpnUrl != null && !vnp_IpnUrl.contains("localhost") && !vnp_IpnUrl.contains("127.0.0.1")) {
            query.append("&vnp_IpnUrl=").append(URLEncoder.encode(vnp_IpnUrl, StandardCharsets.UTF_8.toString()));
        }
        
        query.append("&vnp_SecureHash=").append(vnp_SecureHash);
        
        String paymentUrl = vnp_Url + "?" + query.toString();
        log.info("VNPay payment URL created: {}", paymentUrl);
        
        return paymentUrl;
    }

    /**
     * Tạo HMAC SHA512 hash cho VNPay
     */
    private String hmacSHA512(String key, String data) {
        try {
            Mac hmacSHA512 = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKeySpec = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            hmacSHA512.init(secretKeySpec);
            byte[] digest = hmacSHA512.doFinal(data.getBytes(StandardCharsets.UTF_8));
            
            StringBuilder sb = new StringBuilder();
            for (byte b : digest) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            log.error("Error creating HMAC SHA512: {}", e.getMessage());
            throw new RuntimeException("Error creating secure hash", e);
        }
    }

    @Override
    public PaymentResponse verifyPayment(String transactionId) {
        log.info("Verifying VNPay payment: {}", transactionId);
        
        // VNPay verification thường được xử lý qua IPN callback
        // Method này có thể được gọi để check lại status
        return PaymentResponse.builder()
                .gatewayTransactionId(transactionId)
                .status(PaymentStatus.PENDING) // Cần check từ VNPay API
                .transactionDate(LocalDateTime.now())
                .build();
    }

    /**
     * Xác minh IPN callback từ VNPay
     * 
     * @param params Các tham số từ VNPay callback
     * @return true nếu hợp lệ, false nếu không
     */
    public boolean verifyIpnCallback(Map<String, String> params) {
        try {
            String vnp_SecureHash = params.get("vnp_SecureHash");
            if (vnp_SecureHash == null || vnp_SecureHash.isEmpty()) {
                return false;
            }

            // Loại bỏ vnp_SecureHash và sắp xếp params
            Map<String, String> sortedParams = new TreeMap<>(params);
            sortedParams.remove("vnp_SecureHash");
            sortedParams.remove("vnp_SecureHashType");

            // Tạo hash data
            StringBuilder hashData = new StringBuilder();
            for (Map.Entry<String, String> entry : sortedParams.entrySet()) {
                if (entry.getValue() != null && !entry.getValue().isEmpty()) {
                    hashData.append(entry.getKey()).append("=").append(entry.getValue());
                    hashData.append("&");
                }
            }
            if (hashData.length() > 0) {
                hashData.deleteCharAt(hashData.length() - 1); // Xóa dấu & cuối
            }

            // Tạo hash và so sánh
            String calculatedHash = hmacSHA512(vnp_HashSecret, hashData.toString());
            return calculatedHash.equalsIgnoreCase(vnp_SecureHash);

        } catch (Exception e) {
            log.error("Error verifying VNPay IPN: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Parse IPN response từ VNPay
     */
    public PaymentResponse parseIpnResponse(Map<String, String> params) {
        String vnp_ResponseCode = params.get("vnp_ResponseCode");
        String vnp_TxnRef = params.get("vnp_TxnRef");
        String vnp_TransactionNo = params.get("vnp_TransactionNo");
        String vnp_Amount = params.get("vnp_Amount");
        String vnp_TransactionStatus = params.get("vnp_TransactionStatus");

        PaymentStatus status;
        String errorMessage = null;

        // ResponseCode = "00" và TransactionStatus = "00" → Thành công
        if ("00".equals(vnp_ResponseCode) && "00".equals(vnp_TransactionStatus)) {
            status = PaymentStatus.COMPLETED;
        } else {
            status = PaymentStatus.FAILED;
            errorMessage = "VNPay Response Code: " + vnp_ResponseCode;
        }

        // Parse amount (chia 100 vì VNPay dùng đơn vị nhỏ nhất)
        BigDecimal amount = BigDecimal.ZERO;
        if (vnp_Amount != null) {
            try {
                amount = BigDecimal.valueOf(Long.parseLong(vnp_Amount)).divide(BigDecimal.valueOf(100));
            } catch (NumberFormatException e) {
                log.error("Error parsing amount: {}", vnp_Amount);
            }
        }

        return PaymentResponse.builder()
                .gatewayTransactionId(vnp_TransactionNo)
                .transactionCode(vnp_TxnRef)
                .amount(amount)
                .status(status)
                .errorMessage(errorMessage)
                .transactionDate(LocalDateTime.now())
                .build();
    }

    @Override
    public PaymentResponse refund(String transactionId, BigDecimal amount) {
        log.info("Processing VNPay refund: {} - Amount: {}", transactionId, amount);
        
        // VNPay refund cần gọi API riêng
        // Tạm thời return mock response
        return PaymentResponse.builder()
                .gatewayTransactionId("REFUND_" + transactionId)
                .status(PaymentStatus.PENDING) // Cần implement refund API
                .amount(amount)
                .transactionDate(LocalDateTime.now())
                .errorMessage("Refund chưa được implement - cần gọi VNPay Refund API")
                .build();
    }
}

