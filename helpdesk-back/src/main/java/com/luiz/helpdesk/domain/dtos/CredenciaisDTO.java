package com.luiz.helpdesk.domain.dtos;

import com.luiz.helpdesk.config.validator.ValidPassword;

public class CredenciaisDTO {

    private String email;
    @ValidPassword
    private String senha;

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getSenha() {
        return senha;
    }

    public void setSenha(String senha) {
        this.senha = senha;
    }

    @Override
    public String toString() {
        return "CredenciaisDTO{" +
                "email='" + email + '\'' +
                ", senha='" + senha + '\'' +
                '}';
    }
}
