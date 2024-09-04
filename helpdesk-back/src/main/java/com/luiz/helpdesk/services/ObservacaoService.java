package com.luiz.helpdesk.services;

import com.luiz.helpdesk.domain.Observacao;
import com.luiz.helpdesk.repositories.ObservacaoRepository;
import com.luiz.helpdesk.services.exceptions.ObjectnotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ObservacaoService {

    @Autowired
    private ObservacaoRepository repository;

    public Observacao findById(Integer id) {
        return repository.findById(id)
                .orElseThrow(() -> new ObjectnotFoundException("Observação não encontrada! ID: " + id));
    }

    public List<Observacao> findAll() {
        return repository.findAll();
    }

    public Observacao create(Observacao observacao) {
        return repository.save(observacao);
    }

    public Observacao update(Observacao obj) {
        findById(obj.getId());
        return repository.save(obj);
    }

    public void delete(Integer id) {
        findById(id);
        repository.deleteById(id);
    }

    public List<Observacao> createAll(List<Observacao> observacoes) {
        return repository.saveAll(observacoes);
    }
}
