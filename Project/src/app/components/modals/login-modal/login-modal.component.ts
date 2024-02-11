import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { SourceCode } from 'src/app/models/SourceCode';
import { UserSession } from 'src/app/models/UserSession';
import { SessionService } from 'src/app/services/session.service';
import { EmailValidators } from '../../../validators/EmailValidators';
import { PasswordValidators } from '../../../validators/PasswordValidators';

@Component({
  selector: 'app-login-modal',
  templateUrl: './login-modal.component.html',
  styleUrls: ['./login-modal.component.css']
})
export class LoginModalComponent implements OnInit {

  public isValid: boolean | null;

  private error: any | null = null;
  private toastrTitle = '';
  private toastrConfig = { toastClass: 'ngx-toastr margin-top-15', timeOut: 2000 };

  @Output() onLogin: EventEmitter<any>;

  constructor(private sessionService: SessionService, private translate: TranslateService, private toastr: ToastrService) {
    this.isValid = null;
    this.onLogin = new EventEmitter<any>();
  }

  form: any = new FormGroup({
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
    ])
  })

  get email() {
      return this.form.get('email');
  }

  get password() {
      return this.form.get('password');
  }

  async onSubmit() {
    if (!this.email?.value || !this.password?.value) return this.isValid = false;
    if (this.email.invalid || this.password.invalid) return null;

    try {
      const user = await this.sessionService.signInWithCredentials(this.email.value, this.password.value);

      if (user) {
        const { displayName, srcDoc, createdAt, projectName, email, id } = user as UserSession;
        const session = new UserSession(displayName, new SourceCode(srcDoc.html, srcDoc.css, srcDoc.js), createdAt, projectName, email, id);

        this.onLogin.emit({session: session, isGoogleLogin: false});
        this.toastr.success(this.translate.instant('form.sign-in.success'), this.toastrTitle, this.toastrConfig);
        return;
      }
    } catch (e) {
      this.calculateErrorMessage(e);
      this.toastr.error(this.error.message, this.toastrTitle, this.toastrConfig);
      this.isValid = false;
    }
    this.isValid = false;
    return;
  };

  async logInWithGoogle() {
    try {
      const user = await this.sessionService.signInWithGoogle();

      if (user) {
        const { displayName, srcDoc, createdAt, projectName, email, id } = user as UserSession;
        const session = new UserSession(displayName, new SourceCode(srcDoc.html, srcDoc.css, srcDoc.js), createdAt, projectName, email, id);
        this.toastr.success(this.translate.instant('form.sign-in.success'), this.toastrTitle);
        this.onLogin.emit({session: session, isGoogleLogin: true});
        return;
      }
    } catch (e) {
      this.calculateErrorMessage(e);
      this.toastr.error(this.error.message, this.toastrTitle, this.toastrConfig);
      this.isValid = false;
    }
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
      case this.translate.instant('form.errors.wrong-password.code'): {
        this.error = {
          message: this.translate.instant('form.errors.wrong-password.message')
        };
        break;
      }
      case this.translate.instant('form.errors.user-not-found.code'): {
        this.error = {
          message: this.translate.instant('form.errors.user-not-found.message')
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
    this.toastrTitle = this.translate.instant('form.sign-in.title');
  }

}
