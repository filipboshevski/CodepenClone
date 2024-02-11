import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { UserSession } from 'src/app/models/UserSession';
import { SessionService } from 'src/app/services/session.service';
import { SourceService } from 'src/app/services/source.service';
import { LoginModalComponent } from '../modals/login-modal/login-modal.component';
import { RegisterModalComponent } from '../modals/register-modal/register-modal.component';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent implements OnInit {

  @Input() userSession!: UserSession;

  @Output() onSessionRetrieved: EventEmitter<UserSession>;
  @Output() handleSignUp: EventEmitter<UserSession>;
  @Output() onSessionRemove: EventEmitter<any>;

  public titleToggled!: boolean;

  public title!: string;
  public loginModalRef!: BsModalRef;
  public registerModalRef!: BsModalRef;

  private onLogin$!: Subscription;
  private onRegister$!: Subscription;
  private onTitleChange$!: Subscription;
  private toastrConfig = { toastClass: 'ngx-toastr margin-top-15', timeOut: 2000 };
  private saveToastrTitle = '';
  private titleChangeToastrTitle = '';

  constructor(private modalService: BsModalService,
              private sessionService: SessionService,
              private sourceService: SourceService,
              private toastr: ToastrService,
              private translate: TranslateService) {
    this.titleToggled = false;
    this.onSessionRetrieved = new EventEmitter<UserSession>();
    this.handleSignUp = new EventEmitter<UserSession>();
    this.onSessionRemove = new EventEmitter<any>();
    this.onTitleChange$ = this.sourceService.retrieveProjectNameSubject$.asObservable().subscribe(title => {
      if (Boolean(title)) {
        this.title = title;
      }
    });
  }

  get user() {
    return Boolean(this.userSession) ? this.userSession : null;
  }

  get displayName() {
    return Boolean(this.userSession) ? this.userSession.displayName : 'Captain Anonymous';
  }

  public toggleTitle() {
    this.titleToggled = !this.titleToggled;
    if (!this.titleToggled) {
      this.toastr.info(this.translate.instant('title-change.success'), this.titleChangeToastrTitle, this.toastrConfig);
    }
  }

  public get titleLoad() {
    const titleRef = document.getElementById('titleId');

    if (titleRef !== null) {
      titleRef.offsetWidth >= 400 ? titleRef.setAttribute('class', 'project-title clip') : titleRef.setAttribute('class', 'project-title');
    }

    return this.title;
  }

  public handleChange($event: any) {
    if (Boolean($event)) {
      if ($event.target.value !== '') {
        this.title = $event.target.value;
        this.sourceService.projectNameChangeSubject$.next(this.title);
      } else {
        this.title = 'Untitled';
      }
    }
  }

  public onSignUp() {
    this.registerModalRef = this.modalService.show(RegisterModalComponent, { class: 'my-modal-lite' });
    this.onRegister$ = this.registerModalRef.content.onRegister.subscribe((session: UserSession) => {
      this.handleSignUp.emit(session);
      this.sessionService.sessionSubject$.next(session);
      this.registerModalRef.hide();
    });
  }

  public onSignIn() {
    this.loginModalRef = this.modalService.show(LoginModalComponent, { class: 'my-modal' });
    this.onLogin$ = this.loginModalRef.content.onLogin.subscribe((result: any) => {
      if (!Boolean(result)) {
        this.toastr.error(this.translate.instant('navigation.failed-to-log-in-error.message'), this.translate.instant('navigation.failed-to-log-in-error.title'), this.toastrConfig);
        this.loginModalRef.hide();
        return;
      }

      if (result.isGoogleLogin !== undefined && result.isGoogleLogin) {
        if ((result.session as UserSession).srcDoc.html === '' &&
            (result.session as UserSession).srcDoc.css === '' &&
            (result.session as UserSession).srcDoc.js === '') {
              this.handleSignUp.emit(result.session as UserSession);
              this.sourceService.registerSubject$.next(true);
              this.loginModalRef.hide();
              return;
        }
      }

      this.onSessionRetrieved.emit(result.session as UserSession);
      this.loginModalRef.hide();
    });
  }

  public onSignOut() {
    this.sessionService.signOutSession();
    this.toastr.success('Signed out successfully.', 'Sign Out', this.toastrConfig);
    this.title = 'Untitled';
    this.onSessionRemove.emit();
  }

  public async onSave() {
    if (Boolean(this.user)) {
      try {
        const result = await this.sourceService.saveSource();
        if (result) {
          this.toastr.info(this.translate.instant('save-session.success'), this.saveToastrTitle, this.toastrConfig);
        } else {
          this.toastr.error(this.translate.instant('save-session.error'), this.saveToastrTitle, this.toastrConfig);
        }
      } catch (e) {
        this.toastr.error(this.translate.instant('save-session.error'), this.saveToastrTitle, this.toastrConfig);
      }
    } else {
      this.onSignIn();
    }
  }

  ngOnInit(): void {
    this.saveToastrTitle = this.translate.instant('save-session.title');
    this.titleChangeToastrTitle = this.translate.instant('title-change.title');
  }

  ngOnDestroy(): void {
    if (Boolean(this.onLogin$)) this.onLogin$.unsubscribe();
    if (Boolean(this.onRegister$)) this.onRegister$.unsubscribe();
    if (Boolean(this.onTitleChange$)) this.onTitleChange$.unsubscribe();
  }

}
