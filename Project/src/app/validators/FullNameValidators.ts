import { AbstractControl, ValidationErrors } from '@angular/forms';

export class FullNameValidators {
    static isInvalidFullName(control: AbstractControl) : ValidationErrors | null {
        if ((control.value as string).indexOf(' ') <= 0 ||
            (control.value as string).indexOf(' ') === (control.value as string).length - 1 ||
            (control.value as string).charAt((control.value as string).indexOf(' ') + 1) === '') {
            return { isInvalidFullName: true }
        }
        return null;
    }
}
