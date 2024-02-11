import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class PasswordValidators {
    static minLength(control: AbstractControl) : ValidationErrors | null {
        if ((control.value as string).length <= 5) {
            return { minLengthError: { requiredLength: 5, valueLength: (control.value as string).length} }
        }
        return null;
    }

    static isWeak(control: AbstractControl) : ValidationErrors | null {
        if (/^\d+$/.test(control.value) || control.value.length < 7) {
            return { isWeak: true };
        }
        else if (!(/\d/.test(control.value)) && control.value.length < 10) {
            return { isWeak: true };
        }
        return null;
    }

    static arePasswordsSame(password: string, confirmPassword: string) {
      if (password === null || confirmPassword === null) return null;

      if(password !== confirmPassword) {
        return { arePasswordsSame: false }
      }
      return null;
    }
}
