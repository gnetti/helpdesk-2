export interface UserSettings {
    id: number;
    nome: string;
    email: string;
    senha: string;
    senhaAtual: string ;
    senhaNova:string ;
    confirmaSenhaNova:string ;
    roles: string[];
    tema: string ;
}
