package com.retail.application.service.inventory;

import com.retail.application.dto.ImportGoodsRequest;
import com.retail.application.dto.ReturnRequest;

public interface InventoryService {

    /**
     * Nhập hàng vào kho
     */
    void importGoods(ImportGoodsRequest request);

    /**
     * Trả hàng
     */
    void returnGoods(ReturnRequest request);

    /**
     * Kiểm tra tồn kho sản phẩm
     */
    Integer checkStock(Long productId);
}