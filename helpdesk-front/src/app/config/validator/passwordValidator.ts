import {AbstractControl, ValidationErrors} from '@angular/forms';

export class PasswordValidator {
    static validatePassword(control: AbstractControl): ValidationErrors | null {
        const password = control.value as string;
        if (!password) return null;
        if (password.length < 10) return {invalidPassword: 'A senha deve ter pelo menos 10 caracteres.'};
        if (!/\d/.test(password)) return {invalidPassword: 'A senha deve conter pelo menos um número.'};
        if (!/[A-Z]/.test(password)) return {invalidPassword: 'A senha deve conter pelo menos uma letra maiúscula.'};
        if (!/[a-z]/.test(password)) return {invalidPassword: 'A senha deve conter pelo menos uma letra minúscula.'};
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            return {invalidPassword: 'A senha deve conter pelo menos um caractere especial.'};
        }
        return null;
    }
}
