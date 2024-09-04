package com.luiz.helpdesk.repositories;

import com.luiz.helpdesk.domain.Endereco;
import com.luiz.helpdesk.domain.Pessoa;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EnderecoRepository extends JpaRepository<Endereco, Integer> {


}
