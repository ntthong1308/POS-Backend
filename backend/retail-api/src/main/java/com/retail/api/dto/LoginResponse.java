package com.retail.api.dto;

import com.retail.domain.entity.NhanVien;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private String token;
    @Builder.Default
    private String type = "Bearer";
    private Long id;
    private String username;
    private String tenNhanVien;
    private String email;
    private NhanVien.Role role;
    private Long chiNhanhId;
    private String tenChiNhanh;
}