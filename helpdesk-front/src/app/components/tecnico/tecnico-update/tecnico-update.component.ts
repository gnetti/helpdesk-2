import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {ToastrService} from 'ngx-toastr';
import {TecnicoService} from 'src/app/services/tecnico.service';
import {CepService} from 'src/app/services/cep.service';
import {MatCheckboxChange} from '@angular/material/checkbox';
import {Endereco} from 'src/app/models/endereco';
import {debounceTime} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {CpfValidator} from 'src/app/config/validator/cpfValidator';
import {CoolDialogService} from '@angular-cool/dialogs';

@Component({
    selector: 'app-tecnico-update',
    templateUrl: './tecnico-update.component.html',
    styleUrls: ['./tecnico-update.component.css']
})
export class TecnicoUpdateComponent implements OnInit {

    tecnicoForm: FormGroup;
    private cepSubject = new Subject<string>();
    private tecnicoId: string | null = null;
    private originalCep: string | null = null;
    private cepAlterado: boolean = false;
    private isLoading: boolean = true;

    constructor(
        private tecnicoService: TecnicoService,
        private cepService: CepService,
        private toast: ToastrService,
        private router: Router,
        private route: ActivatedRoute,
        private coolDialogService: CoolDialogService,
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
            perfis: new FormControl([])
        });
        this.cepSubject.pipe(debounceTime(300)).subscribe(cep => this.validateCep(cep));
    }

    ngOnInit(): void {
        this.tecnicoForm.get('cep')?.valueChanges.subscribe(() => this.onCepChange());
        this.tecnicoForm.valueChanges.subscribe(() => this.updateButtonState());
        this.tecnicoId = this.route.snapshot.paramMap.get('id');
        if (this.tecnicoId) {
            this.findById();
        }
        this.updateButtonState();
    }

    findById(): void {
        if (this.tecnicoId) {
            this.tecnicoService.findById(this.tecnicoId).subscribe(
                (resposta) => {
                    this.tecnicoForm.patchValue({
                        nome: resposta.nome,
                        cpf: resposta.cpf,
                        email: resposta.email,
                        senha: resposta.senha,
                        cep: resposta.endereco.cep,
                        logradouro: resposta.endereco.logradouro,
                        numero: resposta.endereco.numero,
                        bairro: resposta.endereco.bairro,
                        complemento: resposta.endereco.complemento,
                        uf: resposta.endereco.uf,
                        localidade: resposta.endereco.localidade,
                        perfis: resposta.perfis
                    });
                    this.originalCep = resposta.endereco.cep;
                    this.cepAlterado = false;
                    this.isLoading = false;
                    this.updateAddressFields();
                },
                (error) => {
                    this.toast.error('Erro ao carregar dados do técnico.');
                }
            );
        }
    }

    onCepChange(): void {
        if (this.isLoading) return;

        const cep = this.tecnicoForm.get('cep')?.value;
        if (cep) {
            const cepSemHifen = cep.replace(/\D/g, '');
            if (cepSemHifen.length === 8) {
                if (this.cepAlterado || cepSemHifen !== this.originalCep) {
                    this.cepAlterado = true;
                    this.cepSubject.next(cepSemHifen);
                }
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
        const addressFields = ['logradouro', 'bairro', 'uf', 'localidade'];
        addressFields.forEach(field => {
            const control = this.tecnicoForm.get(field);
            if (control?.value) {
                control.disable();
            } else {
                control.enable();
            }
        });
        this.tecnicoForm.get('complemento')?.enable();
        this.tecnicoForm.get('numero')?.enable();

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
        if (perfil === 2 && !event.checked) {
            this.toast.warning('O perfil Técnico não pode ser desmarcado.');
            setTimeout(() => {
                event.source.checked = true;
            }, 0);
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

    async update(): Promise<void> {
        if (this.tecnicoForm.valid && this.tecnicoId) {
            const confirmResult = await this.coolDialogService.showDialog({
                titleText: 'Confirmação',
                questionText: 'Você deseja realmente atualizar as informações do técnico?',
                confirmActionButtonText: 'Sim',
                cancelActionButtonText: 'Cancelar',
                confirmActionButtonColor: 'primary'
            });
            if (confirmResult.isConfirmed) {
                const addressFields = ['logradouro', 'numero', 'bairro', 'complemento', 'uf', 'localidade'];
                addressFields.forEach(field => this.tecnicoForm.get(field)?.enable());

                const formValues = this.tecnicoForm.value;
                const tecnico = {
                    id: this.tecnicoId,
                    nome: formValues.nome,
                    cpf: this.formatCpf(formValues.cpf),
                    email: formValues.email,
                    senha: formValues.senha,
                    perfis: formValues.perfis,
                    endereco: {
                        cep: this.formatCep(formValues.cep),
                        logradouro: formValues.logradouro,
                        numero: formValues.numero,
                        bairro: formValues.bairro,
                        complemento: formValues.complemento,
                        uf: formValues.uf,
                        localidade: formValues.localidade
                    },
                    dataCriacao: formValues.dataCriacao
                };

                this.tecnicoService.update(tecnico).subscribe(
                    () => {
                        this.toast.success('Técnico atualizado com sucesso!');
                        this.router.navigate(['tecnicos']);
                    },
                    (error) => {
                        if (error.status === 403) {
                            this.toast.error('Você não tem permissão para atualizar o Administrador.');
                        } else {
                            this.toast.error('Erro ao atualizar técnico.');
                        }
                    }
                );
            }
        } else {
            this.toast.warning('Preencha todos os campos obrigatórios.');
        }
    }

    cancel(): void {
        this.router.navigate(['/tecnicos']);
    }
}
