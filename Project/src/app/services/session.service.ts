import { Injectable, OnDestroy } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/auth";
import { AngularFirestore } from "@angular/fire/firestore";
import firebase from 'firebase/app';
import { BehaviorSubject, Subject, Subscription } from "rxjs";
import { UserSession } from "../models/UserSession";
import { SourceService } from "./source.service";

@Injectable({
  providedIn: 'root'
})
export class SessionService implements OnDestroy {

  private session!: UserSession | null;
  private session$!: Subscription;
  private userId!: string | null;

  public sessionSubject$: BehaviorSubject<UserSession | null | any>;
  public appSessionSubject$: Subject<UserSession | null>;
  public uidSubject$: Subject<string | null>;
  public sessionRemoveSubject$ = new Subject<any>();

  constructor(private firestore: AngularFirestore, private authService: AngularFireAuth) {
    this.sessionSubject$ = new BehaviorSubject<UserSession | null>(null);
    this.appSessionSubject$ = new Subject<UserSession | null>();
    this.uidSubject$ = new Subject<string | null>();
    this.sessionRemoveSubject$.subscribe(() => {
      this.session = null;
      this.emitSession();
    });
    this.session$ = this.retrieveSession().subscribe(async (userAuth) => {
      if (userAuth) {
        const userRef = this.firestore.doc(`users/${userAuth.uid}`);
        const snapshot = await userRef.get().toPromise();
        const result = await snapshot.data();
        const user = result as UserSession;
        this.session = user;
        this.userId = userAuth.uid;
        this.emitSession();
      } else {
        this.session = null;
        this.emitSession();
      }
      return null;
     });
  }

  public retrieveSession() {
    return this.authService.user;
  }

  public async createUserProfileDocument(userAuth: any, displayName?: string, additionalData?: any) {
    if (!userAuth) return;

    const userRef = this.firestore.doc(`users/${userAuth.user.uid}`);

    await userRef.get().toPromise().then(async (snap) => {
      if (!snap.exists) {
        if (!Boolean(displayName)) displayName = userAuth.user!.displayName;
        const createdAt = new Date();
        const { email, uid } = userAuth.user!;

        try {
          await userRef.set({
            createdAt,
            displayName,
            id: uid,
            srcDoc: {
              html: '',
              css: '',
              js: ''
            },
            projectName: 'Untitled',
            email,
            ...additionalData
          });
        } catch(error) {
          console.log('Error while creating user', error);
        };
      };
    });

    return userRef;
  }

  public async registerAccount(email: string, password: string, name: string) {
    try {
      const userAuth = await this.authService.createUserWithEmailAndPassword(email, password);

      if (userAuth.user) {
        const userRef = await this.createUserProfileDocument(userAuth, name);
        const snapShot = (await userRef!.get().toPromise().then(data => data));
        const currentUser = await snapShot.data();
        if (Boolean(currentUser)) {
          this.session = currentUser as UserSession;
        }
        return currentUser;
      }
    } catch (e) {
      throw e;
    }

    return null;
  }

  public async signInWithCredentials(email: string, password: string) {
    try {
      const userAuth = await this.authService.signInWithEmailAndPassword(email, password);

      if (userAuth) {
        const userRef = await this.createUserProfileDocument(userAuth);
        const snapShot = (await userRef!.get().toPromise());
        const currentUser = await snapShot.data();
        if (Boolean(currentUser)) {
          this.session = currentUser as UserSession;
        }
        return currentUser;
      }
    } catch(e) {
      throw e;
    }

    return null;
  }

  private emitSession() {
    this.sessionSubject$.next(this.session);
    this.appSessionSubject$.next(this.session);
    this.uidSubject$.next(this.userId);
  }

  private get googleProvider() {
    const googleProvider = new firebase.auth.GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: 'select_account' });
    return googleProvider;
  }

  public async signInWithGoogle() {
    try {
      const userAuth = await this.authService.signInWithPopup(this.googleProvider);

      if (userAuth) {
        const userRef = await this.createUserProfileDocument(userAuth);
        const snapShot = (await userRef!.get().toPromise());
        const currentUser = await snapShot.data();
        if (Boolean(currentUser)) {
          this.session = currentUser as UserSession;
        }
        return currentUser;
      }
    } catch(e) {
      throw e;
    }
  }

  public signOutSession() {
    this.authService.signOut();
  }

  ngOnDestroy(): void {
    if (Boolean(this.session$)) this.session$.unsubscribe();
  }
}
