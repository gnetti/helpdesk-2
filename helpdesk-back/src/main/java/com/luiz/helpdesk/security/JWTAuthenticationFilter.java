package com.luiz.helpdesk.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.luiz.helpdesk.domain.dtos.CredenciaisDTO;
import com.luiz.helpdesk.domain.enums.Perfil;
import com.luiz.helpdesk.services.DecryptionService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import javax.servlet.FilterChain;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Date;
import java.util.Set;
import java.util.stream.Collectors;

public class JWTAuthenticationFilter extends UsernamePasswordAuthenticationFilter {

    private final AuthenticationManager authenticationManager;
    private final JWTUtil jwtUtil;
    private final DecryptionService encryptionService;

    public JWTAuthenticationFilter(AuthenticationManager authenticationManager, JWTUtil jwtUtil, DecryptionService encryptionService) {
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.encryptionService = encryptionService;
    }

    @Override
    public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response) throws AuthenticationException {
        try {
            CredenciaisDTO creds = new ObjectMapper().readValue(request.getInputStream(), CredenciaisDTO.class);
            String decryptedPassword = encryptionService.decrypt(creds.getSenha());
            UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(creds.getEmail(), decryptedPassword, new ArrayList<>());
            return authenticationManager.authenticate(authenticationToken);
        } catch (IOException e) {
            throw new RuntimeException("Erro ao processar a solicitação de autenticação", e);
        } catch (Exception e) {
            throw new RuntimeException("Erro geral durante a autenticação", e);
        }
    }

    @Override
    protected void successfulAuthentication(HttpServletRequest request, HttpServletResponse response, FilterChain chain, Authentication authResult) {
        UserSS user = (UserSS) authResult.getPrincipal();
        String email = user.getUsername();
        String nome = user.getNome();
        Set<Perfil> perfis = user.getRoles().stream().map(Perfil::fromDescricao).collect(Collectors.toSet());
        String tema = user.getTema();
        String token = jwtUtil.generateToken(email, user.getId(), nome, perfis, tema);
        response.addHeader("Access-Control-Expose-Headers", "Authorization");
        response.addHeader("Authorization", "Bearer " + token);
    }

    @Override
    protected void unsuccessfulAuthentication(HttpServletRequest request, HttpServletResponse response, AuthenticationException failed) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.getWriter().write(json());
    }

    private String json() {
        long date = new Date().getTime();
        return "{\"timestamp\": " + date + ", " +
                "\"status\": 401, " +
                "\"error\": \"Não autorizado\", " +
                "\"message\": \"Email ou senha inválidos\", " +
                "\"path\": \"/login\"}";
    }
}
