import {AbstractControl, ValidationErrors, ValidatorFn} from '@angular/forms';

export class TempoAvisoExpiracaoValidator {
    static validateJwtExpiracao(control: AbstractControl): ValidationErrors | null {
        const tokenTempoExpiracaoMinutos = control.value as number;

        if (tokenTempoExpiracaoMinutos == null) {
            return {'tokenTempoExpiracaoMinutosRequired': 'O campo Tempo de Expiração do Token é obrigatório.'};
        }
        if (tokenTempoExpiracaoMinutos < 60) {
            return {'tokenTempoExpiracaoMinutosMin': 'O valor deve ser pelo menos 60.'};
        }
        if (tokenTempoExpiracaoMinutos > 1440) {
            return {'tokenTempoExpiracaoMinutosMax': 'O valor não pode ser maior que 1440.'};
        }
        return null;
    }

    static validateTempoAvisoExpiracaoMinutos(control: AbstractControl): ValidationErrors | null {
        const tempoTokenExibeDialogoMinutos = control.value as number;

        if (tempoTokenExibeDialogoMinutos == null) {
            return {'tempoTokenExibeDialogoMinutosRequired': 'O campo Tempo para Exibir Diálogo de Token é obrigatório.'};
        }
        if (tempoTokenExibeDialogoMinutos < 15) {
            return {'tempoTokenExibeDialogoMinutosMin': 'O tempo para exibir o diálogo deve ser pelo menos 15 minutos.'};
        }
        if (tempoTokenExibeDialogoMinutos > 30) {
            return {'tempoTokenExibeDialogoMinutosMax': 'O tempo para exibir o diálogo não pode ser maior que 30 minutos.'};
        }
        return null;
    }

    static validateTempoAvisoExpiracao(): ValidatorFn {
        return (formGroup: AbstractControl): ValidationErrors | null => {
            const tokenTempoExpiracaoMinutosControl = formGroup.get('tokenTempoExpiracaoMinutos');
            const tempoTokenExibeDialogoMinutosControl = formGroup.get('tempoTokenExibeDialogoMinutos');

            if (!tokenTempoExpiracaoMinutosControl || !tempoTokenExibeDialogoMinutosControl) {
                console.log('Controles não encontrados');
                return null;
            }

            const tokenTempoExpiracaoMinutos = tokenTempoExpiracaoMinutosControl.value as number;
            const tempoTokenExibeDialogoMinutos = tempoTokenExibeDialogoMinutosControl.value as number;
            const errors: ValidationErrors = {};
            const tokenTempoExpiracaoMinutosErrors = TempoAvisoExpiracaoValidator.validateJwtExpiracao(tokenTempoExpiracaoMinutosControl);
            const tempoTokenExibeDialogoMinutosErrors = TempoAvisoExpiracaoValidator.validateTempoAvisoExpiracaoMinutos(tempoTokenExibeDialogoMinutosControl);
            if (tokenTempoExpiracaoMinutosErrors) {
                Object.assign(errors, tokenTempoExpiracaoMinutosErrors);
            }
            if (tempoTokenExibeDialogoMinutosErrors) {
                Object.assign(errors, tempoTokenExibeDialogoMinutosErrors);
            }
            if (tokenTempoExpiracaoMinutos != null && tempoTokenExibeDialogoMinutos != null && tokenTempoExpiracaoMinutos - tempoTokenExibeDialogoMinutos < 15) {
                errors['tempoAvisoInadequado'] = 'O tempo para exibir o diálogo deve garantir pelo menos 15 minutos antes da expiração do Token.';
                tempoTokenExibeDialogoMinutosControl.setErrors({
                    ...tempoTokenExibeDialogoMinutosControl.errors,
                    'tempoAvisoInadequado': 'O tempo para exibir o diálogo deve garantir pelo menos 15 minutos antes da expiração do Token.'
                });
            } else {
                if (tempoTokenExibeDialogoMinutosControl.errors && tempoTokenExibeDialogoMinutosControl.errors['tempoAvisoInadequado']) {
                    const {tempoAvisoInadequado, ...rest} = tempoTokenExibeDialogoMinutosControl.errors;
                    tempoTokenExibeDialogoMinutosControl.setErrors(Object.keys(rest).length ? rest : null);
                }
            }
            return Object.keys(errors).length ? errors : null;
        };
    }
}
