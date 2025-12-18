package com.retail.application.mapper;

import com.retail.application.dto.NguyenLieuDTO;
import com.retail.domain.entity.NguyenLieu;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface NguyenLieuMapper {

    @Mapping(source = "chiNhanh.id", target = "chiNhanhId")
    @Mapping(source = "chiNhanh.tenChiNhanh", target = "tenChiNhanh")
    NguyenLieuDTO toDto(NguyenLieu entity);

    @Mapping(target = "chiNhanh", ignore = true)
    NguyenLieu toEntity(NguyenLieuDTO dto);

    List<NguyenLieuDTO> toDtoList(List<NguyenLieu> entities);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "chiNhanh", ignore = true)
    void updateEntityFromDto(NguyenLieuDTO dto, @MappingTarget NguyenLieu entity);
}

