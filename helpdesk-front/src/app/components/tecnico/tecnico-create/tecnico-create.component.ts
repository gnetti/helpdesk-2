import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {ToastrService} from 'ngx-toastr';
import {TecnicoService} from 'src/app/services/tecnico.service';
import {CepService} from 'src/app/services/cep.service';
import {MatCheckboxChange} from '@angular/material/checkbox';
import {Endereco} from 'src/app/models/endereco';
import {debounceTime} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {CpfValidator} from "../../../config/validator/cpfValidator";
import {CoolDialogService} from '@angular-cool/dialogs';

@Component({
    selector: 'app-tecnico-create',
    templateUrl: './tecnico-create.component.html',
    styleUrls: ['./tecnico-create.component.css']
})
export class TecnicoCreateComponent implements OnInit {

    tecnicoForm: FormGroup;
    private cepSubject = new Subject<string>();

    constructor(
        private tecnicoService: TecnicoService,
        private cepService: CepService,
        private toast: ToastrService,
        private router: Router,
        private coolDialogService: CoolDialogService
    ) {
        this.tecnicoForm = new FormGroup({
            nome: new FormControl(null, [Validators.required, Validators.maxLength(50)]),
            cpf: new FormControl(null, [Validators.required, CpfValidator.validateCpf]),
            email: new FormControl(null, [Validators.required, Validators.email]),
            senha: new FormControl(null, [Validators.required]),
            cep: new FormControl(null, [
                Validators.required,
                Validators.pattern('^\\d{5}-\\d{3}$|^\\d{8}$')
            ]),
            logradouro: new FormControl({value: null, disabled: true}, [Validators.required]),
            numero: new FormControl({value: null, disabled: true}, [Validators.required]),
            bairro: new FormControl({value: null, disabled: true}, [Validators.required]),
            complemento: new FormControl({value: null, disabled: true}),
            uf: new FormControl({value: null, disabled: true}, [Validators.required]),
            localidade: new FormControl({value: null, disabled: true}, [Validators.required]),
            perfis: new FormControl([2])
        });

        this.cepSubject.pipe(
            debounceTime(300)
        ).subscribe(cep => this.validateCep(cep));
    }

    ngOnInit(): void {
        this.tecnicoForm.get('cep')?.valueChanges.subscribe(() => this.onCepChange());
        this.tecnicoForm.valueChanges.subscribe(() => this.updateButtonState());
        this.updateButtonState();
    }

    onCepChange(): void {
        const cep = this.tecnicoForm.get('cep')?.value;
        if (cep) {
            const cepSemHifen = cep.replace(/\D/g, '');
            if (cepSemHifen.length === 8) {
                this.cepSubject.next(cepSemHifen);
            }
        }
    }

    validateCep(cep: string): void {
        if (cep.length === 8) {
            this.searchCep(cep);
        }
    }

    searchCep(cep: string): void {
        this.cepService.buscarEndereco(cep).subscribe(
            (endereco: Endereco) => {
                if (endereco) {
                    this.tecnicoForm.patchValue({
                        logradouro: endereco.logradouro,
                        numero: endereco.numero,
                        bairro: endereco.bairro,
                        complemento: endereco.complemento,
                        uf: endereco.uf,
                        localidade: endereco.localidade
                    });
                    this.updateAddressFields();
                } else {
                    this.toast.error('CEP não encontrado.');
                }
            },
            (error) => {
                this.toast.error('Erro ao buscar CEP.');
            }
        );
    }

    updateAddressFields(): void {
        const addressFields = ['logradouro', 'numero', 'bairro', 'complemento', 'uf', 'localidade'];
        addressFields.forEach(field => {
            const control = this.tecnicoForm.get(field);
            if (control?.value) {
                control.disable();
            } else {
                control.enable();
            }
        });
        this.updateButtonState();
    }

    updateButtonState(): void {
        const button = document.querySelector('button[color="primary"]');
        if (button) {
            (button as HTMLButtonElement).disabled = !this.tecnicoForm.valid;
        }
    }

    isAddressFieldDisabled(field: string): boolean {
        return this.tecnicoForm.get(field)?.disabled ?? true;
    }

    addPerfil(perfil: number, event: MatCheckboxChange): void {
        const perfis = this.tecnicoForm.get('perfis')?.value || [];
        if (perfil !== 0 && perfil !== 2) {
            this.toast.warning('Apenas os perfis ADMIN e TECNICO são permitidos.');
            event.source.checked = false;
            return;
        }
        if (event.checked) {
            if (!perfis.includes(perfil)) {
                perfis.push(perfil);
            }
        } else {
            perfis.splice(perfis.indexOf(perfil), 1);
        }
        this.tecnicoForm.patchValue({perfis});
        this.updateButtonState();
    }

    isPerfilChecked(perfil: number): boolean {
        return (this.tecnicoForm.get('perfis')?.value || []).includes(perfil);
    }

    validaCampos(): boolean {
        return this.tecnicoForm.valid;
    }

    formatCpf(cpf: string): string {
        return cpf.replace(/\D/g, '')
            .replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }

    formatCep(cep: string): string {
        return cep.replace(/\D/g, '')
            .replace(/(\d{5})(\d{3})/, '$1-$2');
    }

    async create(): Promise<void> {
        if (this.tecnicoForm.valid) {
            const confirmResult = await this.coolDialogService.showDialog({
                titleText: 'Confirmação',
                questionText: 'Você deseja realmente criar o técnico?',
                confirmActionButtonText: 'Sim',
                cancelActionButtonText: 'Cancelar',
                confirmActionButtonColor: 'primary'
            });

            if (confirmResult.isConfirmed) {
                const addressFields = ['logradouro', 'numero', 'bairro', 'complemento', 'uf', 'localidade'];
                addressFields.forEach(field => this.tecnicoForm.get(field)?.enable());
                const formValues = this.tecnicoForm.value;
                const tecnico = {
                    nome: formValues.nome,
                    cpf: this.formatCpf(formValues.cpf),
                    email: formValues.email,
                    senha: formValues.senha,
                    perfis: formValues.perfis,
                    endereco: {
                        cep: this.formatCep(formValues.cep),
                        uf: formValues.uf,
                        localidade: formValues.localidade,
                        logradouro: formValues.logradouro,
                        numero: formValues.numero,
                        bairro: formValues.bairro,
                        complemento: formValues.complemento
                    },
                    dataCriacao: ''
                };

                this.tecnicoService.create(tecnico).subscribe(
                    () => {
                        this.toast.success('Técnico cadastrado com sucesso.');
                        this.router.navigate(['tecnicos']);
                    },
                    (error) => {
                        if (error.error && error.error.message) {
                            this.toast.error(error.error.message, 'Erro');
                        } else {
                            this.toast.error('Erro ao cadastrar técnico.', 'Erro');
                        }
                    }
                );
                addressFields.forEach(field => this.tecnicoForm.get(field)?.disable());
            }
        } else {
            this.toast.warning('Por favor, preencha todos os campos obrigatórios.');
        }
    }
}
