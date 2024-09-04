package com.luiz.helpdesk.security;

import com.luiz.helpdesk.domain.enums.Perfil;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class JWTUtil {

    @Value("${jwt.expiration}")
    private Long expiration;

    @Value("${jwt.secret}")
    private String secret;

    public String generateToken(String email, Integer id, String nome, Set<Perfil> perfis, String tema) {
        try {
            String token = Jwts.builder()
                    .setSubject(email)
                    .claim("id", id)
                    .claim("nome", nome)
                    .claim("roles", perfis.stream().map(Perfil::getDescricao).collect(Collectors.toSet()))
                    .claim("tema", tema)
                    .setIssuedAt(new Date())
                    .setExpiration(new Date(System.currentTimeMillis() + expiration))
                    .signWith(SignatureAlgorithm.HS512, secret.getBytes())
                    .compact();
            return token;
        } catch (Exception e) {
            throw e;
        }
    }

    public boolean tokenValido(String token) {
        try {
            Claims claims = getClaims(token);
            if (claims != null) {
                String username = claims.getSubject();
                Date expirationDate = claims.getExpiration();
                Date now = new Date();

                boolean valid = username != null && expirationDate != null && now.before(expirationDate);
                return valid;
            }
            return false;
        } catch (Exception e) {
            return false;
        }
    }

    private Claims getClaims(String token) {
        try {
            Claims claims = Jwts.parser()
                    .setSigningKey(secret.getBytes())
                    .parseClaimsJws(token)
                    .getBody();
            return claims;
        } catch (Exception e) {
            return null;
        }
    }

    public String getUsername(String token) {
        Claims claims = getClaims(token);
        String username = (claims != null) ? claims.getSubject() : null;
        return username;
    }

    public Long getId(String token) {
        Claims claims = getClaims(token);
        Long id = (claims != null) ? claims.get("id", Long.class) : null;
        return id;
    }

    public String getNome(String token) {
        Claims claims = getClaims(token);
        String nome = (claims != null) ? claims.get("nome", String.class) : null;
        return nome;
    }

    public String getTema(String token) {
        Claims claims = getClaims(token);
        String tema = (claims != null) ? claims.get("tema", String.class) : null;
        return tema;
    }
}
