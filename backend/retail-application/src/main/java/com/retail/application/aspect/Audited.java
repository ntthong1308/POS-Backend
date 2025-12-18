package com.retail.application.aspect;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Annotation đánh dấu các method cần được audit log
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Audited {
    /**
     * Loại hành động: CREATE, UPDATE, DELETE
     */
    String action() default "";

    /**
     * Tên entity - Nếu không chỉ định sẽ tự động suy ra từ method name hoặc parameter types
     */
    String entityName() default "";
}

