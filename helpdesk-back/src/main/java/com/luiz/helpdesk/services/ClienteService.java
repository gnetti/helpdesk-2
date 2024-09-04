package com.luiz.helpdesk.services;

import com.luiz.helpdesk.domain.Cliente;
import com.luiz.helpdesk.domain.Endereco;
import com.luiz.helpdesk.domain.dtos.ClienteDTO;
import com.luiz.helpdesk.domain.dtos.EnderecoDTO;
import com.luiz.helpdesk.repositories.ClienteRepository;
import com.luiz.helpdesk.repositories.EnderecoRepository;
import com.luiz.helpdesk.services.exceptions.DataIntegrityViolationException;
import com.luiz.helpdesk.services.exceptions.ObjectnotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import javax.validation.Valid;
import java.util.List;
import java.util.Set;

@Service
public class ClienteService {

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private EnderecoRepository enderecoRepository;

    @Autowired
    private BCryptPasswordEncoder encoder;

    @Transactional
    public Cliente findById(Integer id) {
        return clienteRepository.findById(id)
                .orElseThrow(() -> new ObjectnotFoundException("Objeto não encontrado! Id: " + id));
    }

    @Transactional
    public List<Cliente> findAll() {
        return clienteRepository.findAll();
    }

    @Transactional
    public ClienteDTO create(ClienteDTO objDTO) {
        validaPorCpfEEmail(objDTO);
        validaPerfis(objDTO.getPerfis());
        objDTO.setId(null);
        objDTO.setSenha(encoder.encode(objDTO.getSenha()));
        Cliente cliente = new Cliente(objDTO);
        Endereco endereco = createOrUpdateEndereco(cliente, objDTO.getEndereco());
        cliente.setEndereco(endereco);
        cliente = clienteRepository.save(cliente);
        return new ClienteDTO(cliente);
    }

    @Transactional
    public ClienteDTO update(Integer id, @Valid ClienteDTO objDTO) {
        objDTO.setId(id);
        Cliente oldObj = findById(id);
        validaPorCpfEEmail(objDTO);
        validaPerfis(objDTO.getPerfis());
        if (!objDTO.getSenha().equals(oldObj.getSenha())) {
            objDTO.setSenha(encoder.encode(objDTO.getSenha()));
        }
        Endereco endereco = createOrUpdateEndereco(oldObj, objDTO.getEndereco());
        oldObj.updateFromDTO(objDTO);
        oldObj.setEndereco(endereco);
        Cliente updatedCliente = clienteRepository.save(oldObj);
        return new ClienteDTO(updatedCliente);
    }

    @Transactional
    public void delete(Integer id) {
        Cliente obj = findById(id);
        if (!obj.getChamados().isEmpty()) {
            throw new DataIntegrityViolationException("Cliente possui ordens de serviço e não pode ser deletado!");
        }

        clienteRepository.deleteById(id);
    }

    public List<Cliente> search(String nome) {
        if (nome.length() < 3) {
            throw new IllegalArgumentException("A pesquisa deve conter pelo menos 3 caracteres.");
        }
        return clienteRepository.findByNomeContainingIgnoreCase(nome);
    }

    private void validaPorCpfEEmail(ClienteDTO objDTO) {
        clienteRepository.findByCpf(objDTO.getCpf())
                .filter(obj -> !obj.getId().equals(objDTO.getId()))
                .ifPresent(obj -> {
                    throw new DataIntegrityViolationException("CPF já cadastrado no sistema!");
                });
        clienteRepository.findByEmail(objDTO.getEmail())
                .filter(obj -> !obj.getId().equals(objDTO.getId()))
                .ifPresent(obj -> {
                    throw new DataIntegrityViolationException("E-mail já cadastrado no sistema!");
                });
    }

    private Endereco createOrUpdateEndereco(Cliente cliente, EnderecoDTO enderecoDTO) {
        Endereco endereco = cliente.getEndereco();
        if (endereco == null) {
            endereco = new Endereco(enderecoDTO, cliente);
        } else {
            endereco.updateFromDTO(enderecoDTO);
        }
        return enderecoRepository.save(endereco);
    }

    public ClienteDTO findDTOById(Integer id) {
        Cliente cliente = findById(id);
        return new ClienteDTO(cliente);
    }

    private void validaPerfis(Set<Integer> perfis) {
        if (perfis.stream().anyMatch(perfil -> perfil != 0 && perfil != 1)) {
            throw new DataIntegrityViolationException("Perfis inválidos: apenas ADMIN e CLIENTE são permitidos.");
        }
    }
}
