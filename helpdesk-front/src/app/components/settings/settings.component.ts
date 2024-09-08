import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators, FormArray, AbstractControl} from '@angular/forms';
import {Router} from '@angular/router';
import {ThemeService} from '../../services/theme.service';
import {UserSettings} from '../../models/userSettings';
import {SettingsService} from '../../services/settingsService';
import {MatSelectChange} from "@angular/material/select";
import {ToastrService} from "ngx-toastr";
import {PasswordValidator} from "../../config/validator/passwordValidator";
import {CryptoService} from "../../services/cryptoService";
import {Theme} from "../enum/tema";

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
    settingsForm: FormGroup;
    showPasswordFields = false;
    showCancelButton = false;
    availableThemes = Object.values(Theme);
    isSaveEnabled = false;
    originalTema: string;
    originalPassword: string;
    showPassword = {senhaAtual: false, senhaNova: false, confirmaSenhaNova: false};
    passwordErrors: any = {};
    isPasswordFieldsRevealed = false;

    constructor(
        private fb: FormBuilder,
        private settingsService: SettingsService,
        private themeService: ThemeService,
        private router: Router,
        private toast: ToastrService,
        private cryptoService: CryptoService
    ) {
        this.settingsForm = this.fb.group({
            id: [{value: '', disabled: true}, Validators.required],
            nome: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            senhaAtual: ['', Validators.required],
            senhaNova: ['', [PasswordValidator.validatePassword]],
            confirmaSenhaNova: ['', [PasswordValidator.validatePassword]],
            tema: [Theme.INDIGO_PINK, Validators.required],
            roles: this.fb.array([])
        }, {validators: this.passwordsMatchValidator});
    }

    ngOnInit(): void {
        this.loadUserSettings();
        this.settingsForm.get('senhaNova')?.valueChanges.subscribe(() => this.validatePassword('senhaNova'));
        this.settingsForm.get('confirmaSenhaNova')?.valueChanges.subscribe(() => this.validatePassword('confirmaSenhaNova'));
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

    updateSettings(): void {
        if (this.settingsForm.valid) {
            const updatedSettings = this.getUpdatedSettings();
            if (!Object.keys(updatedSettings).length) {
                this.toast.info('Nenhuma alteração detectada.', 'Info');
                return;
            }
            this.settingsService.updateUserSettings(updatedSettings).subscribe(
                () => {
                    this.onUpdateSuccess(updatedSettings);
                },
                (error) => this.onUpdateError(error)
            );
        }
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
            updatedSettings.senhaNova = this.cryptoService.encrypt(formValue.senhaNova); // Enviar nova senha criptografada
            this.recolherCamposSenha();
        } else {
            this.toast.error('Preencha todos os campos de senha para atualizar.', 'Erro');
        }
    }

    onUpdateSuccess(updatedSettings: any): void {
        this.isPasswordFieldsRevealed = false;
        this.themeService.getCurrentTheme();
        this.originalTema = updatedSettings.tema || Theme.INDIGO_PINK;
        this.toast.success('Configurações atualizadas com sucesso!', 'Sucesso');
        this.isSaveEnabled = false;
        this.router.navigate(['/settings']);
        this.showPassword.senhaAtual = false;
    }

    onUpdateError(error: any): void {
        this.isPasswordFieldsRevealed = false;
        this.showPassword.senhaAtual = false;
        this.isSaveEnabled = false;
        const errorMessage = error.error?.message || 'Erro desconhecido ao atualizar as configurações.';
        this.toast.error(errorMessage, 'Erro');
        console.error('Erro ao atualizar as configurações', error);
    }

    onThemeChange(event: MatSelectChange): void {
        const newTheme = event.value;
        this.settingsForm.get('tema')?.setValue(newTheme);
        this.themeService.setTheme(newTheme);
        this.updateSaveButtonState();
    }

    setRoles(roles: string[]): void {
        const rolesFormArray = this.settingsForm.get('roles') as FormArray;
        rolesFormArray.clear();
        roles.forEach(role => rolesFormArray.push(this.fb.control(role)));
        this.updateSaveButtonState();
    }

    translateRole(role: string): string {
        return {
            'ROLE_ADMIN': 'Administrador',
            'ROLE_TECNICO': 'Técnico',
            'ROLE_CLIENTE': 'Cliente'
        }[role] || 'Desconhecido';
    }

    revealPasswordFields(): void {
        if (!this.isPasswordFieldsRevealed) {
            this.showPasswordFields = true;
            this.showCancelButton = true;
            this.clearPasswordFields();
            this.setValidatorsForPasswords([Validators.required, PasswordValidator.validatePassword]);
            this.updateSaveButtonState();
            this.isPasswordFieldsRevealed = true;
        }
    }

    clearPasswordFields(): void {
        ['senhaAtual', 'senhaNova', 'confirmaSenhaNova'].forEach(field => this.settingsForm.get(field)?.setValue(''));
    }

    setValidatorsForPasswords(validators: any[]): void {
        this.settingsForm.get('senhaNova')?.setValidators(validators);
        this.settingsForm.get('confirmaSenhaNova')?.setValidators(validators);
        this.settingsForm.get('senhaNova')?.updateValueAndValidity();
        this.settingsForm.get('confirmaSenhaNova')?.updateValueAndValidity();
    }

    cancelPasswordEdit(): void {
        this.recolherCamposSenha();
        Object.keys(this.showPassword).forEach(key => {
            this.showPassword[key as 'senhaAtual' | 'senhaNova' | 'confirmaSenhaNova'] = false;
        });
        this.isSaveEnabled = false;
    }


    private recolherCamposSenha(): void {
        this.showPasswordFields = false;
        this.showCancelButton = false;
        this.settingsForm.patchValue({senhaAtual: this.originalPassword, senhaNova: '', confirmaSenhaNova: ''});
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
        this.isSaveEnabled = this.settingsForm.dirty || this.showPasswordFields;
    }

    get rolesControls() {
        return (this.settingsForm.get('roles') as FormArray).controls as AbstractControl[];
    }

    private passwordsMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
        return group.get('senhaNova')?.value === group.get('confirmaSenhaNova')?.value ? null : {passwordsMismatch: true};
    }

    togglePasswordVisibility(field: 'senhaAtual' | 'senhaNova' | 'confirmaSenhaNova'): void {
        this.showPassword[field] = !this.showPassword[field];
    }

    validatePassword(field: string): void {
        const control = this.settingsForm.get(field);
        if (control?.invalid && (control.dirty || control.touched)) {
            this.passwordErrors[field] = control.errors;
        } else {
            delete this.passwordErrors[field];
        }
    }
}
