package com.luiz.helpdesk.services;

import com.luiz.helpdesk.domain.enums.Perfil;
import com.luiz.helpdesk.security.JWTUtil;
import com.luiz.helpdesk.security.UserSS;
import com.luiz.helpdesk.services.exceptions.UnauthorizedException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AuthService {

    @Autowired
    private JWTUtil jwtUtil;

    public UserSS getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            throw new UsernameNotFoundException("Usuário não autenticado");
        }
        Object principal = authentication.getPrincipal();
        if (!(principal instanceof UserSS)) {
            throw new UnauthorizedException("Usuário não autenticado");
        }
       return (UserSS) principal;
    }

    public String refreshToken(String oldToken) {
        if (!jwtUtil.tokenValido(oldToken)) {
            throw new UnauthorizedException("Token inválido ou expirado");
        }
        UserSS user = getAuthenticatedUser();
        return jwtUtil.generateToken(user.getUsername(), user.getId(), user.getNome(), getPerfis(user), user.getTema());
    }

    private Set<Perfil> getPerfis(UserSS user) {
        return user.getAuthorities().stream()
                .map(auth -> Perfil.fromDescricao(auth.getAuthority()))
                .collect(Collectors.toSet());
    }
}
