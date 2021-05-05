import { Injectable } from '@angular/core'
import globals from '../../../src/globals'
import { Observable, from } from 'rxjs'
import { readdirResult, FileDownload } from '../../../src/EventInterfaces'

@Injectable({
  providedIn: 'root'
})
export class DriveService {

  constructor() { }

  readdir(path?: string) : Observable<readdirResult[]>{
    const dir = from(globals.drive.readdir(path || '/'))
    return dir
  }

  async readFile(path: string, encoding?: string) {
    return globals.drive.readFile(path, encoding)
  }

  async downloadFile(path: string): Promise<Observable<FileDownload>> {
    const idx = await globals.drive.downloadFile(path)
    return new Observable<FileDownload>((subscriber) => {
      window.setInterval(update, 500)
      async function update() {
        const downloads = await globals.drive.getDownloadStates()
        const current = downloads[idx]
        subscriber.next(current)
        if(current.error) {
          subscriber.error(current.error)
        }else if(current.downloaded < current.size) {
          window.setInterval(update, 500)
        } else {
          subscriber.complete()
        }
      }
    })
  }
}
