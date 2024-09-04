package com.luiz.helpdesk.domain.enums;

public enum Perfil {

    ADMIN(0, "ROLE_ADMIN"),
    CLIENTE(1, "ROLE_CLIENTE"),
    TECNICO(2, "ROLE_TECNICO");

    private Integer codigo;
    private String descricao;

    private Perfil(Integer codigo, String descricao) {
        this.codigo = codigo;
        this.descricao = descricao;
    }

    public Integer getCodigo() {
        return codigo;
    }

    public String getDescricao() {
        return descricao;
    }

    public static Perfil fromDescricao(String descricao) {
        for (Perfil perfil : Perfil.values()) {
            if (perfil.getDescricao().equals(descricao)) {
                return perfil;
            }
        }
        throw new IllegalArgumentException("Descrição de perfil inválida: " + descricao);
    }

    public static Perfil fromCodigo(Integer codigo) {
        for (Perfil perfil : Perfil.values()) {
            if (perfil.getCodigo().equals(codigo)) {
                return perfil;
            }
        }
        throw new IllegalArgumentException("Código de perfil inválido: " + codigo);
    }
}
