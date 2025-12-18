package com.retail.application.service.customer;

import com.retail.application.dto.CustomerDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;

public interface CustomerService {

    CustomerDTO create(CustomerDTO dto);

    CustomerDTO update(Long id, CustomerDTO dto);

    CustomerDTO findById(Long id);

    CustomerDTO findByPhone(String phone);

    Page<CustomerDTO> findAll(Pageable pageable);

    Page<CustomerDTO> search(String keyword, Pageable pageable);

    void delete(Long id);

    void updatePoints(Long id, BigDecimal points);
}