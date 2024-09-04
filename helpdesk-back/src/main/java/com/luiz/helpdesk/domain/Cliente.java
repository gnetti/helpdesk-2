package com.luiz.helpdesk.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.luiz.helpdesk.domain.dtos.ClienteDTO;
import com.luiz.helpdesk.domain.enums.Perfil;

import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.OneToMany;
import javax.persistence.OneToOne;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Entity
public class Cliente extends Pessoa {
    private static final long serialVersionUID = 1L;

    @JsonIgnore
    @OneToMany(mappedBy = "cliente")
    private List<Chamado> chamados = new ArrayList<>();

    @OneToOne
    @JoinColumn(name = "enderecoId")
    private Endereco endereco;

    private String tema;

    public Cliente() {
        super();
        addPerfil(Perfil.CLIENTE);
        setTema("indigoPink");
    }

    public Cliente(Integer id, String nome, String cpf, String email, String senha) {
        super(id, nome, cpf, email, senha);
    }

    public Cliente(ClienteDTO objDTO) {
        super();
        this.id = objDTO.getId();
        this.nome = objDTO.getNome();
        this.cpf = objDTO.getCpf();
        this.email = objDTO.getEmail();
        this.senha = objDTO.getSenha();
        this.perfis = objDTO.getPerfis();
        this.dataCriacao = objDTO.getDataCriacao();
        this.tema = objDTO.getTema() != null ? objDTO.getTema() : "indigoPink";
        if (objDTO.getEndereco() != null) {
            this.endereco = new Endereco(objDTO.getEndereco());
            this.endereco.setPessoa(this);
        }
    }

    public List<Chamado> getChamados() {
        return chamados;
    }

    public void setChamados(List<Chamado> chamados) {
        this.chamados = chamados;
    }

    public String getTema() {
        return tema;
    }

    public void setTema(String tema) {
        this.tema = tema;
    }

    public Endereco getEndereco() {
        return endereco;
    }

    public void setEndereco(Endereco endereco) {
        this.endereco = endereco;
        if (endereco != null) {
            endereco.setPessoa(this);
        }
    }

    public void setPerfis(Set<Perfil> perfis) {
        this.perfis = perfis.stream().map(Perfil::ordinal).collect(Collectors.toSet());
    }

    public void updateFromDTO(ClienteDTO objDTO) {
        this.nome = objDTO.getNome();
        this.cpf = objDTO.getCpf();
        this.email = objDTO.getEmail();
        this.senha = objDTO.getSenha();
        this.perfis = objDTO.getPerfis();
        this.tema = objDTO.getTema();
        if (objDTO.getEndereco() != null) {
            if (this.endereco == null) {
                this.endereco = new Endereco(objDTO.getEndereco());
                this.endereco.setPessoa(this);
            } else {
                this.endereco.updateFromDTO(objDTO.getEndereco());
                this.endereco.setPessoa(this);
            }
        }
    }
}
