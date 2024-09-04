import { AbstractControl, ValidationErrors } from '@angular/forms';

export class CpfValidator {
    static validateCpf(control: AbstractControl): ValidationErrors | null {
        const cpf = control.value as string;

        if (!cpf) return null;

        // Remove caracteres não numéricos (pontos e traço)
        const cleanedCpf = cpf.replace(/\D/g, '');

        // Verifica se o CPF tem 11 dígitos após remover a máscara
        if (cleanedCpf.length !== 11) return { invalidCpf: true };

        // Verifica se todos os dígitos são iguais (ex: 111.111.111-11)
        if (/^(\d)\1+$/.test(cleanedCpf)) return { invalidCpf: true };

        // Valida o primeiro dígito verificador
        let sum = 0;
        let remainder;

        for (let i = 1; i <= 9; i++) {
            sum += parseInt(cleanedCpf.charAt(i - 1)) * (11 - i);
        }
        remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(cleanedCpf.charAt(9))) return { invalidCpf: true };

        // Valida o segundo dígito verificador
        sum = 0;
        for (let i = 1; i <= 10; i++) {
            sum += parseInt(cleanedCpf.charAt(i - 1)) * (12 - i);
        }
        remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(cleanedCpf.charAt(10))) return { invalidCpf: true };

        return null;
    }
}
