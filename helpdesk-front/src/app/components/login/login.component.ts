import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {ToastrService} from 'ngx-toastr';
import {AuthService} from 'src/app/services/auth.service';
import {HttpResponse} from '@angular/common/http';
import {ThemeService} from "../../services/theme.service";
import {CryptoService} from "../../services/cryptoService";
import {Theme} from "../enum/tema";

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

    loginForm: FormGroup;
    senhaVisible = false;
    isLoadingResults = false;

    constructor(
        private fb: FormBuilder,
        private toast: ToastrService,
        private service: AuthService,
        private router: Router,
        private themeService: ThemeService,
        private cryptoService: CryptoService
    ) {
        this.loginForm = this.fb.group({
            email: ['luiz@mail.com', [Validators.required, Validators.email]],
            senha: ['AdminPass@1234', Validators.required]
        });
    }

    ngOnInit(): void {
        this.themeService.setTheme(Theme.INDIGO_PINK);
    }

    logar() {
        if (this.loginForm.valid) {
            this.isLoadingResults = true;

            const creds = this.loginForm.value;
            const encryptedPassword = this.cryptoService.encrypt(creds.senha);
            const encryptedCreds = {...creds, senha: encryptedPassword};
            this.service.authenticate(encryptedCreds).subscribe(
                (resposta: HttpResponse<string>) => {
                    const authToken = resposta.headers.get('Authorization')?.substring(7);
                    if (authToken) {
                        this.service.successfulLogin(authToken);
                        this.router.navigate(['']);
                    }
                },
                () => {
                    this.toast.error('Usuário e/ou senha inválidos');
                },
                () => {
                    this.isLoadingResults = false;
                }
            );
        } else {
            this.toast.warning('Preencha todos os campos corretamente');
        }
    }

    toggleSenhaVisibility(): void {
        this.senhaVisible = !this.senhaVisible;
    }

    getErrorMessage(controlName: string): string {
        const control = this.loginForm.get(controlName);

        if (control?.hasError('required')) {
            return 'Este campo é obrigatório';
        }

        if (control?.hasError('email')) {
            return 'Digite um email válido';
        }

        if (control?.hasError('minlength')) {
            const minLength = control.errors?.['minlength'].requiredLength;
            return `A senha deve ter no mínimo ${minLength} caracteres`;
        }

        if (control?.hasError('invalidPassword')) {
            return control.errors?.['invalidPassword'];
        }

        return '';
    }
}