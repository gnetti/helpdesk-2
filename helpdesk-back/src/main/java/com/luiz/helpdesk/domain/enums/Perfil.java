package com.luiz.helpdesk.domain.enums;

import java.util.Arrays;
import java.util.Map;
import java.util.stream.Collectors;

public enum Perfil {

    ADMIN(0, "ROLE_ADMIN"),
    CLIENTE(1, "ROLE_CLIENTE"),
    TECNICO(2, "ROLE_TECNICO");

    private static final Map<Integer, Perfil> CODIGO_MAP;
    private static final Map<String, Perfil> DESCRICAO_MAP;

    static {
        CODIGO_MAP = Arrays.stream(Perfil.values())
                .collect(Collectors.toMap(Perfil::getCodigo, perfil -> perfil));
        DESCRICAO_MAP = Arrays.stream(Perfil.values())
                .collect(Collectors.toMap(Perfil::getDescricao, perfil -> perfil));
    }

    private final Integer codigo;
    private final String descricao;

    Perfil(Integer codigo, String descricao) {
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
        Perfil perfil = DESCRICAO_MAP.get(descricao);
        if (perfil == null) {
            throw new IllegalArgumentException("Descrição de perfil inválida: " + descricao);
        }
        return perfil;
    }
}
