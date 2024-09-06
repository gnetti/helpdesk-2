package com.luiz.helpdesk.services;

import com.luiz.helpdesk.domain.TokenTempo;
import com.luiz.helpdesk.domain.dtos.TokenTempoDTO;
import com.luiz.helpdesk.domain.enums.Perfil;
import com.luiz.helpdesk.repositories.TokenTempoRepository;
import com.luiz.helpdesk.security.UserSS;
import com.luiz.helpdesk.services.exceptions.DataIntegrityViolationException;
import com.luiz.helpdesk.services.exceptions.ForbiddenException;
import com.luiz.helpdesk.services.exceptions.ObjectnotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import javax.validation.Valid;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TokenTimeService {

    @Autowired
    private TokenTempoRepository tokenTimeRepository;

    @Autowired
    private AuthService authService;

    private void checkAuthorization() {
        UserSS authenticatedUser = authService.getAuthenticatedUser();
        if (!authenticatedUser.getId().equals(1)) {
            throw new ForbiddenException("Acesso negado: Apenas o Administrador pode acessar este recurso.");
        }
    }

    @Transactional
    public TokenTempoDTO create(TokenTempoDTO objDTO) {
        checkAuthorization();
        Optional<TokenTempo> existingTokenTempo = tokenTimeRepository.findByPerfil(objDTO.getPerfil());
        if (existingTokenTempo.isPresent()) {
            throw new DataIntegrityViolationException("Já existe um registro para o perfil " + objDTO.getPerfil() + ".");
        }
        objDTO.setId(null);
        TokenTempo tokenTime = new TokenTempo(
                objDTO.getId(),
                objDTO.getTempoAvisoExpiracaoMinutos(),
                objDTO.getTempoExibicaoDialogoMinutos(),
                objDTO.getIntervaloAtualizacaoMinutos(),
                objDTO.getJwtExpiracao(),
                objDTO.getPerfil()
        );
        tokenTime = tokenTimeRepository.save(tokenTime);
        return toDTO(tokenTime);
    }

    @Transactional
    public TokenTempoDTO update(Integer id, @Valid TokenTempoDTO objDTO) {
        checkAuthorization();
        TokenTempo oldObj = tokenTimeRepository.findById(id)
                .orElseThrow(() -> new ObjectnotFoundException("Objeto não encontrado! Id: " + id));
        oldObj.setTempoAvisoExpiracaoMinutos(objDTO.getTempoAvisoExpiracaoMinutos());
        oldObj.setTempoExibicaoDialogoMinutos(objDTO.getTempoExibicaoDialogoMinutos());
        oldObj.setIntervaloAtualizacaoMinutos(objDTO.getIntervaloAtualizacaoMinutos());
        oldObj.setJwtExpiracao(objDTO.getJwtExpiracao());
        oldObj = tokenTimeRepository.save(oldObj);
        return toDTO(oldObj);
    }

    public TokenTempoDTO findDTOById(Integer id) {
        checkAuthorization();
        TokenTempo tokenTime = tokenTimeRepository.findById(id)
                .orElseThrow(() -> new ObjectnotFoundException("Objeto não encontrado! Id: " + id));
        return toDTO(tokenTime);
    }

    public boolean existsByPerfil(String perfil) {
        return tokenTimeRepository.findByPerfil(Perfil.valueOf(perfil)).isPresent();
    }

    public List<TokenTempoDTO> findAll() {
        checkAuthorization();
        List<TokenTempo> tokenTimes = tokenTimeRepository.findAll();
        return tokenTimes.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    private TokenTempoDTO toDTO(TokenTempo tokenTempo) {
        return new TokenTempoDTO(
                tokenTempo.getId(),
                tokenTempo.getTempoAvisoExpiracaoMinutos(),
                tokenTempo.getTempoExibicaoDialogoMinutos(),
                tokenTempo.getIntervaloAtualizacaoMinutos(),
                tokenTempo.getJwtExpiracao(),
                tokenTempo.getPerfil()
        );
    }
}
