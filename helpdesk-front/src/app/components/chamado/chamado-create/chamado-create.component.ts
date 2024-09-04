import {Component, OnInit} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {ToastrService} from 'ngx-toastr';
import {Chamado} from 'src/app/models/chamado';
import {Cliente} from 'src/app/models/cliente';
import {Tecnico} from 'src/app/models/tecnico';
import {ChamadoService} from 'src/app/services/chamado.service';
import {ClienteService} from 'src/app/services/cliente.service';
import {TecnicoService} from 'src/app/services/tecnico.service';
import {Subject} from 'rxjs';
import {debounceTime, map, startWith} from 'rxjs/operators';
import {AuthService} from 'src/app/services/auth.service'; // Importar o serviço de autenticação

@Component({
    selector: 'app-chamado-create',
    templateUrl: './chamado-create.component.html',
    styleUrls: ['./chamado-create.component.css']
})
export class ChamadoCreateComponent implements OnInit {

    chamado: Chamado = {
        prioridade: '0',
        status: '0',
        titulo: '',
        observacoes: [],
        tecnico: null,
        cliente: null,
        nomeCliente: '',
        nomeTecnico: '',
    };

    clientes: Cliente[] = [];
    tecnicos: Tecnico[] = [];
    clientesFiltrados: Cliente[] = [];
    tecnicosFiltrados: Tecnico[] = [];

    tecnicoCtrl = new FormControl();
    clienteCtrl = new FormControl();
    private searchTermCliente = new Subject<string>();
    private searchTermTecnico = new Subject<string>();

    prioridade: FormControl = new FormControl(null, [Validators.required]);
    status: FormControl = new FormControl('0', [Validators.required]);
    titulo: FormControl = new FormControl(null, [Validators.required]);
    observacaoCtrl: FormControl = new FormControl('', [Validators.required]);
    tecnico: FormControl = new FormControl(null, [Validators.required]);
    cliente: FormControl = new FormControl(null, [Validators.required]);

    novaObservacao: string = '';

    constructor(
        private chamadoService: ChamadoService,
        private clienteService: ClienteService,
        private tecnicoService: TecnicoService,
        private toastService: ToastrService,
        private router: Router,
        private authService: AuthService // Injetar o serviço de autenticação
    ) {
    }

    ngOnInit(): void {
        this.searchTermCliente.pipe(
            debounceTime(300),
            startWith(''),
            map(term => term.length >= 3 ? this.filterClientes(term) : [])
        ).subscribe(filteredClientes => this.clientesFiltrados = filteredClientes);

        this.searchTermTecnico.pipe(
            debounceTime(300),
            startWith(''),
            map(term => term.length >= 3 ? this.filterTecnicos(term) : [])
        ).subscribe(filteredTecnicos => this.tecnicosFiltrados = filteredTecnicos);

        this.clienteCtrl.valueChanges.subscribe(nome => {
            const clienteSelecionado = this.clientes.find(c => c.nome === nome);
            if (clienteSelecionado) {
                this.chamado.cliente = clienteSelecionado.id;
                this.chamado.nomeCliente = clienteSelecionado.nome;
            } else {
                this.chamado.cliente = null;
                this.chamado.nomeCliente = '';
            }
            this.updateButtonState();
        });

        this.tecnicoCtrl.valueChanges.subscribe(nome => {
            const tecnicoSelecionado = this.tecnicos.find(t => t.nome === nome);
            if (tecnicoSelecionado) {
                this.chamado.tecnico = tecnicoSelecionado.id;
                this.chamado.nomeTecnico = tecnicoSelecionado.nome;
            } else {
                this.chamado.tecnico = null;
                this.chamado.nomeTecnico = '';
            }
            this.updateButtonState();
        });

        this.observacaoCtrl.valueChanges.subscribe(observacao => {
            this.novaObservacao = observacao;
            if (this.novaObservacao.trim()) {
                this.addObservacao();
            }
            this.updateButtonState();
        });
    }

    create(): void {
        if (this.validaCampos()) {
            const tecnicoResponsavelId = this.authService.getUserId();
            const tecnicoResponsavelNome = this.authService.getUserName();

            if (tecnicoResponsavelId && tecnicoResponsavelNome) {
                this.chamado.observacoes.forEach(obs => {
                    obs.tecnicoResponsavelId = tecnicoResponsavelId;
                    obs.tecnicoResponsavelNome = tecnicoResponsavelNome;
                });

                this.chamadoService.create(this.chamado).subscribe(
                    resposta => {
                        this.toastService.success('Chamado criado com sucesso', 'Novo chamado');
                        this.router.navigate(['chamados']);
                    },
                    ex => {
                        this.toastService.error(ex.error.error);
                    }
                );
            } else {
                this.toastService.error('Usuário não autenticado');
            }
        }
    }

    searchLikeNameClients(search: string): void {
        this.clienteService.searchLikeName(search).subscribe(resposta => {
            this.clientes = resposta;
            this.searchTermCliente.next(search);
        });
    }

    searchLikeNameTechnicals(search: string): void {
        this.tecnicoService.searchLikeName(search).subscribe(resposta => {
            this.tecnicos = resposta;
            this.searchTermTecnico.next(search);
        });
    }

    onClienteInput(event: any): void {
        const valor = event.target.value;
        if (valor.length >= 3) {
            this.searchLikeNameClients(valor);
        } else {
            this.clientesFiltrados = [];
        }
    }

    onTecnicoInput(event: any): void {
        const valor = event.target.value;
        if (valor.length >= 3) {
            this.searchLikeNameTechnicals(valor);
        } else {
            this.tecnicosFiltrados = [];
        }
    }

    filterClientes(term: string): Cliente[] {
        return this.clientes.filter(cliente => cliente.nome.toLowerCase().includes(term.toLowerCase()));
    }

    filterTecnicos(term: string): Tecnico[] {
        return this.tecnicos.filter(tecnico => tecnico.nome.toLowerCase().includes(term.toLowerCase()));
    }

    validaCampos(): boolean {
        return this.prioridade.valid && this.status.valid && this.titulo.valid
            && this.chamado.tecnico !== null && this.chamado.cliente !== null && this.chamado.observacoes.length > 0;
    }

    updateButtonState(): void {
        const button = document.querySelector('button[color="primary"]');
        if (button) {
            (button as HTMLButtonElement).disabled = !this.validaCampos();
        }
    }

    addObservacao(): void {
        const tecnicoResponsavelId = this.authService.getUserId();
        const tecnicoResponsavelNome = this.authService.getUserName();
        const dataObservacao = ''

        if (tecnicoResponsavelId && tecnicoResponsavelNome && this.novaObservacao.trim()) {
            this.chamado.observacoes = [{
                observacao: this.novaObservacao.trim(),
                tecnicoResponsavelId: tecnicoResponsavelId,
                tecnicoResponsavelNome: tecnicoResponsavelNome,
                dataObservacao: dataObservacao
            }];
            this.novaObservacao = '';
        } else if (!tecnicoResponsavelId || !tecnicoResponsavelNome) {
            this.toastService.error('Usuário não autenticado');
        } else if (!this.novaObservacao.trim()) {
            this.toastService.error('Observação não pode ser vazia');
        }
    }

    onObservacaoInput(): void {
        this.novaObservacao = this.observacaoCtrl.value;
    }

    onStatusChange(): void {
        if (this.chamado.status !== '0') {
            this.toastService.warning('O status não pode ser alterado e será revertido para "EM ABERTO".');
            this.chamado.status = '0';
            this.status.setValue('0', {emitEvent: false});
        }
    }
}
