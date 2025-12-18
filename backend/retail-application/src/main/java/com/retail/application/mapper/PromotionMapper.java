package com.retail.application.mapper;

import com.retail.application.dto.PromotionDTO;
import com.retail.domain.entity.KhuyenMai;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import java.util.List;

/**
 * Mapper cho KhuyenMai Entity và DTO
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface PromotionMapper {

    @Mapping(target = "chiNhanhId", source = "chiNhanh.id")
    @Mapping(target = "tenChiNhanh", source = "chiNhanh.tenChiNhanh")
    @Mapping(target = "sanPhamIds", ignore = true) // Sẽ được set thủ công trong service
    @Mapping(target = "isActive", ignore = true) // Sẽ được set thủ công trong service
    PromotionDTO toDto(KhuyenMai entity);

    @Mapping(target = "chiNhanh", ignore = true)
    @Mapping(target = "chiTietKhuyenMais", ignore = true)
    KhuyenMai toEntity(PromotionDTO dto);

    List<PromotionDTO> toDtoList(List<KhuyenMai> entities);
}

