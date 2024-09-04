import {Endereco} from "./endereco";

export interface Tecnico {
    id?: any;
    nome: string;
    cpf: string;
    email: string;
    senha: string;
    perfis: number[];
    dataCriacao: any;
    endereco: Endereco;
}
