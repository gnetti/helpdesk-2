package com.luiz.helpdesk.resources;

import com.luiz.helpdesk.domain.dtos.TokenTempoDTO;
import com.luiz.helpdesk.services.AuthService;
import com.luiz.helpdesk.services.TokenTimeService;
import com.luiz.helpdesk.services.exceptions.UnauthorizedException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import javax.validation.Valid;
import java.net.URI;
import java.util.List;

@RestController
@RequestMapping(value = "/token-tempo")
public class TokenTempoResource {

    @Autowired
    private TokenTimeService tokenTimeService;

    @Autowired
    private AuthService authService;

    private void checkAuthorization() {
        if (authService.getAuthenticatedUser().getId() != 1) {
            throw new UnauthorizedException("Acesso negado");
        }
    }

    @GetMapping(value = "/{id}")
    public ResponseEntity<TokenTempoDTO> findDTOById(@PathVariable Integer id) {
        checkAuthorization();
        TokenTempoDTO tokenTempoDTO = tokenTimeService.findDTOById(id);
        return ResponseEntity.ok().body(tokenTempoDTO);
    }

    @GetMapping
    public ResponseEntity<List<TokenTempoDTO>> findAll() {
        checkAuthorization();
        List<TokenTempoDTO> listDTO = tokenTimeService.findAll();
        if (listDTO.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok().body(listDTO);
    }

    @PostMapping
    public ResponseEntity<TokenTempoDTO> create(@Valid @RequestBody TokenTempoDTO objDTO) {
        checkAuthorization();

        String perfilString = String.valueOf(objDTO.getPerfil());
        if (tokenTimeService.existsByPerfil(perfilString)) {
            return ResponseEntity.badRequest().build();
        }
        TokenTempoDTO newObjDTO = tokenTimeService.create(objDTO);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(newObjDTO.getId()).toUri();
        return ResponseEntity.created(uri).body(newObjDTO);
    }

    @PutMapping(value = "/{id}")
    public ResponseEntity<TokenTempoDTO> update(@PathVariable Integer id, @Valid @RequestBody TokenTempoDTO objDTO) {
        checkAuthorization();
        TokenTempoDTO updatedDTO = tokenTimeService.update(id, objDTO);
        return ResponseEntity.ok().body(updatedDTO);
    }
}
