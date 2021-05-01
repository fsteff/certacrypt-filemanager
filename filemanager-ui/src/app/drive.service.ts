import { Injectable } from '@angular/core'
import globals from '../../../src/globals'
import { Observable, from } from 'rxjs'
import { readdirResult } from '../../../src/EventInterfaces'

@Injectable({
  providedIn: 'root'
})
export class DriveService {

  constructor() { }

  readdir(path?: string) : Observable<readdirResult[]>{
    const dir = from(globals.drive.readdir(path || '/'))
    return dir
  }
}
