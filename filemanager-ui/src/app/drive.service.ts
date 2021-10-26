import { Injectable } from '@angular/core'
import globals from '../../../src/globals'
import { Observable, from } from 'rxjs'
import { readdirResult, FileDownload, Stat, Share } from '../../../src/EventInterfaces'
import { ActivatedRoute } from '@angular/router'

@Injectable({
  providedIn: 'root'
})
export class DriveService {
  private readonly reloadListeners = []

  observePath(route: ActivatedRoute) {
    let currentPath: string
    const path = new Observable<string>(subscriber => {
      route.paramMap.subscribe(params => {
        currentPath = window.decodeURIComponent(params.get('path'))
        subscriber.next(currentPath)
      })
      this.reloadListeners.push(() => subscriber.next(currentPath))
    })
    return path
  }

  reload() {
    this.reloadListeners.forEach(listener => listener())
  }

  async stat(path: string): Promise<Stat> {
    return globals.drive.stat(path)
  }

  readdir(path?: string) : Observable<readdirResult[]>{
    const dir = from(globals.drive.readdir(path || '/'))
    return dir
  }

  async readFile(path: string, encoding?: string) {
    return globals.drive.readFile(path, encoding)
  }

  async mkdir(path: string) : Promise<string>{
    return globals.drive.mkdir(path)
  }

  async unlink(path: string): Promise<string>{
    return globals.drive.unlink(path)
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

  async uploadFile(path: string, multiple = true): Promise<string[]> {
    return globals.drive.uploadFile(path, multiple)
  }

  async createShare(path: string): Promise<string>{
    return globals.drive.createShare(path)
  }

  async mountShare(url: string, path: string): Promise<string> {
    //console.log('waiting for peers')
    //const firstPeer = await globals.drive.lookupPeers(url)
    //console.log('first peer: ' + firstPeer)
    return globals.drive.mountShare(url, path)
  }

  async getFileUrl(path: string): Promise<string> {
    return globals.drive.getFileUrl(path)
  }
}
