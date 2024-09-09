import {Component, OnInit} from '@angular/core';
import {AbstractControl, FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ThemeService} from '../../services/theme.service';
import {UserSettings} from '../../models/userSettings';
import {SettingsService} from '../../services/settingsService';
import {MatSelectChange} from "@angular/material/select";
import {ToastrService} from "ngx-toastr";
import {PasswordValidator} from "../../config/validator/passwordValidator";
import {CryptoService} from "../../services/cryptoService";
import {Theme} from "../enum/tema";
import {AuthService} from "../../services/auth.service";
import {getUserRoles, UserRole} from "../enum/userRole";
import {TokenTempoService} from "../../services/tokenTempo.service";
import {TokenTempo} from "../../models/TokenTempo";
import {TempoAvisoExpiracaoValidator} from "../../config/validator/validateTokenTempo";

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
    settingsForm: FormGroup;
    adminSettingsForm: FormGroup;
    showPasswordFields = false;
    showCancelButton = false;
    availableThemes = Object.values(Theme);
    isSaveEnabled = false;
    originalTema: string;
    originalPassword: string;
    showPassword = {senhaAtual: false, senhaNova: false, confirmaSenhaNova: false};
    passwordErrors: any = {};
    isPasswordFieldsRevealed = false;
    showTokenFields = false;
    perfis: { value: UserRole; label: string }[] = [];
    selectedRole: UserRole = UserRole.ADMIN;
    UserRole = UserRole;
    adminSettingsId: number | null = null;
    originalAdminSettings: any = {};
    hasClickedSenhaAtual = false;
    perfilId: number | null = null;
    isNewProfile: boolean = false;
    isSaving: boolean = false;
    shownNewProfileMessages: { [key in UserRole]?: boolean } = {};

    constructor(
        private fb: FormBuilder,
        private settingsService: SettingsService,
        private themeService: ThemeService,
        private toast: ToastrService,
        private cryptoService: CryptoService,
        private authService: AuthService,
        private tokenTempoService: TokenTempoService,
    ) {
        this.initForms();
    }

    ngOnInit(): void {
        this.loadUserSettings();
        this.settingsForm.get('senhaNova')?.valueChanges.subscribe(() => this.validatePassword('senhaNova'));
        this.settingsForm.get('confirmaSenhaNova')?.valueChanges.subscribe(() => this.validatePassword('confirmaSenhaNova'));
        this.checkIfUserIsAdmin();
        this.initPerfis();
        this.setupAdminFormListener();
        this.loadInitialAdminSettings();
        this.setupFormChangeListeners();
    }

    private initForms(): void {
        this.settingsForm = this.fb.group({
            id: [{value: '', disabled: true}, Validators.required],
            nome: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            senhaAtual: [''],
            senhaNova: ['', [PasswordValidator.validatePassword]],
            confirmaSenhaNova: ['', [PasswordValidator.validatePassword]],
            tema: [Theme.INDIGO_PINK, Validators.required],
            roles: this.fb.array([]),
        }, {validators: this.passwordsMatchValidator});

        this.adminSettingsForm = this.fb.group({
            perfil: [this.UserRole.ADMIN, Validators.required],
            tokenTempoExpiracaoMinutos: ['', [TempoAvisoExpiracaoValidator.validateJwtExpiracao]],
            tempoTokenExibeDialogoMinutos: ['', [TempoAvisoExpiracaoValidator.validateTempoAvisoExpiracaoMinutos]],
            tempoExibicaoDialogoAtualizaTokenMinutos: ['', [Validators.required, Validators.min(2), Validators.max(15)]],
            intervaloAtualizacaoTokenMinutos: ['', [Validators.required, Validators.min(0.5), Validators.max(5)]]
        }, {
            validators: TempoAvisoExpiracaoValidator.validateTempoAvisoExpiracao()
        });
    }

    private setupFormChangeListeners(): void {
        this.settingsForm.valueChanges.subscribe(() => {
            this.updateSaveButtonState();
        });

        this.adminSettingsForm.valueChanges.subscribe(() => {
            this.updateSaveButtonState();
        });
    }

    private initPerfis(): void {
        this.perfis = getUserRoles().map(role => ({
            value: UserRole[role as keyof typeof UserRole],
            label: role
        }));
    }

    private setupAdminFormListener(): void {
        this.adminSettingsForm.get('perfil')?.valueChanges.subscribe((value) => {
            if (value) {
                this.selectedRole = value;
                this.loadAdminSettings(this.selectedRole);
            } else {
                this.selectedRole = UserRole.ADMIN;
                this.loadAdminSettings(this.selectedRole);
            }
        });
    }

    private loadInitialAdminSettings(): void {
        const initialRole = this.adminSettingsForm.get('perfil')?.value || UserRole.ADMIN;
        this.selectedRole = initialRole;
        this.loadAdminSettings(this.selectedRole);
    }

    checkIfUserIsAdmin(): void {
        if (this.authService.isUserIdOne()) {
            this.showTokenFields = true;
        }
    }

    onPerfilChange(value: string): void {
        if (Object.values(UserRole).includes(value as unknown as UserRole)) {
            this.selectedRole = value as unknown as UserRole;
            this.shownNewProfileMessages[this.selectedRole] = false;
            this.loadAdminSettings(this.selectedRole);
        } else {
        }
    }

    loadAdminSettings(perfil: UserRole): void {
        this.tokenTempoService.findByPerfil(UserRole[perfil]).subscribe({
            next: (settings: TokenTempo | null) => {
                if (settings) {
                    this.adminSettingsId = settings.id;
                    this.perfilId = settings.id;
                    this.patchFormWithAdminSettings(settings);
                    this.showTokenFields = true;
                    this.originalAdminSettings = {...settings};
                    this.adminSettingsForm.markAsPristine();
                    this.updateSaveButtonState();
                    this.isNewProfile = false;
                    this.showIdField();
                    this.shownNewProfileMessages[perfil] = false;
                } else {
                    this.initializeAdminSettingsWithDefaults();
                    this.showToastForNewProfile(perfil);
                }
            },
            error: (error: any) => {
                if (error === null || (typeof error === 'function' && error() === null)) {
                    this.initializeAdminSettingsWithDefaults();
                    this.showToastForNewProfile(perfil);
                } else {
                    this.toast.warning('Erro ao carregar configurações de admin.', 'Erro');
                }
            }
        });
    }

    private showToastForNewProfile(perfil: UserRole): void {
        if (!this.shownNewProfileMessages[perfil]) {
            let perfilName: string;
            switch (perfil) {
                case UserRole.ADMIN:
                    perfilName = 'ROLE_ADMIN';
                    break;
                case UserRole.TECNICO:
                    perfilName = 'ROLE_TECNICO';
                    break;
                case UserRole.CLIENTE:
                    perfilName = 'ROLE_CLIENTE';
                    break;
                default:
                    perfilName = 'Desconhecido';
            }
            this.toast.info(`Não encontrado dados para o perfil ${this.translateRole(perfilName)}, você deve cadastrar!`, 'Info');
            this.shownNewProfileMessages[perfil] = true;
        }
    }

    private initializeAdminSettingsWithDefaults(): void {
        const defaultSettings = {
            tokenTempoExpiracaoMinutos: 1440,
            tempoTokenExibeDialogoMinutos: 30,
            tempoExibicaoDialogoAtualizaTokenMinutos: 15,
            intervaloAtualizacaoTokenMinutos: 1
        };
        this.adminSettingsForm.patchValue(defaultSettings);
        this.originalAdminSettings = {...defaultSettings};
        this.adminSettingsId = null;
        this.perfilId = null;
        this.adminSettingsForm.markAsDirty();
        this.showTokenFields = true;
        this.isNewProfile = true;
        this.hideIdField();
    }

    private hideIdField(): void {
        const idControl = this.adminSettingsForm.get('id');
        if (idControl) {
            idControl.disable();
            idControl.setValue(null);
        }
        this.adminSettingsForm.removeControl('id');
    }

    private showIdField(): void {
        if (!this.adminSettingsForm.contains('id')) {
            this.adminSettingsForm.addControl('id', this.fb.control({value: '', disabled: true}));
        }
        const idControl = this.adminSettingsForm.get('id');
        if (idControl) {
            idControl.enable();
        }
    }

    patchFormWithAdminSettings(settings: TokenTempo): void {
        this.adminSettingsForm.patchValue({
            tokenTempoExpiracaoMinutos: settings.tokenTempoExpiracaoMinutos,
            tempoTokenExibeDialogoMinutos: settings.tempoTokenExibeDialogoMinutos,
            tempoExibicaoDialogoAtualizaTokenMinutos: settings.tempoExibicaoDialogoAtualizaTokenMinutos,
            intervaloAtualizacaoTokenMinutos: settings.intervaloAtualizacaoTokenMinutos
        });
    }

    loadUserSettings(): void {
        this.settingsService.getUserSettings().subscribe(
            (settings: UserSettings) => {
                this.patchFormWithSettings(settings);
                this.themeService.setTheme(settings.tema as Theme || Theme.INDIGO_PINK);
                this.originalTema = settings.tema;
                this.updateSaveButtonState();
            },
            () => this.toast.error('Erro ao carregar configurações de usuário.', 'Erro')
        );
    }

    patchFormWithSettings(settings: UserSettings): void {
        this.settingsForm.patchValue({
            id: settings.id,
            nome: settings.nome,
            email: settings.email,
            senhaAtual: settings.senha,
            tema: settings.tema
        });
        this.originalPassword = settings.senha;
        this.setRoles(settings.roles);
    }

    setRoles(roles: string[]): void {
        const rolesFormArray = this.settingsForm.get('roles') as FormArray;
        rolesFormArray.clear();
        roles.forEach(role => rolesFormArray.push(this.fb.control(role)));
    }

    isAnySaveEnabled(): boolean {
        return this.settingsForm.dirty || this.adminSettingsForm.dirty;
    }

    saveAllSettings(): void {
        const userSettingsChanged = this.settingsForm.dirty;
        const adminSettingsChanged = this.adminSettingsForm.dirty;

        if (!userSettingsChanged && !adminSettingsChanged) {
            this.toast.info('Nenhuma alteração detectada.', 'Info');
            return;
        }

        let userSettingsPromise = Promise.resolve();
        let adminSettingsPromise = Promise.resolve();

        if (userSettingsChanged) {
            userSettingsPromise = this.updateSettingsAsync();
        }

        if (adminSettingsChanged) {
            adminSettingsPromise = this.updateAdminSettingsAsync();
        }

        Promise.all([userSettingsPromise, adminSettingsPromise])
            .then(() => {
                this.toast.success('Todas as configurações foram atualizadas com sucesso!', 'Sucesso');
                this.adminSettingsForm.markAsPristine();
                this.settingsForm.markAsPristine();
                this.updateSaveButtonState();
            })
            .catch((error) => {
            });
    }

    private updateSettingsAsync(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.settingsForm.valid) {
                const updatedSettings = this.getUpdatedSettings();
                if (Object.keys(updatedSettings).length) {
                    this.settingsService.updateUserSettings(updatedSettings).subscribe(
                        (response: any) => {
                            this.onUpdateSuccess(response);
                            resolve();
                        },
                        (error) => {
                            this.onUpdateError(error);
                            reject(error);
                        }
                    );
                } else {
                    resolve();
                }
            } else {
                reject(new Error('Formulário de configurações de usuário inválido.'));
            }
        });
    }

    private updateAdminSettingsAsync(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.isSaving = true;
            if (this.adminSettingsForm.valid || this.isSaving) {
                const updatedAdminSettings = this.adminSettingsForm.getRawValue();
                delete updatedAdminSettings.perfil;
                delete updatedAdminSettings.id;

                const tokenTempo: TokenTempo = {
                    id: this.isNewProfile ? null : this.adminSettingsId,
                    perfil: UserRole[this.selectedRole],
                    ...updatedAdminSettings
                };

                const operation = this.isNewProfile
                    ? this.tokenTempoService.create(tokenTempo)
                    : this.tokenTempoService.update(this.adminSettingsId!, tokenTempo);

                operation.subscribe({
                    next: (response) => {
                        this.adminSettingsId = response.id;
                        this.perfilId = response.id;
                        this.isNewProfile = false;
                        this.showIdField();
                        this.loadAdminSettings(this.selectedRole);
                        this.isSaving = false;
                        resolve();
                    },
                    error: (error) => {
                        this.toast.error('Erro ao atualizar configurações de admin.', 'Erro');
                        this.isSaving = false;
                        reject(error);
                    }
                });
            } else {
                this.toast.error('Formulário de configurações de administrador inválido.', 'Erro');
                this.isSaving = false;
                reject(new Error('Formulário de configurações de administrador inválido.'));
            }
        });
    }

    getUpdatedSettings(): any {
        const formValue = this.settingsForm.getRawValue();
        const updatedSettings: any = {};
        this.compareAndUpdate('tema', this.originalTema, updatedSettings, formValue);
        this.compareAndUpdate('nome', this.settingsForm.get('nome')?.value, updatedSettings, formValue);
        this.compareAndUpdate('email', this.settingsForm.get('email')?.value, updatedSettings, formValue);
        const currentRoles = formValue.roles.map(roleControl => roleControl.value);
        if (JSON.stringify(currentRoles) !== JSON.stringify(this.settingsForm.get('roles')?.value)) {
            updatedSettings.roles = currentRoles;
        }
        if (this.showPasswordFields) {
            this.handlePasswordUpdate(formValue, updatedSettings);
        }
        return updatedSettings;
    }

    compareAndUpdate(field: string, originalValue: any, updatedSettings: any, formValue: any): void {
        if (originalValue !== formValue[field]) {
            updatedSettings[field] = formValue[field];
        }
    }

    handlePasswordUpdate(formValue: any, updatedSettings: any): void {
        if (formValue.senhaAtual && formValue.senhaNova && formValue.confirmaSenhaNova) {
            if (formValue.senhaNova !== formValue.confirmaSenhaNova) {
                this.toast.error('As senhas não coincidem.', 'Erro');
                return;
            }
            updatedSettings.senhaAtual = this.cryptoService.encrypt(formValue.senhaAtual);
            updatedSettings.senhaNova = this.cryptoService.encrypt(formValue.senhaNova);
            this.recolherCamposSenha();
        } else {
            this.toast.error('Preencha todos os campos de senha para atualizar.', 'Erro');
        }
    }

    onUpdateSuccess(updatedSettings: any): void {
        this.isPasswordFieldsRevealed = false;
        this.themeService.getCurrentTheme();
        this.originalTema = updatedSettings.tema || Theme.INDIGO_PINK;

        if (updatedSettings.senha) {
            this.originalPassword = updatedSettings.senha;
            this.settingsForm.patchValue({
                senhaAtual: updatedSettings.senha
            });
        }

        this.setRoles(updatedSettings.roles);

        this.settingsForm.get('senhaAtual')?.clearValidators();
        this.settingsForm.get('senhaAtual')?.updateValueAndValidity();
        this.hideAllPasswords();
        this.recolherCamposSenha();
        this.settingsForm.markAsPristine();
        this.updateSaveButtonState();
        this.hasClickedSenhaAtual = false;
        this.settingsForm.patchValue({
            nome: updatedSettings.nome,
            email: updatedSettings.email,
            tema: updatedSettings.tema,
            senhaAtual: updatedSettings.senha
        });
    }

    onUpdateError(error: any): void {
        this.isPasswordFieldsRevealed = false;
        this.hideAllPasswords();
        let errorMessage = error.error?.message || 'Erro desconhecido ao atualizar as configurações.';

        if (error.error instanceof ErrorEvent) {
            errorMessage = `Erro: ${error.error.message}`;
        } else if (error.status === 403) {
            errorMessage = 'Acesso negado: Apenas o Administrador pode acessar este recurso.';
        } else if (error.status === 404) {
            errorMessage = 'Objeto não encontrado.';
        } else if (error.status === 409) {
            errorMessage = 'Já existe um registro para o perfil selecionado.';
        }

        this.toast.error(errorMessage, 'Erro');
        this.handlePasswordUpdateError();
        this.isSaveEnabled = false;
    }

    handlePasswordUpdateError(): void {
        this.settingsForm.patchValue({
            senhaAtual: this.originalPassword,
            senhaNova: '',
            confirmaSenhaNova: ''
        });
        this.settingsForm.get('senhaAtual')?.clearValidators();
        this.settingsForm.get('senhaAtual')?.updateValueAndValidity();
        this.settingsForm.markAsPristine();
        this.updateSaveButtonState();
        this.hasClickedSenhaAtual = false;
    }

    onThemeChange(event: MatSelectChange): void {
        const newTheme = event.value;
        this.settingsForm.get('tema')?.setValue(newTheme);
        this.themeService.setTheme(newTheme);
        this.updateSaveButtonState();
    }

    translateRole(role: string): string {
        return {
            'ROLE_ADMIN': 'ADMIN',
            'ROLE_TECNICO': 'TÉCNICO',
            'ROLE_CLIENTE': 'CLIENTE'
        }[role] || 'Desconhecido';
    }

    revealPasswordFields(): void {
        this.showPasswordFields = true;
        this.showCancelButton = true;
        this.setValidatorsForPasswords([Validators.required, PasswordValidator.validatePassword]);
        this.updateSaveButtonState();
    }

    setValidatorsForPasswords(validators: any[]): void {
        this.settingsForm.get('senhaNova')?.setValidators(validators);
        this.settingsForm.get('confirmaSenhaNova')?.setValidators(validators);
        this.settingsForm.get('senhaNova')?.updateValueAndValidity();
        this.settingsForm.get('confirmaSenhaNova')?.updateValueAndValidity();
    }

    cancelPasswordEdit(): void {
        this.recolherCamposSenha();
        this.hideAllPasswords();
        this.settingsForm.patchValue({
            senhaAtual: this.originalPassword,
            senhaNova: '',
            confirmaSenhaNova: ''
        });
        this.settingsForm.get('senhaAtual')?.clearValidators();
        this.settingsForm.get('senhaAtual')?.updateValueAndValidity();
        this.settingsForm.markAsPristine();
        this.updateSaveButtonState();
        this.hasClickedSenhaAtual = false;
    }

    private recolherCamposSenha(): void {
        this.showPasswordFields = false;
        this.showCancelButton = false;
        this.settingsForm.patchValue({senhaAtual: '', senhaNova: '', confirmaSenhaNova: ''});
        this.clearValidatorsForPasswords();
        this.updateSaveButtonState();
    }

    clearValidatorsForPasswords(): void {
        ['senhaNova', 'confirmaSenhaNova'].forEach(field => {
            this.settingsForm.get(field)?.clearValidators();
            this.settingsForm.get(field)?.updateValueAndValidity();
        });
    }

    updateSaveButtonState(): void {
        this.isSaveEnabled = this.isAnySaveEnabled();
    }

    get rolesControls() {
        return (this.settingsForm.get('roles') as FormArray).controls as AbstractControl[];
    }

    private passwordsMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
        return group.get('senhaNova')?.value === group.get('confirmaSenhaNova')?.value ? null : {passwordsMismatch: true};
    }

    togglePasswordVisibility(field: 'senhaAtual' | 'senhaNova' | 'confirmaSenhaNova'): void {
        this.showPassword[field] = !this.showPassword[field];
        if (field === 'senhaAtual' && !this.hasClickedSenhaAtual) {
            this.settingsForm.patchValue({senhaAtual: ''});
            this.hasClickedSenhaAtual = true;
            this.revealPasswordFields();
        }
    }

    hideAllPasswords(): void {
        this.showPassword.senhaAtual = false;
        this.showPassword.senhaNova = false;
        this.showPassword.confirmaSenhaNova = false;
    }

    validatePassword(field: string): void {
        const control = this.settingsForm.get(field);
        if (control?.invalid && (control.dirty || control.touched)) {
            this.passwordErrors[field] = control.errors;
        } else {
            delete this.passwordErrors[field];
        }
    }

    handleSenhaAtualChange(): void {
        if (!this.hasClickedSenhaAtual) {
            this.settingsForm.patchValue({senhaAtual: ''});
            this.hasClickedSenhaAtual = true;
            this.revealPasswordFields();
        }
    }
}
