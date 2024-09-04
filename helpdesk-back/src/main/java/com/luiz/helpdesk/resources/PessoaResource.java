package com.luiz.helpdesk.resources;

import com.luiz.helpdesk.domain.Pessoa;
import com.luiz.helpdesk.domain.dtos.PessoaDTO;
import com.luiz.helpdesk.services.PessoaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping(value = "/pessoas")
public class PessoaResource {

    @Autowired
    private PessoaService pessoaService;

    @GetMapping(value = "/me")
    public ResponseEntity<PessoaDTO> getMe() {
               Integer id = pessoaService.getAuthenticatedUserId();
        Pessoa pessoa = pessoaService.findById(id);
        PessoaDTO pessoaDTO = new PessoaDTO(pessoa);
        return ResponseEntity.ok().body(pessoaDTO);
    }

    @PutMapping(value = "/me")
    public ResponseEntity<PessoaDTO> updateMe(@Valid @RequestBody PessoaDTO pessoaDTO) {
                Integer id = pessoaService.getAuthenticatedUserId();
        PessoaDTO pessoaAtualizadaDTO = pessoaService.update(id, pessoaDTO);
        return ResponseEntity.ok().body(pessoaAtualizadaDTO);
    }
}
