package com.retail.application.mapper;

import com.retail.application.dto.InvoiceDTO;
import com.retail.application.dto.InvoiceDetailDTO;
import com.retail.domain.entity.ChiTietHoaDon;
import com.retail.domain.entity.HoaDon;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface InvoiceMapper {

    @Mapping(source = "khachHang.id", target = "khachHangId")
    @Mapping(source = "khachHang.tenKhachHang", target = "tenKhachHang")
    @Mapping(source = "khachHang.soDienThoai", target = "soDienThoaiKhachHang")
    @Mapping(source = "nhanVien.id", target = "nhanVienId")
    @Mapping(source = "nhanVien.tenNhanVien", target = "tenNhanVien")
    @Mapping(source = "chiNhanh.id", target = "chiNhanhId")
    @Mapping(source = "chiNhanh.tenChiNhanh", target = "tenChiNhanh")
    InvoiceDTO toDto(HoaDon entity);

    @Mapping(source = "sanPham.id", target = "sanPhamId")
    @Mapping(source = "sanPham.tenSanPham", target = "tenSanPham")
    @Mapping(source = "sanPham.maSanPham", target = "maSanPham")
    InvoiceDetailDTO toDetailDto(ChiTietHoaDon entity);

    List<InvoiceDTO> toDtoList(List<HoaDon> entities);

    List<InvoiceDetailDTO> toDetailDtoList(List<ChiTietHoaDon> entities);
}