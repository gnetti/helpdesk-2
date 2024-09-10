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
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TokenTempoService {

    @Autowired
    private TokenTempoRepository tokenTempoRepository;

    @Autowired
    private AuthService authService;

    private static final long ADMIN_EXPIRATION_TIME_MINUTES = 1440;

    private void checkAuthorization() {
        UserSS authenticatedUser = authService.getAuthenticatedUser();
        if (!authenticatedUser.getId().equals(1)) {
            throw new ForbiddenException("Acesso negado: Apenas o Administrador pode acessar este recurso.");
        }
    }

    @Transactional
    public TokenTempoDTO create(TokenTempoDTO objDTO) {
        checkAuthorization();
        Optional<TokenTempo> existingTokenTempo = tokenTempoRepository.findByPerfil(objDTO.getPerfil());
        if (existingTokenTempo.isPresent()) {
            throw new DataIntegrityViolationException("Já existe um registro para o perfil " + objDTO.getPerfil() + ".");
        }
        objDTO.setId(null);
        TokenTempo tokenTempo = new TokenTempo(
                objDTO.getId(),
                objDTO.getTokenTempoExpiracaoMinutos(),
                objDTO.getTempoTokenExibeDialogoMinutos(),
                objDTO.getTempoExibicaoDialogoAtualizaTokenMinutos(),
                objDTO.getIntervaloAtualizacaoTokenMinutos(),
                objDTO.getPerfil()
        );
        tokenTempo = tokenTempoRepository.save(tokenTempo);
        return toDTO(tokenTempo);
    }

    @Transactional
    public TokenTempoDTO update(Integer id, @Valid TokenTempoDTO objDTO) {
        checkAuthorization();
        TokenTempo oldObj = tokenTempoRepository.findById(id)
                .orElseThrow(() -> new ObjectnotFoundException("Objeto não encontrado! Id: " + id));
        oldObj.setTokenTempoExpiracaoMinutos(objDTO.getTokenTempoExpiracaoMinutos());
        oldObj.setTempoTokenExibeDialogoMinutos(objDTO.getTempoTokenExibeDialogoMinutos());
        oldObj.setTempoExibicaoDialogoAtualizaTokenMinutos(objDTO.getTempoExibicaoDialogoAtualizaTokenMinutos());
        oldObj.setIntervaloAtualizacaoTokenMinutos(objDTO.getIntervaloAtualizacaoTokenMinutos());
        oldObj = tokenTempoRepository.save(oldObj);
        return toDTO(oldObj);
    }

    public Optional<TokenTempoDTO> findByPerfil(Perfil perfil) {
        checkAuthorization();
        Optional<TokenTempo> tokenTempo = tokenTempoRepository.findByPerfil(perfil);
        return tokenTempo.map(this::toDTO);
    }

    public boolean existsByPerfil(String perfil) {
        return tokenTempoRepository.findByPerfil(Perfil.valueOf(perfil)).isPresent();
    }

    public List<TokenTempoDTO> findAll() {
        checkAuthorization();
        List<TokenTempo> tokenTempos = tokenTempoRepository.findAll();
        return tokenTempos.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    private TokenTempoDTO toDTO(TokenTempo tokenTempo) {
        return new TokenTempoDTO(
                tokenTempo.getId(),
                tokenTempo.getTokenTempoExpiracaoMinutos(),
                tokenTempo.getTempoTokenExibeDialogoMinutos(),
                tokenTempo.getTempoExibicaoDialogoAtualizaTokenMinutos(),
                tokenTempo.getIntervaloAtualizacaoTokenMinutos(),
                tokenTempo.getPerfil()
        );
    }

    public long getExpirationTimeInMillis(Perfil perfil, Integer userId) {
        if (userId != null && userId == 1) {
            return convertToMilliseconds(BigDecimal.valueOf(ADMIN_EXPIRATION_TIME_MINUTES));
        }
        TokenTempo tokenTempo = tokenTempoRepository.findByPerfil(perfil)
                .orElseThrow(() -> new ObjectnotFoundException("Tempo de expiração não encontrado para o perfil: " + perfil));

        return convertToMilliseconds(tokenTempo.getTokenTempoExpiracaoMinutos());
    }

    private long convertToMilliseconds(BigDecimal minutes) {
        BigDecimal normalizedMinutes = minutes.stripTrailingZeros();
        double minutesValue = normalizedMinutes.doubleValue();
        return (long) (minutesValue * 60 * 1000);
    }
}
