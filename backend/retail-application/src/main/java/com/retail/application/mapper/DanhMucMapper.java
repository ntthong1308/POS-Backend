package com.retail.application.mapper;

import com.retail.application.dto.DanhMucDTO;
import com.retail.domain.entity.DanhMuc;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface DanhMucMapper {

    DanhMucDTO toDto(DanhMuc entity);

    DanhMuc toEntity(DanhMucDTO dto);

    List<DanhMucDTO> toDtoList(List<DanhMuc> entities);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    void updateEntityFromDto(DanhMucDTO dto, @MappingTarget DanhMuc entity);
}

