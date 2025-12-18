package com.retail.application.mapper;

import com.retail.application.dto.EmployeeDTO;
import com.retail.domain.entity.NhanVien;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface EmployeeMapper {

    @Mapping(source = "chiNhanh.id", target = "chiNhanhId")
    @Mapping(source = "chiNhanh.tenChiNhanh", target = "tenChiNhanh")
    @Mapping(target = "password", ignore = true)
    EmployeeDTO toDto(NhanVien entity);

    @Mapping(target = "chiNhanh", ignore = true)
    NhanVien toEntity(EmployeeDTO dto);

    List<EmployeeDTO> toDtoList(List<NhanVien> entities);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "chiNhanh", ignore = true)
    void updateEntityFromDto(EmployeeDTO dto, @MappingTarget NhanVien entity);
}