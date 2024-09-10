package com.luiz.helpdesk.domain.dtos.interfaces;

import java.math.BigDecimal;

public interface ITokenTempoConvertido {
    BigDecimal getTempoTokenExibeDialogoMinutos();

    BigDecimal getTempoExibicaoDialogoAtualizaTokenMinutos();

    BigDecimal getIntervaloAtualizacaoTokenMinutos();
}
