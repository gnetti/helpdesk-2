package com.luiz.helpdesk.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import com.luiz.helpdesk.domain.TokenTempo;
import com.luiz.helpdesk.domain.enums.Perfil;

import java.util.Optional;

public interface TokenTempoRepository extends JpaRepository<TokenTempo, Integer> {
    Optional<TokenTempo> findByPerfil(Perfil perfil);

}
