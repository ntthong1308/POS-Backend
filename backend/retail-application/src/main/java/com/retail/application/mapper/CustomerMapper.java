package com.retail.application.mapper;

import com.retail.application.dto.CustomerDTO;
import com.retail.domain.entity.KhachHang;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface CustomerMapper {

    CustomerDTO toDto(KhachHang entity);

    KhachHang toEntity(CustomerDTO dto);

    List<CustomerDTO> toDtoList(List<KhachHang> entities);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    void updateEntityFromDto(CustomerDTO dto, @MappingTarget KhachHang entity);
}