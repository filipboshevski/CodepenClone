import { AbstractControl, ValidationErrors } from '@angular/forms';

export class EmailValidators {
    static isInvalidEmail(control: AbstractControl) : ValidationErrors | null {
      const validRegex = new RegExp("^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$");
        if(!validRegex.test(control.value)) {
            return { isInvalidEmail: true }
        }
        return null;
    }

    static containsWhiteSpace(control: AbstractControl) : ValidationErrors | null {
        if ((control.value as string).indexOf(' ') >= 0) {
            return { containsWhiteSpace: true }
        }
        return null;
    }
}
