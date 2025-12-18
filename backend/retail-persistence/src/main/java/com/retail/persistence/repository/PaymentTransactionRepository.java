package com.retail.persistence.repository;

import com.retail.common.constant.PaymentMethod;
import com.retail.common.constant.PaymentStatus;
import com.retail.domain.entity.PaymentTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository for PaymentTransaction
 *
 */
@Repository
public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {

    Optional<PaymentTransaction> findByTransactionCode(String transactionCode);

    Optional<PaymentTransaction> findByGatewayTransactionId(String gatewayTransactionId);

    List<PaymentTransaction> findByHoaDonId(Long hoaDonId);

    List<PaymentTransaction> findByStatus(PaymentStatus status);

    List<PaymentTransaction> findByPaymentMethod(PaymentMethod paymentMethod);

    List<PaymentTransaction> findByTransactionDateBetween(LocalDateTime startDate, LocalDateTime endDate);

    List<PaymentTransaction> findByStatusAndTransactionDateBetween(
            PaymentStatus status,
            LocalDateTime startDate,
            LocalDateTime endDate);
}
