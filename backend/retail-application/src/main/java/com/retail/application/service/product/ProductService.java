package com.retail.application.service.product;

import com.retail.application.dto.ProductDTO;
import com.retail.common.constant.Status;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ProductService {

    ProductDTO create(ProductDTO dto);

    ProductDTO update(Long id, ProductDTO dto);

    ProductDTO findById(Long id);

    ProductDTO findByBarcode(String barcode);

    Page<ProductDTO> findAll(Pageable pageable);

    Page<ProductDTO> search(String keyword, Pageable pageable);

    List<ProductDTO> findLowStockProducts();

    void delete(Long id);

    void updateStatus(Long id, Status status);
}