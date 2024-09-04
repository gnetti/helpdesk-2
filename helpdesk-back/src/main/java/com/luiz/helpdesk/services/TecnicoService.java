package com.luiz.helpdesk.services;

import com.luiz.helpdesk.domain.Endereco;
import com.luiz.helpdesk.domain.Tecnico;
import com.luiz.helpdesk.domain.dtos.EnderecoDTO;
import com.luiz.helpdesk.domain.dtos.TecnicoDTO;
import com.luiz.helpdesk.repositories.ChamadoRepository;
import com.luiz.helpdesk.repositories.EnderecoRepository;
import com.luiz.helpdesk.repositories.TecnicoRepository;
import com.luiz.helpdesk.security.UserSS;
import com.luiz.helpdesk.services.exceptions.DataIntegrityViolationException;
import com.luiz.helpdesk.services.exceptions.ForbiddenException;
import com.luiz.helpdesk.services.exceptions.ObjectnotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import javax.validation.Valid;
import java.util.List;
import java.util.Set;

@Service
public class TecnicoService {

    @Autowired
    private TecnicoRepository tecnicoRepository;

    @Autowired
    private ChamadoRepository chamadoRepository;

    @Autowired
    private EnderecoRepository enderecoRepository;

    @Autowired
    private BCryptPasswordEncoder encoder;

    @Autowired
    private AuthService authService;

    @Transactional
    public Tecnico findById(Integer id) {
        return tecnicoRepository.findById(id)
                .orElseThrow(() -> new ObjectnotFoundException("Técnico não encontrado! ID: " + id));
    }

    @Transactional
    public List<Tecnico> findAll() {
        return tecnicoRepository.findAll();
    }

    @Transactional
    public TecnicoDTO create(TecnicoDTO objDTO) {
        objDTO.setId(null);
        objDTO.setSenha(encoder.encode(objDTO.getSenha()));
        validaPorCpfEEmail(objDTO);
        validaPerfis(objDTO.getPerfis());
        Tecnico tecnico = new Tecnico(objDTO);
        Endereco endereco = createOrUpdateEndereco(tecnico, objDTO.getEndereco());
        tecnico.setEndereco(endereco);
        tecnico = tecnicoRepository.save(tecnico);
        return new TecnicoDTO(tecnico);
    }

    @Transactional
    public TecnicoDTO update(Integer id, @Valid TecnicoDTO objDTO) {
        UserSS authenticatedUser = authService.getAuthenticatedUser();
        if (id.equals(1) && !authenticatedUser.getId().equals(id)) {
            throw new ForbiddenException("Acesso negado: Você não tem permissão para atualizar o Administrador.");
        }
        objDTO.setId(id);
        Tecnico oldObj = tecnicoRepository.findById(id)
                .orElseThrow(() -> new ObjectnotFoundException("Objeto não encontrado! Id: " + id));
        validaPorCpfEEmail(objDTO);
        validaPerfis(objDTO.getPerfis());
        if (!objDTO.getSenha().equals(oldObj.getSenha())) {
            objDTO.setSenha(encoder.encode(objDTO.getSenha()));
        }
        Endereco endereco = createOrUpdateEndereco(oldObj, objDTO.getEndereco());
        oldObj.updateFromDTO(objDTO);
        oldObj.setEndereco(endereco);
        Tecnico updatedTecnico = tecnicoRepository.save(oldObj);
        return new TecnicoDTO(updatedTecnico);
    }

    @Transactional
    public void delete(Integer id) {
        if (id.equals(1)) {
            throw new ForbiddenException("Você não tem permissão para deletar o Administrador!");
        }

        boolean hasChamados = chamadoRepository.existsByTecnicoId(id);
        if (hasChamados) {
            throw new DataIntegrityViolationException("Não é possível excluir um técnico que possui chamados em seu nome!");
        }

        Tecnico obj = tecnicoRepository.findById(id)
                .orElseThrow(() -> new ObjectnotFoundException("Objeto não encontrado! Id: " + id));

        tecnicoRepository.deleteById(id);
    }

    public List<Tecnico> search(String nome) {
        if (nome.length() < 3) {
            throw new IllegalArgumentException("A pesquisa deve conter pelo menos 3 caracteres.");
        }
        return tecnicoRepository.findByNomeContainingIgnoreCase(nome);
    }

    private void validaPorCpfEEmail(TecnicoDTO objDTO) {
        tecnicoRepository.findByCpf(objDTO.getCpf())
                .filter(obj -> !obj.getId().equals(objDTO.getId()))
                .ifPresent(obj -> {
                    throw new DataIntegrityViolationException("CPF já cadastrado no sistema!");
                });
        tecnicoRepository.findByEmail(objDTO.getEmail())
                .filter(obj -> !obj.getId().equals(objDTO.getId()))
                .ifPresent(obj -> {
                    throw new DataIntegrityViolationException("E-mail já cadastrado no sistema!");
                });
    }

    private void validaPerfis(Set<Integer> perfis) {
        if (perfis.stream().anyMatch(perfil -> perfil != 0 && perfil != 2)) {
            throw new DataIntegrityViolationException("Perfis inválidos: apenas ADMIN e TECNICO são permitidos.");
        }
    }

    private Endereco createOrUpdateEndereco(Tecnico tecnico, EnderecoDTO enderecoDTO) {
        Endereco endereco = tecnico.getEndereco();
        if (endereco == null) {
            endereco = new Endereco(enderecoDTO, tecnico);
        } else {
            endereco.updateFromDTO(enderecoDTO);
        }
        return enderecoRepository.save(endereco);
    }

    public TecnicoDTO findDTOById(Integer id) {
        Tecnico tecnico = findById(id);
        return new TecnicoDTO(tecnico);
    }
}
