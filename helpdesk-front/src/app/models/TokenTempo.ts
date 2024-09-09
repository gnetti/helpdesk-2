export interface TokenTempo {
    id: number;
    tempoAvisoExpiracaoMinutos: number;
    tempoExibicaoDialogoMinutos: number;
    intervaloAtualizacaoMinutos: number;
    jwtExpiracao: number;
    perfil: string;
}
