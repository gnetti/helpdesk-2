package com.luiz.helpdesk.domain.dtos;

import com.luiz.helpdesk.config.validator.ValidPassword;
import com.luiz.helpdesk.domain.Pessoa;
import com.luiz.helpdesk.domain.enums.Perfil;

import javax.validation.constraints.Email;
import java.io.Serializable;
import java.util.Set;
import java.util.stream.Collectors;

public class PessoaDTO implements Serializable {
    private static final long serialVersionUID = 1L;

    private Integer id;
    private String nome;
    @Email
    private String email;
    @ValidPassword
    private String senha;
    @ValidPassword
    private String senhaAtual;
    @ValidPassword
    private String senhaNova;
    private String tema;
    private Set<String> roles;

    public PessoaDTO() {
        super();
    }

    public PessoaDTO(Pessoa pessoa) {
        this.id = pessoa.getId();
        this.nome = pessoa.getNome();
        this.email = pessoa.getEmail();
        this.senha = pessoa.getSenha();
        this.tema = pessoa.getTema();
        this.roles = pessoa.getPerfis().stream()
                .map(Perfil::getDescricao)
                .collect(Collectors.toSet());
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getSenha() {
        return senha;
    }

    public void setSenha(String senha) {
        this.senha = senha;
    }

    public String getSenhaAtual() {
        return senhaAtual;
    }

    public void setSenhaAtual(String senhaAtual) {
        this.senhaAtual = senhaAtual;
    }

    public String getSenhaNova() {
        return senhaNova;
    }

    public void setSenhaNova(String senhaNova) {
        this.senhaNova = senhaNova;
    }

    public String getTema() {
        return tema;
    }

    public void setTema(String tema) {
        this.tema = tema;
    }

    public Set<String> getRoles() {
        return roles;
    }

    public void setRoles(Set<String> roles) {
        this.roles = roles;
    }
}
