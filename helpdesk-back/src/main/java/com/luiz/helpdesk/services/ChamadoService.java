package com.luiz.helpdesk.services;

import com.luiz.helpdesk.domain.Chamado;
import com.luiz.helpdesk.domain.Cliente;
import com.luiz.helpdesk.domain.Observacao;
import com.luiz.helpdesk.domain.Tecnico;
import com.luiz.helpdesk.domain.dtos.ChamadoDTO;
import com.luiz.helpdesk.domain.dtos.ObservacaoDTO;
import com.luiz.helpdesk.domain.enums.Prioridade;
import com.luiz.helpdesk.domain.enums.Status;
import com.luiz.helpdesk.repositories.ChamadoRepository;
import com.luiz.helpdesk.services.exceptions.ObjectnotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
public class ChamadoService {

    @Autowired
    private ChamadoRepository chamadoRepository;

    @Autowired
    private TecnicoService tecnicoService;

    @Autowired
    private ClienteService clienteService;

    @Autowired
    private ObservacaoService observacaoService;

    @Transactional
    public Chamado create(ChamadoDTO objDTO) {
        Chamado chamado = newChamado(objDTO);
        chamado = chamadoRepository.save(chamado);
        List<Observacao> observacoes = convertToObservacoes(objDTO.getObservacoes(), chamado);
        chamado.getObservacoes().addAll(observacoes);
        observacaoService.createAll(observacoes);
        return chamado;
    }

    private Chamado newChamado(ChamadoDTO objDTO) {
        Tecnico tecnico = tecnicoService.findById(objDTO.getTecnicoId());
        Cliente cliente = clienteService.findById(objDTO.getClienteId());
        Chamado chamado = new Chamado();
        chamado.setId(objDTO.getId());
        if (Status.ENCERRADO.getCodigo().equals(objDTO.getStatus())) {
            chamado.setDataFechamento(LocalDate.now());
        }
        chamado.setTecnico(tecnico);
        chamado.setCliente(cliente);
        chamado.setPrioridade(Prioridade.toEnum(objDTO.getPrioridade()));
        chamado.setStatus(Status.toEnum(objDTO.getStatus()));
        chamado.setTitulo(objDTO.getTitulo());
        return chamado;
    }

    private List<Observacao> convertToObservacoes(List<ObservacaoDTO> observacoesDTO, Chamado chamado) {
        List<Observacao> observacoes = new ArrayList<>();
        if (observacoesDTO != null) {
            observacoesDTO.forEach(dto -> {
                Observacao observacao = new Observacao();
                observacao.setDataObservacao(LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
                observacao.setObservacao(dto.getObservacao());
                observacao.setChamado(chamado);
                observacao.setChamadoStatus(chamado.getStatus().getCodigo());
                observacao.setTecnicoResponsavelId(dto.getTecnicoResponsavelId());
                observacao.setTecnicoResponsavelNome(dto.getTecnicoResponsavelNome());
                observacoes.add(observacao);
            });
        }
        return observacoes;
    }

    @Transactional
    public Chamado findById(Integer chamadoId) {
        return chamadoRepository.findById(chamadoId)
                .orElseThrow(() -> new ObjectnotFoundException("Chamado não encontrado! ID: " + chamadoId));
    }

    @Transactional
    public Chamado update(Integer id, ChamadoDTO objDTO) {
        Chamado chamado = findById(id);
        updateChamadoData(chamado, objDTO);
        List<Observacao> novasObservacoes = convertToObservacoes(objDTO.getObservacoes(), chamado);
        chamado.getObservacoes().clear();
        chamado.getObservacoes().addAll(novasObservacoes);
        return chamadoRepository.save(chamado);
    }

    private void updateChamadoData(Chamado chamado, ChamadoDTO objDTO) {
        chamado.setTitulo(objDTO.getTitulo());
        chamado.setPrioridade(Prioridade.toEnum(objDTO.getPrioridade()));
        chamado.setStatus(Status.toEnum(objDTO.getStatus()));
        if (Status.ENCERRADO.getCodigo().equals(objDTO.getStatus()) && chamado.getDataFechamento() == null) {
            chamado.setDataFechamento(LocalDate.now());
        }
        chamado.setTecnico(tecnicoService.findById(objDTO.getTecnicoId()));
        chamado.setCliente(clienteService.findById(objDTO.getClienteId()));
    }

    @Transactional
    public List<Chamado> findAll() {
        return chamadoRepository.findAll();
    }
}
