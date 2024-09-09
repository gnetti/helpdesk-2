package com.luiz.helpdesk.domain.dtos;

import com.luiz.helpdesk.domain.TokenTempo;
import com.luiz.helpdesk.domain.enums.Perfil;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Objects;

public class TokenTempoDTO implements Serializable {
    private static final long serialVersionUID = 1L;

    private Integer id;
    private BigDecimal tokenTempoExpiracaoMinutos;
    private BigDecimal tempoTokenExibeDialogoMinutos;
    private BigDecimal tempoExibicaoDialogoAtualizaTokenMinutos;
    private BigDecimal intervaloAtualizacaoTokenMinutos;
    private Perfil perfil;

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

    public BigDecimal getTempoTokenExibeDialogoMinutos() {
        return tempoTokenExibeDialogoMinutos;
    }

    public void setTempoTokenExibeDialogoMinutos(BigDecimal tempoTokenExibeDialogoMinutos) {
        this.tempoTokenExibeDialogoMinutos = tempoTokenExibeDialogoMinutos;
    }

    public BigDecimal getTempoExibicaoDialogoAtualizaTokenMinutos() {
        return tempoExibicaoDialogoAtualizaTokenMinutos;
    }

    public void setTempoExibicaoDialogoAtualizaTokenMinutos(BigDecimal tempoExibicaoDialogoAtualizaTokenMinutos) {
        this.tempoExibicaoDialogoAtualizaTokenMinutos = tempoExibicaoDialogoAtualizaTokenMinutos;
    }

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
