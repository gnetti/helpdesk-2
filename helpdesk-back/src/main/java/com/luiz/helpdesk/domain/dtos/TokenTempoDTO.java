package com.luiz.helpdesk.domain.dtos;

import com.luiz.helpdesk.domain.TokenTempo;
import com.luiz.helpdesk.domain.dtos.interfaces.ITokenTempoConvertido;
import com.luiz.helpdesk.domain.enums.Perfil;
import com.luiz.helpdesk.security.UserSS;
import com.luiz.helpdesk.services.TokenTempoService;
import com.luiz.helpdesk.services.UserDetailsServiceImpl;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

public class TokenTempoDTO implements Serializable, ITokenTempoConvertido {
    private static final long serialVersionUID = 1L;

    private Integer id;
    private BigDecimal tokenTempoExpiracaoMinutos;
    private BigDecimal tempoTokenExibeDialogoMinutos;
    private BigDecimal tempoExibicaoDialogoAtualizaTokenMinutos;
    private BigDecimal intervaloAtualizacaoTokenMinutos;
    private Perfil perfil;

    private transient TokenTempoService tokenTempoService;
    private transient UserDetailsServiceImpl userDetailsService;

    public TokenTempoDTO() {
    }

    public TokenTempoDTO(Integer id, BigDecimal tokenTempoExpiracaoMinutos, BigDecimal tempoTokenExibeDialogoMinutos, BigDecimal tempoExibicaoDialogoAtualizaTokenMinutos, BigDecimal intervaloAtualizacaoTokenMinutos, Perfil perfil) {
        this.id = id;
        this.tokenTempoExpiracaoMinutos = tokenTempoExpiracaoMinutos;
        this.tempoTokenExibeDialogoMinutos = tempoTokenExibeDialogoMinutos;
        this.tempoExibicaoDialogoAtualizaTokenMinutos = tempoExibicaoDialogoAtualizaTokenMinutos;
        this.intervaloAtualizacaoTokenMinutos = intervaloAtualizacaoTokenMinutos;
        this.perfil = perfil;
    }

    public TokenTempoDTO(TokenTempo tokenTempo) {
        this.id = tokenTempo.getId();
        this.tokenTempoExpiracaoMinutos = tokenTempo.getTokenTempoExpiracaoMinutos();
        this.tempoTokenExibeDialogoMinutos = tokenTempo.getTempoTokenExibeDialogoMinutos();
        this.tempoExibicaoDialogoAtualizaTokenMinutos = tokenTempo.getTempoExibicaoDialogoAtualizaTokenMinutos();
        this.intervaloAtualizacaoTokenMinutos = tokenTempo.getIntervaloAtualizacaoTokenMinutos();
        this.perfil = tokenTempo.getPerfil();
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public BigDecimal getTokenTempoExpiracaoMinutos() {
        return tokenTempoExpiracaoMinutos;
    }

    public void setTokenTempoExpiracaoMinutos(BigDecimal tokenTempoExpiracaoMinutos) {
        this.tokenTempoExpiracaoMinutos = tokenTempoExpiracaoMinutos;
    }

    @Override
    public BigDecimal getTempoTokenExibeDialogoMinutos() {
        return tempoTokenExibeDialogoMinutos;
    }

    public void setTempoTokenExibeDialogoMinutos(BigDecimal tempoTokenExibeDialogoMinutos) {
        this.tempoTokenExibeDialogoMinutos = tempoTokenExibeDialogoMinutos;
    }

    @Override
    public BigDecimal getTempoExibicaoDialogoAtualizaTokenMinutos() {
        return tempoExibicaoDialogoAtualizaTokenMinutos;
    }

    public void setTempoExibicaoDialogoAtualizaTokenMinutos(BigDecimal tempoExibicaoDialogoAtualizaTokenMinutos) {
        this.tempoExibicaoDialogoAtualizaTokenMinutos = tempoExibicaoDialogoAtualizaTokenMinutos;
    }

    @Override
    public BigDecimal getIntervaloAtualizacaoTokenMinutos() {
        return intervaloAtualizacaoTokenMinutos;
    }

    public void setIntervaloAtualizacaoTokenMinutos(BigDecimal intervaloAtualizacaoTokenMinutos) {
        this.intervaloAtualizacaoTokenMinutos = intervaloAtualizacaoTokenMinutos;
    }

    public Perfil getPerfil() {
        return perfil;
    }

    public void setPerfil(Perfil perfil) {
        this.perfil = perfil;
    }

    public void setTokenTempoService(TokenTempoService tokenTempoService) {
        this.tokenTempoService = tokenTempoService;
    }

    public void setUserDetailsService(UserDetailsServiceImpl userDetailsService) {
        this.userDetailsService = userDetailsService;
    }

    public long getExpirationTimeInMillis(String email) {
        if (tokenTempoService == null || userDetailsService == null) {
            throw new IllegalStateException("TokenTempoService ou UserDetailsService não foi inicializado");
        }
        try {
            UserSS userSS = (UserSS) userDetailsService.loadUserByUsername(email);
            Integer userId = userSS.getId();
            Set<Perfil> perfis = userSS.getRoles().stream()
                    .map(Perfil::fromDescricao)
                    .collect(Collectors.toSet());
            Perfil perfilPrioritario = perfis.contains(Perfil.ADMIN) ? Perfil.ADMIN :
                    perfis.contains(Perfil.TECNICO) ? Perfil.TECNICO :
                            Perfil.CLIENTE;

            return tokenTempoService.getExpirationTimeInMillis(perfilPrioritario, userId);
        } catch (UsernameNotFoundException e) {
            throw new RuntimeException("Usuário não encontrado para o email: " + email, e);
        }
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        TokenTempoDTO that = (TokenTempoDTO) obj;
        return Objects.equals(id, that.id)
                && Objects.equals(tokenTempoExpiracaoMinutos, that.tokenTempoExpiracaoMinutos)
                && Objects.equals(tempoTokenExibeDialogoMinutos, that.tempoTokenExibeDialogoMinutos)
                && Objects.equals(tempoExibicaoDialogoAtualizaTokenMinutos, that.tempoExibicaoDialogoAtualizaTokenMinutos)
                && Objects.equals(intervaloAtualizacaoTokenMinutos, that.intervaloAtualizacaoTokenMinutos)
                && perfil == that.perfil;
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, tokenTempoExpiracaoMinutos, tempoTokenExibeDialogoMinutos, tempoExibicaoDialogoAtualizaTokenMinutos, intervaloAtualizacaoTokenMinutos, perfil);
    }

    @Override
    public String toString() {
        return "TokenTempoDTO{" +
                "id=" + id +
                ", tokenTempoExpiracaoMinutos=" + tokenTempoExpiracaoMinutos +
                ", tempoTokenExibeDialogoMinutos=" + tempoTokenExibeDialogoMinutos +
                ", tempoExibicaoDialogoAtualizaTokenMinutos=" + tempoExibicaoDialogoAtualizaTokenMinutos +
                ", intervaloAtualizacaoTokenMinutos=" + intervaloAtualizacaoTokenMinutos +
                ", perfil=" + perfil +
                '}';
    }
}
