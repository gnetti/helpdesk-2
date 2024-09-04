package com.luiz.helpdesk.repositories;

import com.luiz.helpdesk.domain.Observacao;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ObservacaoRepository extends JpaRepository<Observacao, Integer> {
}
