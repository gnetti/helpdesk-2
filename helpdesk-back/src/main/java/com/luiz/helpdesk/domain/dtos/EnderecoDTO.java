package com.luiz.helpdesk.domain.dtos;

import java.io.Serializable;

import javax.validation.constraints.NotBlank;

import com.luiz.helpdesk.domain.Endereco;

public class EnderecoDTO implements Serializable {
    private static final long serialVersionUID = 1L;

    private Integer id;

    @NotBlank(message = "O campo CEP é requerido")
    private String cep;

    @NotBlank(message = "O campo UF é requerido")
    private String uf;

    @NotBlank(message = "O campo Localidade é requerido")
    private String localidade;

    @NotBlank(message = "O campo Logradouro é requerido")
    private String logradouro;

    @NotBlank(message = "O campo Número é requerido")
    private String numero;

    private String bairro;
    private String complemento;

    // Adicionando o campo Pessoa
    private Integer pessoaId;

    public EnderecoDTO() {
        super();
    }

    public EnderecoDTO(Endereco obj) {
        this.id = obj.getId();
        this.cep = obj.getCep();
        this.uf = obj.getUf();
        this.localidade = obj.getLocalidade();
        this.logradouro = obj.getLogradouro();
        this.numero = obj.getNumero();
        this.bairro = obj.getBairro();
        this.complemento = obj.getComplemento();
        if (obj.getPessoa() != null) {
            this.pessoaId = obj.getPessoa().getId();
        }
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getCep() {
        return cep;
    }

    public void setCep(String cep) {
        this.cep = cep;
    }

    public String getUf() {
        return uf;
    }

    public void setUf(String uf) {
        this.uf = uf;
    }

    public String getLocalidade() {
        return localidade;
    }

    public void setLocalidade(String localidade) {
        this.localidade = localidade;
    }

    public String getLogradouro() {
        return logradouro;
    }

    public void setLogradouro(String logradouro) {
        this.logradouro = logradouro;
    }

    public String getNumero() {
        return numero;
    }

    public void setNumero(String numero) {
        this.numero = numero;
    }

    public String getBairro() {
        return bairro;
    }

    public void setBairro(String bairro) {
        this.bairro = bairro;
    }

    public String getComplemento() {
        return complemento;
    }

    public void setComplemento(String complemento) {
        this.complemento = complemento;
    }

    public Integer getPessoaId() {
        return pessoaId;
    }

    public void setPessoaId(Integer pessoaId) {
        this.pessoaId = pessoaId;
    }
}
