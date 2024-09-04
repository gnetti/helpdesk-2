import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TecnicoService } from 'src/app/services/tecnico.service';
import { Tecnico } from 'src/app/models/tecnico'; // Importa o modelo Tecnico
import { CoolDialogService } from '@angular-cool/dialogs'; // Importa o serviço de diálogo

@Component({
    selector: 'app-tecnico-delete',
    templateUrl: './tecnico-delete.component.html',
    styleUrls: ['./tecnico-delete.component.css']
})
export class TecnicoDeleteComponent implements OnInit {

    tecnicoForm: FormGroup;
    tecnico: Tecnico; // Declaração sem inicialização explícita

    constructor(
        private fb: FormBuilder,
        private service: TecnicoService,
        private toast: ToastrService,
        private router: Router,
        private route: ActivatedRoute,
        private coolDialogService: CoolDialogService // Adiciona o serviço no construtor
    ) {
        this.tecnico = {} as Tecnico; // Inicializa o objeto técnico vazio
    }

    ngOnInit(): void {
        this.tecnico.id = this.route.snapshot.paramMap.get('id');
        this.initForm();
        this.findById();
    }

    initForm(): void {
        this.tecnicoForm = this.fb.group({
            nome: [{ value: '', disabled: true }, Validators.required],
            cpf: [{ value: '', disabled: true }, [Validators.required, Validators.pattern('\\d{11}')]],
            email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
            senha: [{ value: '', disabled: true }, Validators.required],
            cep: [{ value: '', disabled: true }, Validators.required],
            logradouro: [{ value: '', disabled: true }, Validators.required],
            numero: [{ value: '', disabled: true }, Validators.required],
            bairro: [{ value: '', disabled: true }, Validators.required],
            complemento: [{ value: '', disabled: true }],
            uf: [{ value: '', disabled: true }, Validators.required],
            localidade: [{ value: '', disabled: true }, Validators.required]
        });
    }

    findById(): void {
        this.service.findById(this.tecnico.id).subscribe(resposta => {
            this.tecnico = resposta;
            this.updateFormWithTecnicoData();
        }, ex => {
            this.toast.error('Erro ao carregar os dados do técnico', 'Erro');
        });
    }

    updateFormWithTecnicoData(): void {
        this.tecnicoForm.patchValue({
            nome: this.tecnico.nome,
            cpf: this.tecnico.cpf,
            email: this.tecnico.email,
            senha: this.tecnico.senha,
            cep: this.tecnico.endereco.cep,
            logradouro: this.tecnico.endereco.logradouro,
            numero: this.tecnico.endereco.numero,
            bairro: this.tecnico.endereco.bairro,
            complemento: this.tecnico.endereco.complemento,
            uf: this.tecnico.endereco.uf,
            localidade: this.tecnico.endereco.localidade
        });
    }

    async delete(): Promise<void> {
        if (this.tecnico.id === '1') {
            this.toast.warning('O Administrador não pode ser deletado!', 'Atenção');
            return;
        }

        const result = await this.coolDialogService.showDialog({
            titleText: 'Confirmação',
            questionText: `Você realmente deseja deletar o técnico ${this.tecnico.nome}?`,
            confirmActionButtonText: 'Sim',
            cancelActionButtonText: 'Não',
            confirmActionButtonColor: 'warn'
        });

        if (result.isConfirmed) {
            this.service.delete(this.tecnico.id).subscribe(
                () => {
                    this.toast.success('Técnico deletado com sucesso', 'Delete');
                    this.router.navigate(['tecnicos']);
                },
                (error) => {
                    if (error.status === 403) {
                        this.toast.error('Você não tem permissão para excluir o Administrador!', 'Atenção');
                    } else if (error.status === 400) {
                        this.toast.error('Não é possível excluir um técnico que possui chamados em seu nome!', 'Atenção');
                    } else if (error.error.errors) {
                        error.error.errors.forEach((element: any) => {
                            this.toast.error(element.message, 'Erro');
                        });
                    } else {
                        this.toast.error('Erro ao tentar deletar técnico.', 'Erro');
                    }
                }
            );
        }
    }

    addPerfil(event: any, perfil: number): void {
        if (event.checked) {
            this.tecnico.perfis.push(perfil);
        } else {
            this.toast.warning('O perfil não pode ser removido por aqui.', 'Atenção');
            event.source.checked = true;
        }
    }
}
