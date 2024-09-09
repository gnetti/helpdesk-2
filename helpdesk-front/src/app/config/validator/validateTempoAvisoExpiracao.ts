import {AbstractControl, ValidationErrors, ValidatorFn} from '@angular/forms';

export class TempoAvisoExpiracaoValidator {
    static validateJwtExpiracao(control: AbstractControl): ValidationErrors | null {
        const jwtExpiracao = control.value as number;

        if (jwtExpiracao == null) {
            return {'jwtExpiracaoRequired': 'O campo Expiração JWT é obrigatório.'};
        }
        if (jwtExpiracao < 60) {
            return {'jwtExpiracaoMin': 'O valor deve ser pelo menos 60.'};
        }
        if (jwtExpiracao > 1440) {
            return {'jwtExpiracaoMax': 'O valor não pode ser maior que 1440.'};
        }
        return null;
    }

    static validateTempoAvisoExpiracaoMinutos(control: AbstractControl): ValidationErrors | null {
        const tempoAviso = control.value as number;

        if (tempoAviso == null) {
            return {'tempoAvisoRequired': 'O campo Tempo de Aviso de Expiração é obrigatório.'};
        }
        if (tempoAviso < 15) {
            return {'tempoAvisoMin': 'O tempo de aviso deve ser pelo menos 15 minutos.'};
        }
        if (tempoAviso > 30) {
            return {'tempoAvisoMax': 'O tempo de aviso não pode ser maior que 30 minutos.'};
        }
        return null;
    }

    static validateTempoAvisoExpiracao(): ValidatorFn {
        return (formGroup: AbstractControl): ValidationErrors | null => {
            const jwtExpiracaoControl = formGroup.get('jwtExpiracao');
            const tempoAvisoControl = formGroup.get('tempoAvisoExpiracaoMinutos');

            if (!jwtExpiracaoControl || !tempoAvisoControl) {
                console.log('Controles não encontrados');
                return null;
            }

            const jwtExpiracao = jwtExpiracaoControl.value as number;
            const tempoAviso = tempoAvisoControl.value as number;
            const errors: ValidationErrors = {};
            const jwtExpiracaoErrors = TempoAvisoExpiracaoValidator.validateJwtExpiracao(jwtExpiracaoControl);
            const tempoAvisoErrors = TempoAvisoExpiracaoValidator.validateTempoAvisoExpiracaoMinutos(tempoAvisoControl);
            if (jwtExpiracaoErrors) {
                Object.assign(errors, jwtExpiracaoErrors);
            }
            if (tempoAvisoErrors) {
                Object.assign(errors, tempoAvisoErrors);
            }
            if (jwtExpiracao != null && tempoAviso != null && jwtExpiracao - tempoAviso < 15) {
                errors['tempoAvisoInadequado'] = 'O tempo de aviso deve garantir pelo menos 15 minutos antes da expiração do JWT.';
                tempoAvisoControl.setErrors({
                    ...tempoAvisoControl.errors,
                    'tempoAvisoInadequado': 'O tempo de aviso deve garantir pelo menos 15 minutos antes da expiração do JWT.'
                });
            } else {
                if (tempoAvisoControl.errors && tempoAvisoControl.errors['tempoAvisoInadequado']) {
                    const {tempoAvisoInadequado, ...rest} = tempoAvisoControl.errors;
                    tempoAvisoControl.setErrors(Object.keys(rest).length ? rest : null);
                }
            }
            return Object.keys(errors).length ? errors : null;
        };
    }
}
