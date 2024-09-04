package com.luiz.helpdesk.resources;

import com.luiz.helpdesk.domain.Chamado;
import com.luiz.helpdesk.domain.Observacao;
import com.luiz.helpdesk.domain.dtos.ObservacaoDTO;
import com.luiz.helpdesk.services.ChamadoService;
import com.luiz.helpdesk.services.ObservacaoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping(value = "/observacoes")
public class ObservacaoResource {

    @Autowired
    private ChamadoService chamadoService;

    @Autowired
    private ObservacaoService observacaoService;

    @GetMapping(value = "/{id}")
    public ResponseEntity<ObservacaoDTO> findById(@PathVariable Integer id) {
        Observacao obj = observacaoService.findById(id);
        return ResponseEntity.ok().body(new ObservacaoDTO(obj));
    }

    @GetMapping
    public ResponseEntity<List<ObservacaoDTO>> findAll() {
        List<Observacao> list = observacaoService.findAll();
        List<ObservacaoDTO> listDTO = list.stream()
                .map(ObservacaoDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok().body(listDTO);
    }

    @PostMapping
    public ResponseEntity<List<ObservacaoDTO>> create(@RequestBody List<ObservacaoDTO> objDTOs) {
        List<Observacao> observacoes = objDTOs.stream().map(dto -> {
            Chamado chamado = chamadoService.findById(dto.getChamadoId());
            return new Observacao(
                    dto.getDataObservacao(),
                    dto.getObservacao(),
                    chamado,
                    dto.getChamadoStatus(),
                    dto.getTecnicoResponsavelId(),
                    dto.getTecnicoResponsavelNome()
            );
        }).collect(Collectors.toList());

        List<Observacao> newObjs = observacaoService.createAll(observacoes);
        List<ObservacaoDTO> newObjsDTO = newObjs.stream()
                .map(ObservacaoDTO::new)
                .collect(Collectors.toList());

        URI uri = ServletUriComponentsBuilder.fromCurrentRequest().build().toUri();
        return ResponseEntity.created(uri).body(newObjsDTO);
    }

    @PutMapping(value = "/{id}")
    public ResponseEntity<ObservacaoDTO> update(@PathVariable Integer id, @RequestBody ObservacaoDTO objDTO) {
        Chamado chamado = chamadoService.findById(objDTO.getChamadoId());
        Observacao updatedObj = new Observacao(
                objDTO.getDataObservacao(),
                objDTO.getObservacao(),
                chamado,
                objDTO.getChamadoStatus(),
                objDTO.getTecnicoResponsavelId(),
                objDTO.getTecnicoResponsavelNome()
        );
        updatedObj.setId(id);
        updatedObj = observacaoService.update(updatedObj);
        return ResponseEntity.ok().body(new ObservacaoDTO(updatedObj));
    }

    @DeleteMapping(value = "/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        observacaoService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
