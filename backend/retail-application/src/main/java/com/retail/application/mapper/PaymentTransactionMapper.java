package com.retail.application.mapper;

import com.retail.application.dto.PaymentResponse;
import com.retail.domain.entity.PaymentTransaction;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

import java.util.List;

/**
 * Mapper cho PaymentTransaction Entity và DTO
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface PaymentTransactionMapper {

    PaymentResponse toResponse(PaymentTransaction entity);

    List<PaymentResponse> toResponseList(List<PaymentTransaction> entities);
}

