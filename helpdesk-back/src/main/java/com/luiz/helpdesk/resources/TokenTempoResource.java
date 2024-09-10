package com.luiz.helpdesk.resources;

import com.luiz.helpdesk.domain.dtos.TokenTempoDTO;
import com.luiz.helpdesk.domain.enums.Perfil;
import com.luiz.helpdesk.services.AuthService;
import com.luiz.helpdesk.services.TokenTempoService;
import com.luiz.helpdesk.services.UserDetailsServiceImpl;
import com.luiz.helpdesk.services.exceptions.UnauthorizedException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import javax.validation.Valid;
import java.net.URI;
import java.util.Optional;
import java.util.Set;

@RestController
@RequestMapping(value = "/token-tempo")
public class TokenTempoResource {

    @Autowired
    private TokenTempoService tokenTempoService;

    @Autowired
    private AuthService authService;

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

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
    public ResponseEntity<TokenTempoDTO> findByPerfil(@RequestParam("perfil") Perfil perfil) {
        checkAuthorization();
        Optional<TokenTempoDTO> tokenTempoDTO = tokenTempoService.findByPerfil(perfil);
        return tokenTempoDTO
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/jwt-expiration")
    public ResponseEntity<Long> getExpirationTimeInMillis(@RequestParam("email") String email) {
        try {
            TokenTempoDTO tokenTempoDTO = new TokenTempoDTO();
            tokenTempoDTO.setTokenTempoService(tokenTempoService);
            tokenTempoDTO.setUserDetailsService(userDetailsService);
            long expirationTimeInMillis = tokenTempoDTO.getExpirationTimeInMillis(email);
            return ResponseEntity.ok(expirationTimeInMillis);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
