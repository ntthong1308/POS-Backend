package com.retail.common.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {
    private T data;
    private PageInfo paging;
    private List<ErrorDetail> errors;
    private Meta meta;

    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
                .data(data)
                .meta(Meta.builder().timestamp(LocalDateTime.now()).build())
                .build();
    }

    public static <T> ApiResponse<T> success(T data, PageInfo pageInfo) {
        return ApiResponse.<T>builder()
                .data(data)
                .paging(pageInfo)
                .meta(Meta.builder().timestamp(LocalDateTime.now()).build())
                .build();
    }

    public static <T> ApiResponse<T> error(String code, String message) {
        return ApiResponse.<T>builder()
                .errors(List.of(ErrorDetail.builder()
                        .code(code)
                        .message(message)
                        .build()))
                .meta(Meta.builder().timestamp(LocalDateTime.now()).build())
                .build();
    }

    public static <T> ApiResponse<T> error(List<ErrorDetail> errors) {
        return ApiResponse.<T>builder()
                .errors(errors)
                .meta(Meta.builder().timestamp(LocalDateTime.now()).build())
                .build();
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PageInfo {
        private int page;
        private int size;
        private long totalElements;
        private int totalPages;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ErrorDetail {
        private String code;
        private String message;
        private String field;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Meta {
        private LocalDateTime timestamp;
        private String version;
    }
}