package com.luiz.helpdesk.domain.dtos;

import com.luiz.helpdesk.domain.enums.Perfil;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Objects;

public class TokenTempoDTO implements Serializable {
    private static final long serialVersionUID = 1L;

    private Integer id;
    private BigDecimal tempoAvisoExpiracaoMinutos;
    private BigDecimal tempoExibicaoDialogoMinutos;
    private BigDecimal intervaloAtualizacaoMinutos;
    private BigDecimal jwtExpiracao;
    private Perfil perfil;

    public TokenTempoDTO() {
    }

    public TokenTempoDTO(Integer id, BigDecimal tempoAvisoExpiracaoMinutos, BigDecimal tempoExibicaoDialogoMinutos, BigDecimal intervaloAtualizacaoMinutos, BigDecimal jwtExpiracao, Perfil perfil) {
        this.id = id;
        this.tempoAvisoExpiracaoMinutos = tempoAvisoExpiracaoMinutos;
        this.tempoExibicaoDialogoMinutos = tempoExibicaoDialogoMinutos;
        this.intervaloAtualizacaoMinutos = intervaloAtualizacaoMinutos;
        this.jwtExpiracao = jwtExpiracao;
        this.perfil = perfil;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public BigDecimal getTempoAvisoExpiracaoMinutos() {
        return tempoAvisoExpiracaoMinutos;
    }

    public void setTempoAvisoExpiracaoMinutos(BigDecimal tempoAvisoExpiracaoMinutos) {
        this.tempoAvisoExpiracaoMinutos = tempoAvisoExpiracaoMinutos;
    }

    public BigDecimal getTempoExibicaoDialogoMinutos() {
        return tempoExibicaoDialogoMinutos;
    }

    public void setTempoExibicaoDialogoMinutos(BigDecimal tempoExibicaoDialogoMinutos) {
        this.tempoExibicaoDialogoMinutos = tempoExibicaoDialogoMinutos;
    }

    public BigDecimal getIntervaloAtualizacaoMinutos() {
        return intervaloAtualizacaoMinutos;
    }

    public void setIntervaloAtualizacaoMinutos(BigDecimal intervaloAtualizacaoMinutos) {
        this.intervaloAtualizacaoMinutos = intervaloAtualizacaoMinutos;
    }

    public BigDecimal getJwtExpiracao() {
        return jwtExpiracao;
    }

    public void setJwtExpiracao(BigDecimal jwtExpiracao) {
        this.jwtExpiracao = jwtExpiracao;
    }

    public Perfil getPerfil() {
        return perfil;
    }

    public void setPerfil(Perfil perfil) {
        this.perfil = perfil;
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        TokenTempoDTO that = (TokenTempoDTO) obj;
        return Objects.equals(id, that.id)
                && Objects.equals(tempoAvisoExpiracaoMinutos, that.tempoAvisoExpiracaoMinutos)
                && Objects.equals(tempoExibicaoDialogoMinutos, that.tempoExibicaoDialogoMinutos)
                && Objects.equals(intervaloAtualizacaoMinutos, that.intervaloAtualizacaoMinutos)
                && Objects.equals(jwtExpiracao, that.jwtExpiracao)
                && perfil == that.perfil;
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, tempoAvisoExpiracaoMinutos, tempoExibicaoDialogoMinutos, intervaloAtualizacaoMinutos, jwtExpiracao, perfil);
    }

    @Override
    public String toString() {
        return "TokenTempoDTO{" +
                "id=" + id +
                ", tempoAvisoExpiracaoMinutos=" + tempoAvisoExpiracaoMinutos +
                ", tempoExibicaoDialogoMinutos=" + tempoExibicaoDialogoMinutos +
                ", intervaloAtualizacaoMinutos=" + intervaloAtualizacaoMinutos +
                ", jwtExpiracao=" + jwtExpiracao +
                ", perfil=" + perfil +
                '}';
    }
}
