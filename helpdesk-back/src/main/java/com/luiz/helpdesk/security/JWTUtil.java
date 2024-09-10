package com.luiz.helpdesk.security;

import com.luiz.helpdesk.domain.dtos.TokenTempoDTO;
import com.luiz.helpdesk.domain.enums.Perfil;
import com.luiz.helpdesk.services.TokenTempoService;
import com.luiz.helpdesk.services.UserDetailsServiceImpl;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class JWTUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Autowired
    private TokenTempoService tokenTempoService;

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    public String generateToken(String email, Integer id, String nome, Set<Perfil> perfis, String tema) {
        TokenTempoDTO tokenTempoDTO = new TokenTempoDTO();
        tokenTempoDTO.setTokenTempoService(tokenTempoService);
        tokenTempoDTO.setUserDetailsService(userDetailsService);

        long expirationTimeInMillis = tokenTempoDTO.getExpirationTimeInMillis(email);

        return Jwts.builder()
                .setSubject(email)
                .claim("id", id)
                .claim("nome", nome)
                .claim("roles", perfis.stream().map(Perfil::getDescricao).collect(Collectors.toSet()))
                .claim("tema", tema)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expirationTimeInMillis))
                .signWith(SignatureAlgorithm.HS512, secret.getBytes())
                .compact();
    }

    public boolean tokenValido(String token) {
        Claims claims = getClaims(token);
        if (claims != null) {
            String username = claims.getSubject();
            Date expirationDate = claims.getExpiration();
            Date now = new Date();
            return username != null && expirationDate != null && now.before(expirationDate);
        }
        return false;
    }

    private Claims getClaims(String token) {
        try {
            return Jwts.parser()
                    .setSigningKey(secret.getBytes())
                    .parseClaimsJws(token)
                    .getBody();
        } catch (Exception e) {
            return null;
        }
    }

    public String getUsername(String token) {
        Claims claims = getClaims(token);
        return claims != null ? claims.getSubject() : null;
    }

    public Long getId(String token) {
        Claims claims = getClaims(token);
        return claims != null ? claims.get("id", Long.class) : null;
    }

    public String getNome(String token) {
        Claims claims = getClaims(token);
        return claims != null ? claims.get("nome", String.class) : null;
    }

    public String getTema(String token) {
        Claims claims = getClaims(token);
        return claims != null ? claims.get("tema", String.class) : null;
    }
}
