package com.retail.application.hardware;

/**
 * Interface listener cho sự kiện quét barcode
 */
@FunctionalInterface
public interface BarcodeListener {
    /**
     * Được gọi khi có barcode được quét
     */
    void onBarcodeScanned(String barcode);
}

