package com.luiz.helpdesk.services;

import com.luiz.helpdesk.domain.Pessoa;
import com.luiz.helpdesk.domain.dtos.PessoaDTO;
import com.luiz.helpdesk.repositories.PessoaRepository;
import com.luiz.helpdesk.security.UserSS;
import com.luiz.helpdesk.services.exceptions.DataIntegrityViolationException;
import com.luiz.helpdesk.services.exceptions.ForbiddenException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import javax.validation.Valid;

@Service
public class PessoaService {

    @Autowired
    private PessoaRepository pessoaRepository;

    @Autowired
    private AuthService authService;

    @Autowired
    private BCryptPasswordEncoder encoder;

    @Autowired
    private DecryptionService decryptionService;

    @Transactional
    public PessoaDTO update(Integer id, @Valid PessoaDTO pessoaDTO) {
        UserSS authenticatedUser = authService.getAuthenticatedUser();

        if (!authenticatedUser.getId().equals(id)) {
            throw new ForbiddenException("Acesso negado: Você só pode editar seus próprios dados.");
        }
        Pessoa oldObj = findById(id);
        if (pessoaDTO.getSenhaAtual() != null && !pessoaDTO.getSenhaAtual().isEmpty()) {
            String decryptedCurrentPassword = decryptPassword(pessoaDTO.getSenhaAtual());
            if (!encoder.matches(decryptedCurrentPassword, oldObj.getSenha())) {
                throw new DataIntegrityViolationException("Senha atual incorreta.");
            }
        }
        String newEncodedPassword = processNewPassword(pessoaDTO.getSenhaNova());
        updateData(oldObj, pessoaDTO, newEncodedPassword);
        Pessoa updatedPessoa = pessoaRepository.save(oldObj);
        return new PessoaDTO(updatedPessoa);
    }

    private String decryptPassword(String encryptedPassword) {
        if (encryptedPassword == null || encryptedPassword.isEmpty()) {
            return null;
        }
        try {
            return decryptionService.decrypt(encryptedPassword);
        } catch (Exception e) {
            throw new DataIntegrityViolationException("Erro ao descriptografar a senha.");
        }
    }

    private String processNewPassword(String newPassword) {
        if (newPassword == null || newPassword.isEmpty()) {
            return null;
        }
        try {
            String decryptedNewPassword = decryptionService.decrypt(newPassword);
            return encoder.encode(decryptedNewPassword);
        } catch (Exception e) {
            throw new DataIntegrityViolationException("Erro ao descriptografar a nova senha.");
        }
    }

    private void updateData(Pessoa pessoa, PessoaDTO pessoaDTO, String newEncodedPassword) {
        if (pessoaDTO.getTema() != null && !pessoaDTO.getTema().isEmpty()) {
            pessoa.setTema(pessoaDTO.getTema());
        }
        if (newEncodedPassword != null) {
            pessoa.setSenha(newEncodedPassword);
        }
    }

    public Pessoa findById(Integer id) {
        return pessoaRepository.findById(id)
                .orElseThrow(() -> new DataIntegrityViolationException("Pessoa não encontrada! Id: " + id));
    }

    public Integer getAuthenticatedUserId() {
        return authService.getAuthenticatedUser().getId();
    }
}
