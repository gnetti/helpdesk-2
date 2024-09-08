import {AbstractControl, ValidationErrors, ValidatorFn} from '@angular/forms';

export class JwtExpiracaoValidator {
    static validateJwtExpiracao(control: AbstractControl): ValidationErrors | null {
        const jwtExpiracao = control.value as number;
        if (jwtExpiracao === null || jwtExpiracao === undefined) {
            return null;
        }
        if (jwtExpiracao < 30) {
            return {min: 'O valor deve ser pelo menos 30.'};
        }
        if (jwtExpiracao > 60) {
            return {max: 'O valor não pode ser maior que 60.'};
        }
        return null;
    }
}
