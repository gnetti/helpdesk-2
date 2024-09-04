import {Observacao} from "./observacao";

export interface Chamado {
   id?:                any;
   dataAbertura?:   string;
   dataFechamento?: string;
   prioridade:      string;
   status:          string;
   titulo:          string;
   observacoes: Observacao[];
   tecnico:            any;
   cliente:            any;
   nomeCliente:     string;
   nomeTecnico:     string;
}
