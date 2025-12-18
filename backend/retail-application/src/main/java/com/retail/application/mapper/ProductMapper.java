package com.retail.application.mapper;

import com.retail.application.dto.ProductDTO;
import com.retail.domain.entity.SanPham;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ProductMapper {

    @Mapping(source = "chiNhanh.id", target = "chiNhanhId")
    @Mapping(source = "chiNhanh.tenChiNhanh", target = "tenChiNhanh")
    @Mapping(source = "nhaCungCap.id", target = "nhaCungCapId")
    @Mapping(source = "nhaCungCap.tenNcc", target = "tenNhaCungCap")
    @Mapping(source = "danhMuc.id", target = "danhMucId")
    @Mapping(source = "danhMuc.tenDanhMuc", target = "tenDanhMuc")
    ProductDTO toDto(SanPham entity);

    @Mapping(target = "chiNhanh", ignore = true)
    @Mapping(target = "nhaCungCap", ignore = true)
    @Mapping(target = "danhMuc", ignore = true)
    SanPham toEntity(ProductDTO dto);

    List<ProductDTO> toDtoList(List<SanPham> entities);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "chiNhanh", ignore = true)
    @Mapping(target = "nhaCungCap", ignore = true)
    @Mapping(target = "danhMuc", ignore = true)
    void updateEntityFromDto(ProductDTO dto, @MappingTarget SanPham entity);
}