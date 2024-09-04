package com.luiz.helpdesk.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.luiz.helpdesk.domain.dtos.TecnicoDTO;
import com.luiz.helpdesk.domain.enums.Perfil;

import javax.persistence.Entity;
import javax.persistence.OneToMany;
import javax.persistence.OneToOne;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;

@Entity
public class Tecnico extends Pessoa {
    private static final long serialVersionUID = 1L;

    @JsonIgnore
    @OneToMany(mappedBy = "tecnico")
    private List<Chamado> chamados = new ArrayList<>();

    @OneToOne(mappedBy = "tecnico", cascade = javax.persistence.CascadeType.ALL)
    private Endereco endereco;

    private String tema;

    public Tecnico() {
        super();
        addPerfil(Perfil.TECNICO);
        setTema("indigoPink");
    }

    public Tecnico(Integer id, String nome, String cpf, String email, String senha) {
        super(id, nome, cpf, email, senha);
    }

    public Tecnico(TecnicoDTO obj) {
        super(obj.getId(), obj.getNome(), obj.getCpf(), obj.getEmail(), obj.getSenha());
        this.perfis = new HashSet<>(obj.getPerfis());
        this.dataCriacao = obj.getDataCriacao();
        this.tema = obj.getTema() != null ? obj.getTema() : "indigoPink";
        if (obj.getEndereco() != null) {
            this.endereco = new Endereco(obj.getEndereco(), this);
        }
    }

    public List<Chamado> getChamados() {
        return chamados;
    }

    public void setChamados(List<Chamado> chamados) {
        this.chamados = chamados;
    }

    public void updateFromDTO(TecnicoDTO objDTO) {
        this.nome = objDTO.getNome();
        this.cpf = objDTO.getCpf();
        this.email = objDTO.getEmail();
        this.senha = objDTO.getSenha();
        this.perfis = new HashSet<>(objDTO.getPerfis());
        this.tema = objDTO.getTema();

        if (objDTO.getEndereco() != null) {
            if (this.endereco == null) {
                this.endereco = new Endereco(objDTO.getEndereco(), this);
            } else {
                this.endereco.updateFromDTO(objDTO.getEndereco());
                this.endereco.setPessoa(this);
            }
        }
    }

    public void setEndereco(Endereco endereco) {
        this.endereco = endereco;
        if (endereco != null) {
            endereco.setPessoa(this);
        }
    }

    public Endereco getEndereco() {
        return endereco;
    }

    public String getTema() {
        return tema;
    }

    public void setTema(String tema) {
        this.tema = tema;
    }
}
