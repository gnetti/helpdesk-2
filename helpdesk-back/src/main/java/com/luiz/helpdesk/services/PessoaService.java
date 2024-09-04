package com.luiz.helpdesk.services;

import com.luiz.helpdesk.domain.Pessoa;
import com.luiz.helpdesk.domain.dtos.PessoaDTO;
import com.luiz.helpdesk.repositories.PessoaRepository;
import com.luiz.helpdesk.security.UserSS;
import com.luiz.helpdesk.services.exceptions.DataIntegrityViolationException;
import com.luiz.helpdesk.services.exceptions.ForbiddenException;
import com.luiz.helpdesk.services.exceptions.ObjectnotFoundException;
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
        String decryptedCurrentPassword = decryptPassword(pessoaDTO.getSenhaAtual());

        if (decryptedCurrentPassword != null && !encoder.matches(decryptedCurrentPassword, oldObj.getSenha())) {
            throw new DataIntegrityViolationException("Senha atual incorreta.");
        }

        String newEncodedPassword = processNewPassword(pessoaDTO.getSenha());

        if (newEncodedPassword != null && encoder.matches(decryptedCurrentPassword, newEncodedPassword)) {
            throw new DataIntegrityViolationException("A nova senha não pode ser a mesma que a senha atual.");
        }

        pessoaDTO.setSenha(newEncodedPassword);
        updateData(oldObj, pessoaDTO);
        Pessoa updatedPessoa = pessoaRepository.save(oldObj);

        return new PessoaDTO(updatedPessoa);
    }

    private String decryptPassword(String encryptedPassword) {
        if (encryptedPassword == null) {
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

    private void updateData(Pessoa pessoa, PessoaDTO pessoaDTO) {
        if (pessoaDTO.getTema() != null && !pessoaDTO.getTema().isEmpty()) {
            pessoa.setTema(pessoaDTO.getTema());
        }
        if (pessoaDTO.getSenha() != null && !pessoaDTO.getSenha().isEmpty()) {
            pessoa.setSenha(pessoaDTO.getSenha());
        }
    }

    public Pessoa findById(Integer id) {
        return pessoaRepository.findById(id)
                .orElseThrow(() -> new ObjectnotFoundException("Pessoa não encontrada! Id: " + id));
    }

    public Integer getAuthenticatedUserId() {
        return authService.getAuthenticatedUser().getId();
    }
}
