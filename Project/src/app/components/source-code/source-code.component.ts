import { Component, EventEmitter, Input, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CodemirrorComponent } from '@ctrl/ngx-codemirror';
import { Observable, Subscription } from 'rxjs';
import { SourceCode } from 'src/app/models/SourceCode';
import { UserSession } from 'src/app/models/UserSession';
import { SourceService } from 'src/app/services/source.service';

@Component({
  selector: 'source-code',
  templateUrl: './source-code.component.html',
  styleUrls: ['./source-code.component.css']
})
export class SourceCodeComponent implements OnInit {

  public isCssCollapsed: boolean;
  public isHtmlCollapsed: boolean;
  public isJsCollapsed: boolean;

  @Input() userSession!: UserSession | null;
  @Input() sessionRemove!: Observable<any>;

  private sourceCode$!: Subscription;
  private sessionRemove$!: Subscription;

  public html!: string;
  public css!: string;
  public js!: string;
  public sourceDoc!: string;
  public sanitizedDoc!: SafeHtml;
  public error!: string | null;
  public codeSuccessful: boolean;

  public htmlLoading!: boolean;
  public cssLoading!: boolean;
  public jsLoading!: boolean;
  public firstTime: boolean;

  private isChanging: boolean;

  constructor(private sanitizer: DomSanitizer, private sourceService: SourceService) {
    this.isCssCollapsed = false;
    this.isHtmlCollapsed = false;
    this.isJsCollapsed = false;
    this.isChanging = false;
    this.htmlLoading = false;
    this.cssLoading = false;
    this.jsLoading = false;
    this.codeSuccessful = false;
    this.firstTime = true;
  }

  public changeDoc() {
    if (this.isChanging) {
      return;
    }
    this.isChanging = true;

    setTimeout(() => {
      this.sourceDoc = `
      <html>
      <head>
        <script>
          var windowErrorHandler = (event) =>{
            event.preventDefault();
            const errorEvent = new CustomEvent('errorEvent', { detail: {
              message: event.error
            } });
            parent.window.dispatchEvent(errorEvent);
          };
          window.addEventListener('error', windowErrorHandler);
        </script>
      </head>
      <style>
      ${this.css ? this.css : ''}
      </style>
      <body>
      ${this.html ? this.html : ''}
      </body>
      <script>
      ${this.js ? this.js : ''}
      </script>
      </html>
      `;

      this.sanitizedDoc = this.sanitizer.bypassSecurityTrustHtml(this.sourceDoc);

      this.isChanging = false;
      this.htmlLoading = false;
      this.cssLoading = false;
      this.jsLoading = false;
    }, 1500);
  }

  public handleCodeChange(codeMirrorRef: any) {
    switch (codeMirrorRef._options.mode) {
      case 'markdown':
        this.html = codeMirrorRef.value;
        this.htmlLoading = true;
        break;
      case 'css':
        this.css = codeMirrorRef.value;
        this.cssLoading = true;
        break;
      case 'javascript':
        this.js = codeMirrorRef.value;
        this.jsLoading = true;
        break;
      default:
        return;
    }
    this.changeDoc();
    this.sourceService.sourceCodeChangeSubject$.next(
      new SourceCode(this.html, this.css, this.js)
    );
    this.error = null;
    setTimeout(() => {
      if (!this.error) {
        this.codeSuccessful = true;
      }
    }, 2000);
  }

  public removeCharacterFix(codeMirrorRef: any) {
    console.log(codeMirrorRef);
  }

  public onMinimize($event: any) {
    switch($event.target.id) {
      case 'htmlarrow':
      case 'html':
        this.isHtmlCollapsed = !this.isHtmlCollapsed;
        break;
      case 'cssarrow':
      case 'css':
        this.isCssCollapsed = !this.isCssCollapsed;
        break;
      case 'jsarrow':
      case 'js':
        this.isJsCollapsed = !this.isJsCollapsed;
        break;
      default:
        return;
      }
  }

  public handleError($event: any) {
    if (Boolean($event)) {
      this.codeSuccessful = false;
      this.error = $event.detail.message;
    }
  }

  private setSource() {
    if (Boolean(this.userSession)) {
      this.html = this.userSession!.srcDoc.html;
      this.css = this.userSession!.srcDoc.css;
      this.js = this.userSession!.srcDoc.js;
    } else {
      this.resetSource();
    }
  }

  private resetSource() {
    this.html = '';
    this.css = '';
    this.js = '';
    this.error = null;
    this.codeSuccessful = false;
    this.changeDoc();
  }

  ngOnInit(): void {
    this.sourceCode$ = this.sourceService.retrieveSourceSubject$.subscribe(sourceCode => {
      if (Boolean(sourceCode)) {
        this.html = sourceCode.html;
        this.css = sourceCode.css;
        this.js = sourceCode.js;
        this.changeDoc();
      } else {
        return;
      }
    });

    this.sessionRemove$ = this.sessionRemove.subscribe(() => {
      this.userSession = null;
      this.setSource();
    });

    this.setSource();
    this.changeDoc();

    window.addEventListener('errorEvent', ($event: any) => {
      this.handleError($event);
    });
  }

  ngOnDestroy() {
    if (Boolean(this.sourceCode$)) this.sourceCode$.unsubscribe();
    if (Boolean(this.sessionRemove$)) this.sessionRemove$.unsubscribe();
  }

}
