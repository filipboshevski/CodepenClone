import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { SourceCode } from './models/SourceCode';
import { SessionService } from './services/session.service';
import { TranslateService } from '@ngx-translate/core';
import { SourceService } from './services/source.service';
import { UserSession } from './models/UserSession';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {

  private session$!: Subscription;
  private localSrcCode$!: Subscription;

  public session!: any;
  public isLoading!: boolean;

  public sourceSubject$!: Subject<SourceCode>;
  public sessionRemoveSubject$!: Subject<any>;

  constructor(private sessionService: SessionService, private translateService: TranslateService, private sourceService: SourceService) {

    this.translateService.setDefaultLang('en');

    this.sourceSubject$ = new Subject<SourceCode>();
    this.sessionRemoveSubject$ = new Subject<any>();
    this.session$ = this.sessionService.appSessionSubject$.asObservable().subscribe(session => {
      if (Boolean(session)) {
        this.session = session;
      } else {
        this.session = null;
      }
      this.isLoading = false;
      return;
    });
  }

  setSession(session: UserSession) {
    this.session = session;
  }

  handleSignUp(session: UserSession) {
    this.sourceService.registerSubject$.next(true);
    this.sourceService.isNewUserSubject$.next(session);
    this.setSession(session);
  }

  removeSession() {
    this.sessionService.sessionRemoveSubject$.next();
    this.sessionRemoveSubject$.next();
  }

  ngOnInit() {
    this.isLoading = true;
  }

  ngOnDestroy() {
    if (Boolean(this.session$)) this.session$.unsubscribe();
    if (Boolean(this.localSrcCode$)) this.localSrcCode$.unsubscribe();
  }
}
