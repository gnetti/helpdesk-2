package com.luiz.helpdesk.domain;

import javax.persistence.*;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Entity
@Table(name = "chamadoObservacao")
public class Observacao implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String dataObservacao;
    private String observacao;
    private Integer chamadoStatus;
    private Integer tecnicoResponsavelId;
    private String tecnicoResponsavelNome;

    @ManyToOne
    @JoinColumn(name = "chamadoId")
    private Chamado chamado;

    public Observacao() {
        this.dataObservacao = LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss"));
    }

    public Observacao(String dataObservacao, String observacao) {
        this.dataObservacao = dataObservacao;
        this.observacao = observacao;
    }

    public Observacao(String dataObservacao, String observacao, Chamado chamado) {
        this.dataObservacao = dataObservacao;
        this.observacao = observacao;
        this.chamado = chamado;
        this.chamadoStatus = chamado.getStatus().getCodigo();
    }

    public Observacao(String dataObservacao, String observacao, Chamado chamado, Integer chamadoStatus, Integer tecnicoResponsavelId, String tecnicoResponsavelNome) {
        this.dataObservacao = dataObservacao;
        this.observacao = observacao;
        this.chamado = chamado;
        this.chamadoStatus = chamadoStatus;
        this.tecnicoResponsavelId = tecnicoResponsavelId;
        this.tecnicoResponsavelNome = tecnicoResponsavelNome;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getDataObservacao() {
        return dataObservacao;
    }

    public void setDataObservacao(String dataObservacao) {
        this.dataObservacao = dataObservacao;
    }

    public String getObservacao() {
        return observacao;
    }

    public void setObservacao(String observacao) {
        this.observacao = observacao;
    }

    public Chamado getChamado() {
        return chamado;
    }

    public void setChamado(Chamado chamado) {
        this.chamado = chamado;
        this.chamadoStatus = chamado.getStatus().getCodigo();
    }

    public Integer getChamadoStatus() {
        return chamadoStatus;
    }

    public void setChamadoStatus(Integer chamadoStatus) {
        this.chamadoStatus = chamadoStatus;
    }

    public Integer getTecnicoResponsavelId() {
        return tecnicoResponsavelId;
    }

    public void setTecnicoResponsavelId(Integer tecnicoResponsavelId) {
        this.tecnicoResponsavelId = tecnicoResponsavelId;
        // Consider fetching the name of the technician based on ID here, if possible.
    }

    public String getTecnicoResponsavelNome() {
        return tecnicoResponsavelNome;
    }

    public void setTecnicoResponsavelNome(String tecnicoResponsavelNome) {
        this.tecnicoResponsavelNome = tecnicoResponsavelNome;
    }
}
