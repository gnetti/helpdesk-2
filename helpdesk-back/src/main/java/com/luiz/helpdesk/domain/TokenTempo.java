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
    private BigDecimal tempoAvisoExpiracaoMinutos;
    private BigDecimal tempoExibicaoDialogoMinutos;
    private BigDecimal intervaloAtualizacaoMinutos;
    private BigDecimal jwtExpiracao;
    private Perfil perfil;

    public TokenTempo() {
    }

    public TokenTempo(Integer id, BigDecimal tempoAvisoExpiracaoMinutos, BigDecimal tempoExibicaoDialogoMinutos, BigDecimal intervaloAtualizacaoMinutos, BigDecimal jwtExpiracao, Perfil perfil) { // Alterado no construtor
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
        if (this == obj) {
            return true;
        }
        if (obj == null || getClass() != obj.getClass()) {
            return false;
        }
        TokenTempo other = (TokenTempo) obj;
        return Objects.equals(id, other.id)
                && Objects.equals(tempoAvisoExpiracaoMinutos, other.tempoAvisoExpiracaoMinutos)
                && Objects.equals(tempoExibicaoDialogoMinutos, other.tempoExibicaoDialogoMinutos)
                && Objects.equals(intervaloAtualizacaoMinutos, other.intervaloAtualizacaoMinutos)
                && Objects.equals(jwtExpiracao, other.jwtExpiracao)
                && perfil == other.perfil;
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, tempoAvisoExpiracaoMinutos, tempoExibicaoDialogoMinutos, intervaloAtualizacaoMinutos, jwtExpiracao, perfil); // Alterado para jwtExpiracao
    }
}
