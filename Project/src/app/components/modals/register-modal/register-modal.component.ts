import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { SourceCode } from 'src/app/models/SourceCode';
import { UserSession } from 'src/app/models/UserSession';
import { SessionService } from 'src/app/services/session.service';
import { SourceService } from 'src/app/services/source.service';
import { EmailValidators } from 'src/app/validators/EmailValidators';
import { FullNameValidators } from 'src/app/validators/FullNameValidators';
import { PasswordValidators } from 'src/app/validators/PasswordValidators';

@Component({
  selector: 'app-register-modal',
  templateUrl: './register-modal.component.html',
  styleUrls: ['../login-modal/login-modal.component.css']
})
export class RegisterModalComponent implements OnInit {
  public isValid: boolean | null = null;
  public emptyForm: boolean | null = null;
  public error: any | null = null;
  public arePasswordsSame!: boolean;
  private toastrTitle = '';
  private toastrConfig = { toastClass: 'ngx-toastr margin-top-15', timeOut: 2000 };

  @Output() onRegister: EventEmitter<UserSession>;

  constructor(private sessionService: SessionService, private translate: TranslateService, private toastr: ToastrService, private sourceService: SourceService) {
    this.arePasswordsSame = true;
    this.onRegister = new EventEmitter<UserSession>();
  }

  form = new FormGroup({
    email: new FormControl('', [
      Validators.required,
      EmailValidators.isInvalidEmail,
      EmailValidators.containsWhiteSpace
    ]),
    password: new FormControl('', [
      Validators.required,
      EmailValidators.containsWhiteSpace,
      PasswordValidators.minLength,
      PasswordValidators.isWeak
    ]),
    confirmpassword: new FormControl('', [
      Validators.required,
      EmailValidators.containsWhiteSpace,
      PasswordValidators.minLength,
      PasswordValidators.isWeak
    ]),
    name: new FormControl('', FullNameValidators.isInvalidFullName)
  })

  get name() {
    return Boolean(this.form) ? this.form.get('name') : null;
  }

  get email() {
    return Boolean(this.form) ? this.form.get('email') : null;
  }

  get password(): AbstractControl | null {
    return Boolean(this.form) ? this.form.get('password') : null;
  }

  get confirmPassword(): AbstractControl | null {
    return Boolean(this.form) ? this.form.get('confirmpassword') : null;
  }

  public resetForm() {
    this.emptyForm = null;
    this.error = null;
    this.isValid = null;
  }

  public checkPasswords() {
    this.resetForm();
    if (!this.confirmPassword?.touched) return;

    var result = PasswordValidators.arePasswordsSame(this.password?.value, this.confirmPassword?.value);

    if (Boolean(result)) {
      this.arePasswordsSame = false;
      document.getElementById('confirmpassword')?.classList.add('form-invalid-input');
    } else {
      this.arePasswordsSame = true;
      document.getElementById('confirmpassword')?.classList.remove('form-invalid-input');
    }
  }

  async onSubmit() {
    if (!this.email?.value || !this.password?.value || !this.name?.value || !this.confirmPassword?.value) return this.isValid = false;
    if (this.email.invalid || this.password.invalid || this.name.invalid || this.confirmPassword.invalid) return null;
    try {
      this.sourceService.registerSubject$.next(true);
      const user = await this.sessionService.registerAccount(this.email.value, this.password.value, this.name.value);

      if (user) {
        const { displayName, srcDoc, createdAt, projectName, email, id} = user as UserSession;
        const session = new UserSession(displayName, new SourceCode(srcDoc.html, srcDoc.css, srcDoc.js), createdAt, projectName, email, id);

        this.onRegister.emit(session);
        this.toastr.success(this.translate.instant('form.sign-up.success'), this.toastrTitle, this.toastrConfig);
        return;
      }
    } catch (e) {
      this.calculateErrorMessage(e);
      this.toastr.error(this.error.message, this.toastrTitle, this.toastrConfig);
      this.isValid = false;
      this.sourceService.registerSubject$.next(false);
    }
    return;
  }

  private calculateErrorMessage(e: any) {
    switch(e.code) {
      case this.translate.instant('form.errors.email-already-in-use.code'): {
        this.error = {
          message: this.translate.instant('form.errors.email-already-in-use.message')
        };
        break;
      }
      case this.translate.instant('form.errors.invalid-email.code'): {
        this.error = {
          message: this.translate.instant('form.errors.invalid-email.message')
        };
        break;
      }
      case this.translate.instant('form.errors.network-request-failed.code'): {
        this.error = {
          message: this.translate.instant('form.errors.network-request-failed.message')
        };
        break;
      }
      default:
        this.error = {
          message: this.translate.instant('form.errors.invalid-credentials.message')
        };
        break;
    }
  }

  ngOnInit(): void {
    this.toastrTitle = this.translate.instant('form.sign-up.title');
  }

}
