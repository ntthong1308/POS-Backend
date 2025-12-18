package com.retail.common.exception;

import com.retail.common.constant.ErrorCode;

public class ResourceNotFoundException extends BusinessException {
    public ResourceNotFoundException(String resource, Object id) {
        super(ErrorCode.NOT_FOUND, String.format("%s not found with id: %s", resource, id));
    }

    public ResourceNotFoundException(String message) {
        super(ErrorCode.NOT_FOUND, message);
    }
}