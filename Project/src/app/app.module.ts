import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/markdown/markdown';
import 'codemirror/mode/css/css';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavigationComponent } from './components/navigation/navigation.component';
import { SourceCodeComponent } from './components/source-code/source-code.component';
import { AutofocusDirective } from './directives/autoselect-directive';
import { LoginModalComponent } from './components/modals/login-modal/login-modal.component';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ComponentLoaderFactory } from 'ngx-bootstrap/component-loader';
import { PositioningService } from 'ngx-bootstrap/positioning';
import { RegisterModalComponent } from './components/modals/register-modal/register-modal.component';

// Firebase
import { AngularFireModule } from '@angular/fire';
import { environment } from '../environments/environment';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { SessionService } from './services/session.service';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { SourceService } from './services/source.service';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { SourceCodePromptModalComponent } from './components/modals/source-code-prompt-modal/source-code-prompt-modal.component';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

@NgModule({
  declarations: [
    AppComponent,
    NavigationComponent,
    SourceCodeComponent,
    AutofocusDirective,
    LoginModalComponent,
    RegisterModalComponent,
    SpinnerComponent,
    SourceCodePromptModalComponent
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    AppRoutingModule,
    CodemirrorModule,
    FormsModule,
    AngularFireModule.initializeApp(environment.firebaseConfig, 'codepen-clone'),
    AngularFirestoreModule,
    AngularFireAuthModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
    TranslateModule.forRoot({
      loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient]
      }
    })
  ],
  providers: [
    BsModalService,
    ComponentLoaderFactory,
    PositioningService,
    SessionService,
    SourceService,
    HttpClient
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
