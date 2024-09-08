package com.luiz.helpdesk.resources;

import com.luiz.helpdesk.domain.dtos.TokenTempoDTO;
import com.luiz.helpdesk.domain.enums.Perfil;
import com.luiz.helpdesk.services.AuthService;
import com.luiz.helpdesk.services.TokenTempoService;
import com.luiz.helpdesk.services.exceptions.UnauthorizedException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import javax.validation.Valid;
import java.net.URI;

@RestController
@RequestMapping(value = "/token-tempo")
public class TokenTempoResource {

    @Autowired
    private TokenTempoService tokenTempoService;

    @Autowired
    private AuthService authService;

    private void checkAuthorization() {
        if (authService.getAuthenticatedUser().getId() != 1) {
            throw new UnauthorizedException("Acesso negado");
        }
    }

    @PostMapping
    public ResponseEntity<TokenTempoDTO> create(@Valid @RequestBody TokenTempoDTO objDTO) {
        checkAuthorization();

        String perfilString = String.valueOf(objDTO.getPerfil());
        if (tokenTempoService.existsByPerfil(perfilString)) {
            return ResponseEntity.badRequest().build();
        }
        TokenTempoDTO newObjDTO = tokenTempoService.create(objDTO);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(newObjDTO.getId()).toUri();
        return ResponseEntity.created(uri).body(newObjDTO);
    }

    @PutMapping(value = "/{id}")
    public ResponseEntity<TokenTempoDTO> update(@PathVariable Integer id, @Valid @RequestBody TokenTempoDTO objDTO) {
        checkAuthorization();
        TokenTempoDTO updatedDTO = tokenTempoService.update(id, objDTO);
        return ResponseEntity.ok().body(updatedDTO);
    }
    @GetMapping("/role")
    public TokenTempoDTO findByPerfil(@RequestParam("perfil") Perfil perfil) {
        checkAuthorization();
        return tokenTempoService.findByPerfil(perfil);
    }
}
