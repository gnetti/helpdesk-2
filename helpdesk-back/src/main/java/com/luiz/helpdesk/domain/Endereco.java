package com.luiz.helpdesk.domain;

import javax.persistence.*;

import com.luiz.helpdesk.domain.dtos.EnderecoDTO;
import com.luiz.helpdesk.repositories.PessoaRepository;

@Entity
@Table(name = "pessoaEndereco")
public class Endereco {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String cep;
    private String uf;
    private String localidade;
    private String logradouro;
    private String numero;
    private String bairro;
    private String complemento;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "pessoaId")
    private Pessoa pessoa;

    public Endereco() {
    }

    public Endereco(EnderecoDTO objDTO) {
        this.cep = objDTO.getCep();
        this.uf = objDTO.getUf();
        this.localidade = objDTO.getLocalidade();
        this.logradouro = objDTO.getLogradouro();
        this.numero = objDTO.getNumero();
        this.bairro = objDTO.getBairro();
        this.complemento = objDTO.getComplemento();
    }

    public Endereco(String cep, String uf, String localidade, String logradouro, String numero, String bairro, String complemento, Pessoa pessoa) {
        this.cep = cep;
        this.uf = uf;
        this.localidade = localidade;
        this.logradouro = logradouro;
        this.numero = numero;
        this.bairro = bairro;
        this.complemento = complemento;
        this.pessoa = pessoa;
    }

    public Endereco(EnderecoDTO enderecoDTO, Tecnico tecnico) {
        this.cep = enderecoDTO.getCep();
        this.uf = enderecoDTO.getUf();
        this.localidade = enderecoDTO.getLocalidade();
        this.logradouro = enderecoDTO.getLogradouro();
        this.numero = enderecoDTO.getNumero();
        this.bairro = enderecoDTO.getBairro();
        this.complemento = enderecoDTO.getComplemento();
        this.pessoa = tecnico;
    }

    public Endereco(EnderecoDTO enderecoDTO, Cliente cliente) {
        this.cep = enderecoDTO.getCep();
        this.uf = enderecoDTO.getUf();
        this.localidade = enderecoDTO.getLocalidade();
        this.logradouro = enderecoDTO.getLogradouro();
        this.numero = enderecoDTO.getNumero();
        this.bairro = enderecoDTO.getBairro();
        this.complemento = enderecoDTO.getComplemento();
        this.pessoa = cliente;
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

    public Pessoa getPessoa() {
        return pessoa;
    }

    public void setPessoa(Pessoa pessoa) {
        this.pessoa = pessoa;
    }

    public void updateFromDTO(EnderecoDTO objDTO) {
        this.cep = objDTO.getCep();
        this.uf = objDTO.getUf();
        this.localidade = objDTO.getLocalidade();
        this.logradouro = objDTO.getLogradouro();
        this.numero = objDTO.getNumero();
        this.bairro = objDTO.getBairro();
        this.complemento = objDTO.getComplemento();
    }

    public void setPessoaId(Integer id, PessoaRepository pessoaRepository) {
        if (id != null) {
            Pessoa pessoa = pessoaRepository.findById(id).orElse(null);

            this.pessoa = pessoa;
        } else {
            this.pessoa = null;
        }
    }


}
