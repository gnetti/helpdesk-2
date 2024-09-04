package com.luiz.helpdesk.domain.dtos;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotNull;

import org.hibernate.validator.constraints.br.CPF;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.luiz.helpdesk.domain.Cliente;
import com.luiz.helpdesk.domain.enums.Perfil;

public class ClienteDTO implements Serializable {
	private static final long serialVersionUID = 1L;

	protected Integer id;

	@NotNull(message = "O campo NOME é requerido")
	protected String nome;

	@NotNull(message = "O campo CPF é requerido")
	@CPF
	protected String cpf;

	@NotNull(message = "O campo EMAIL é requerido")
	@Email
	protected String email;

	@NotNull(message = "O campo SENHA é requerido")
	protected String senha;

	protected Set<Integer> perfis = new HashSet<>();

	@JsonFormat(pattern = "dd/MM/yyyy")
	protected LocalDate dataCriacao = LocalDate.now();

	protected EnderecoDTO endereco;

	protected String tema;

	public ClienteDTO() {
		super();
		addPerfil(Perfil.CLIENTE);
	}

	public ClienteDTO(Cliente obj) {
		super();
		this.id = obj.getId();
		this.nome = obj.getNome();
		this.cpf = obj.getCpf();
		this.email = obj.getEmail();
		this.senha = obj.getSenha();
		this.perfis = obj.getPerfis().stream()
				.map(Perfil::ordinal)
				.collect(Collectors.toSet());
		this.dataCriacao = obj.getDataCriacao();
		if (obj.getEndereco() != null) {
			this.endereco = new EnderecoDTO(obj.getEndereco());
			this.endereco.setPessoaId(obj.getId());
		}
		this.tema = obj.getTema();
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

	public String getCpf() {
		return cpf;
	}

	public void setCpf(String cpf) {
		this.cpf = cpf;
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

	public Set<Integer> getPerfis() {
		return perfis;
	}

	public void addPerfil(Perfil perfil) {
		this.perfis.add(perfil.getCodigo());
	}

	public LocalDate getDataCriacao() {
		return (dataCriacao != null) ? dataCriacao : LocalDate.now();
	}

	public EnderecoDTO getEndereco() {
		return endereco;
	}

	public void setEndereco(EnderecoDTO endereco) {
		this.endereco = endereco;
	}

	public String getTema() {
		return tema;
	}

	public void setTema(String tema) {
		this.tema = tema;
	}
}
