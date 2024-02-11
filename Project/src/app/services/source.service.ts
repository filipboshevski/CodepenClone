import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { TranslateService } from "@ngx-translate/core";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { ToastrService } from "ngx-toastr";
import { BehaviorSubject, Subject, Subscription } from "rxjs";
import { SourceCodePromptModalComponent } from "../components/modals/source-code-prompt-modal/source-code-prompt-modal.component";
import { SourceCode } from "../models/SourceCode";
import { UserSession } from "../models/UserSession";
import { SessionService } from "./session.service";

@Injectable({
  providedIn: 'root'
})
export class SourceService {
  private session!: any;
  private session$!: Subscription;
  private sourceCodeChange$!: Subscription;
  private projectNameChange$!: Subscription;
  private onRegister$!: Subscription;
  private isNewUser$!: Subscription;
  private localSrcCode!: SourceCode | undefined;
  private localProjectName: string = 'Untitled';
  private srcCodeModalRef!: BsModalRef<any>;
  private modalOpened: Boolean;
  private isNewUser: Boolean;
  private toastrConfig = { toastClass: 'ngx-toastr margin-top-15', timeOut: 2000 };

  public sourceCodeChangeSubject$: Subject<any>;
  public registerSubject$: Subject<any>;
  public projectNameChangeSubject$: Subject<string>;
  public retrieveSourceSubject$: Subject<SourceCode>;
  public retrieveProjectNameSubject$: BehaviorSubject<string>;
  public isNewUserSubject$: Subject<any>;

  constructor(
    private firestore: AngularFirestore,
    private sessionService: SessionService,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private translate: TranslateService) {
    this.modalOpened = false;
    this.isNewUser = false;
    this.retrieveSourceSubject$ = new Subject<SourceCode>();
    this.retrieveProjectNameSubject$ = new BehaviorSubject<string>('');
    this.registerSubject$ = new Subject<any>();
    this.isNewUserSubject$ = new Subject<any>();
    this.session$ = this.sessionService.sessionSubject$.asObservable().subscribe(session => {
      if (Boolean(session)) {
        if (!this.isNewUser) {
          if (Boolean(this.localSrcCode) && !this.modalOpened && !this.checkIfNewUser(session)) {
            this.modalOpened = true;
            this.srcCodeModalRef = this.modalService.show(SourceCodePromptModalComponent, { class: 'my-modal' });
            this.srcCodeModalRef.content.sourceCodeOption.subscribe((option: number) => {
              switch(option) {
                case 1:
                  this.session = session;
                  (this.session as UserSession).srcDoc = this.localSrcCode!;
                  (this.session as UserSession).projectName = this.localProjectName;
                  this.updateTitle();
                  this.updateSource();
                  break;
                case 2:
                default:
                  this.session = session;
                  this.updateTitle();
                  this.updateSource();
                  break;
              }
              this.srcCodeModalRef.hide();
              this.modalOpened = false;
            });
          } else if (this.localSrcCode === undefined) {
            this.session = session;
            this.updateTitle();
            this.updateSource();
          }
        } else {
          this.session = session;
          (this.session as UserSession).srcDoc = this.localSrcCode!;
          (this.session as UserSession).projectName = this.localProjectName;
          this.updateTitle();
          this.updateSource();
        }
      } else if (this.isNewUser) {
        this.session = null;
      } else {
        this.session = null;
        this.localProjectName = 'Untitled';
        this.localSrcCode = undefined;
        this.updateTitle();
        this.updateSource();
        this.isNewUser = false;
      }
      this.updateSource();
    });
    this.sourceCodeChangeSubject$ = new Subject<any>();
    this.projectNameChangeSubject$ = new Subject<string>();
    this.projectNameChange$ = this.projectNameChangeSubject$.asObservable().subscribe(change => {
      if (Boolean(this.session)) {
        this.session!.projectName = change;
      } else {
        this.localProjectName = change;
      }
      this.updateTitle();
    });
    this.sourceCodeChange$ = this.sourceCodeChangeSubject$.asObservable().subscribe(change => {
      if (Boolean(this.session)) {
        this.session!.srcDoc = change;
      } else {
        this.localSrcCode = change;
      }
      this.updateSource();
      this.updateTitle();
    });
    this.onRegister$ = this.registerSubject$.asObservable().subscribe(result => {
      result ? this.isNewUser = true : this.isNewUser = false;
    });
    this.isNewUser$ = this.isNewUserSubject$.asObservable().subscribe(async (session: UserSession) => {
      if (!Boolean(session)) return;

      if (Boolean(this.localSrcCode)) {
        session.srcDoc = this.localSrcCode!;
      }

      this.session = session;
      const result = await this.saveSource();

      if (result) {
        this.toastr.info(this.translate.instant('save-session.success'), this.translate.instant('save-session.title'), this.toastrConfig);
      } else {
        this.toastr.error(this.translate.instant('save-session.error'), this.translate.instant('save-session.title'), this.toastrConfig);
      }
    });
  }

  public async saveSource() {
    try {
      if (!Boolean(this.session)) return;

      const userRef = this.firestore.doc(`users/${this.session!.id}`);
      const snapShot = await userRef.get().toPromise();

      if (snapShot.exists) {
        const { srcDoc, projectName } = this.session!;
        await userRef.set({
          srcDoc: {
            html: srcDoc.html,
            css: srcDoc.css,
            js: srcDoc.js
          },
          projectName: projectName
        }, { merge: true });
        return true;
      };

      return false;
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  checkIfNewUser(session: UserSession) {
    return (session.srcDoc.html === '' && session.srcDoc.css === '' && session.srcDoc.js === '');
  }

  updateSource() {
    if (Boolean(this.session)) {
      this.retrieveSourceSubject$.next(new SourceCode(this.session!.srcDoc.html, this.session!.srcDoc.css, this.session!.srcDoc.js));
    } else {
      this.retrieveSourceSubject$.next(this.localSrcCode!);
    }
  }

  updateTitle() {
    if (Boolean(this.session) && !this.isNewUser) {
      this.retrieveProjectNameSubject$.next(this.session!.projectName);
    } else {
      this.retrieveProjectNameSubject$.next(this.localProjectName);
    }
  }

  ngOnDestroy() {
    if (Boolean(this.session$)) this.session$.unsubscribe();
    if (Boolean(this.sourceCodeChange$)) this.sourceCodeChange$.unsubscribe();
    if (Boolean(this.projectNameChange$)) this.projectNameChange$.unsubscribe();
    if (Boolean(this.onRegister$)) this.onRegister$.unsubscribe();
    if (Boolean(this.isNewUser$)) this.isNewUser$.unsubscribe();
  }
}
