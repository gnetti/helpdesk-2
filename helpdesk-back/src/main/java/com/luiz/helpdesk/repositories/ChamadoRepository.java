package com.luiz.helpdesk.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import com.luiz.helpdesk.domain.Chamado;

public interface ChamadoRepository extends JpaRepository<Chamado, Integer> {
    boolean existsByTecnicoId(Integer id);
}
