package com.luiz.helpdesk.services;

import com.luiz.helpdesk.domain.Endereco;
import com.luiz.helpdesk.repositories.EnderecoRepository;
import com.luiz.helpdesk.resources.exceptions.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EnderecoService {

    @Autowired
    private EnderecoRepository enderecoRepository;

    public Endereco findById(Integer id) {
        return enderecoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Endereço não encontrado! ID: " + id));
    }

    public List<Endereco> findAll() {
        return enderecoRepository.findAll();
    }

    public Endereco create(Endereco endereco) {
        return enderecoRepository.save(endereco);
    }

    public Endereco update(Endereco endereco) {
        findById(endereco.getId());
        return enderecoRepository.save(endereco);
    }

    public void delete(Integer id) {
        findById(id);
        enderecoRepository.deleteById(id);
    }
}
