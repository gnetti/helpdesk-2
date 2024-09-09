package com.luiz.helpdesk.domain;

import com.luiz.helpdesk.domain.enums.Perfil;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Objects;

@Entity
public class TokenTempo implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    private BigDecimal tokenTempoExpiracaoMinutos;
    private BigDecimal tempoTokenExibeDialogoMinutos;
    private BigDecimal tempoExibicaoDialogoAtualizaTokenMinutos;
    private BigDecimal intervaloAtualizacaoTokenMinutos;
    private Perfil perfil;

    public TokenTempo() {
    }

    public TokenTempo(Integer id, BigDecimal tokenTempoExpiracaoMinutos, BigDecimal tempoTokenExibeDialogoMinutos, BigDecimal tempoExibicaoDialogoAtualizaTokenMinutos, BigDecimal intervaloAtualizacaoTokenMinutos, Perfil perfil) {
        this.id = id;
        this.tokenTempoExpiracaoMinutos = tokenTempoExpiracaoMinutos;
        this.tempoTokenExibeDialogoMinutos = tempoTokenExibeDialogoMinutos;
        this.tempoExibicaoDialogoAtualizaTokenMinutos = tempoExibicaoDialogoAtualizaTokenMinutos;
        this.intervaloAtualizacaoTokenMinutos = intervaloAtualizacaoTokenMinutos;
        this.perfil = perfil;
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
        if (this == obj) {
            return true;
        }
        if (obj == null || getClass() != obj.getClass()) {
            return false;
        }
        TokenTempo other = (TokenTempo) obj;
        return Objects.equals(id, other.id)
                && Objects.equals(tokenTempoExpiracaoMinutos, other.tokenTempoExpiracaoMinutos)
                && Objects.equals(tempoTokenExibeDialogoMinutos, other.tempoTokenExibeDialogoMinutos)
                && Objects.equals(tempoExibicaoDialogoAtualizaTokenMinutos, other.tempoExibicaoDialogoAtualizaTokenMinutos)
                && Objects.equals(intervaloAtualizacaoTokenMinutos, other.intervaloAtualizacaoTokenMinutos)
                && perfil == other.perfil;
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, tokenTempoExpiracaoMinutos, tempoTokenExibeDialogoMinutos, tempoExibicaoDialogoAtualizaTokenMinutos, intervaloAtualizacaoTokenMinutos, perfil);
    }
}
