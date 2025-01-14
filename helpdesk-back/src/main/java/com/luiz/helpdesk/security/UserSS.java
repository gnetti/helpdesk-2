package com.luiz.helpdesk.security;

import com.luiz.helpdesk.domain.enums.Perfil;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Set;
import java.util.stream.Collectors;

public class UserSS implements UserDetails {
    private static final long serialVersionUID = 1L;

    private final Integer id;
    private final String email;
    private final String senha;
    private final String nome;
    private final Collection<? extends GrantedAuthority> authorities;
    private final String tema;
    private final Set<String> roles;

    public UserSS(Integer id, String email, String senha, Set<Perfil> perfis, String nome, String tema) {
        this.id = id;
        this.email = email;
        this.senha = senha;
        this.nome = nome;
        this.tema = tema;
        this.authorities = perfis.stream()
                .map(perfil -> new SimpleGrantedAuthority(perfil.getDescricao()))
                .collect(Collectors.toUnmodifiableSet());
        this.roles = perfis.stream()
                .map(Perfil::getDescricao)
                .collect(Collectors.toUnmodifiableSet());
    }

    public Integer getId() {
        return id;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return senha;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    public String getNome() {
        return nome;
    }

    public String getTema() {
        return tema;
    }

    public Set<String> getRoles() {
        return roles;
    }
}
