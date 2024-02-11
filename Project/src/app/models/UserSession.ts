import { SourceCode } from "./SourceCode";

export class UserSession {
  constructor (public displayName: string, public srcDoc: SourceCode,
               public createdAt: object, public projectName: string,
               public email: string, public id?: string ) {}
}
