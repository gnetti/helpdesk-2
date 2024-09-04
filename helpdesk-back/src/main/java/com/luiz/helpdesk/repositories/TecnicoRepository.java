package com.luiz.helpdesk.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.luiz.helpdesk.domain.Tecnico;

import java.util.List;
import java.util.Optional;

public interface TecnicoRepository extends JpaRepository<Tecnico, Integer> {

    List<Tecnico> findByNomeContainingIgnoreCase(String nome);

    Optional<Tecnico> findByCpf(String cpf);

    Optional<Tecnico> findByEmail(String email);
}
