package com.luiz.helpdesk.domain.dtos;

import com.luiz.helpdesk.domain.Observacao;

public class ObservacaoDTO {

    private Integer id;
    private String dataObservacao;
    private String observacao;
    private Integer chamadoStatus;
    private Integer tecnicoResponsavelId;
    private String tecnicoResponsavelNome;
    private Integer chamadoId;

    public ObservacaoDTO() {
    }

    public ObservacaoDTO(Observacao observacao) {
        this.id = observacao.getId();
        this.dataObservacao = observacao.getDataObservacao();
        this.observacao = observacao.getObservacao();
        this.chamadoStatus = observacao.getChamadoStatus();
        this.tecnicoResponsavelId = observacao.getTecnicoResponsavelId();
        this.tecnicoResponsavelNome = observacao.getTecnicoResponsavelNome();
        if (observacao.getChamado() != null) {
            this.chamadoId = observacao.getChamado().getId();
        }
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
    }

    public String getTecnicoResponsavelNome() {
        return tecnicoResponsavelNome;
    }

    public void setTecnicoResponsavelNome(String tecnicoResponsavelNome) {
        this.tecnicoResponsavelNome = tecnicoResponsavelNome;
    }

    public Integer getChamadoId() {
        return chamadoId;
    }

    public void setChamadoId(Integer chamadoId) {
        this.chamadoId = chamadoId;
    }
}
