package com.luiz.helpdesk.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.luiz.helpdesk.domain.Cliente;

import java.util.List;
import java.util.Optional;

public interface ClienteRepository extends JpaRepository<Cliente, Integer> {

    List<Cliente> findByNomeContainingIgnoreCase(String nome);

    Optional<Cliente> findByCpf(String cpf);

    Optional<Cliente> findByEmail(String email);
}
