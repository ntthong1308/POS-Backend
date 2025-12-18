package com.retail.security.jwt;

import com.retail.domain.entity.NhanVien;
import com.retail.persistence.repository.NhanVienRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final NhanVienRepository nhanVienRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        NhanVien nhanVien = nhanVienRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "User Not Found with username: " + username));

        return User.builder()
                .username(nhanVien.getUsername())
                .password(nhanVien.getPassword())
                .authorities(getAuthorities(nhanVien))
                .accountExpired(false)
                .accountLocked(false)
                .credentialsExpired(false)
                .disabled(false)
                .build();
    }

    private Collection<? extends GrantedAuthority> getAuthorities(NhanVien nhanVien) {
        return List.of(new SimpleGrantedAuthority("ROLE_" + nhanVien.getRole().name()));
    }
}