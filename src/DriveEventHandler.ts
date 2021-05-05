import { Hyperdrive } from "certacrypt";
import { IpcMain, dialog } from "electron";
import fs from 'fs'
import { MainEventHandler } from "./MainEventHandler";
import { IDriveEventHandler, FileDownload , Stat, readdirResult} from "./EventInterfaces";
import { electron } from "node:process";

export default class DriveEventHandler extends MainEventHandler implements IDriveEventHandler{
    private drive: Hyperdrive
    private downloads: Array<FileDownload> = []

    constructor(app: IpcMain, hyperdrive: Hyperdrive) {
        super(app, 'drive')
        this.drive = hyperdrive
    }

    async readdir(path: string): Promise<Array<readdirResult>> {
        return <Promise<readdirResult[]>> this.drive.promises.readdir(path, {db: {encrypted: true}, includeStats: true})
    }
    async mkdir(path: string): Promise<void> {
        return this.drive.promises.mkdir(path, {db: {encrypted: true}})
    }
    async rmdir(path: string): Promise<void> {
        return Promise.reject(new Error('not implemented'))
        //return this.drive.promises.rmdir(path)
    }
    async stat(path: string): Promise<Stat>{
        return this.drive.promises.stat(path, {db: {encrypted: true}, resolve: true})
    }


    readFile(path: string, encoding: string = 'utf-8'): Promise<Buffer>{
        return this.drive.promises.readFile(path, {db: {encrypted: true}, encoding})
    }
    writeFile(path: string, content: Buffer|string, encoding: string = 'utf-8'): Promise<void>{
        return this.drive.promises.writeFile(path, content, {db: {encrypted: true}, encoding})
    }

    async downloadFile(path: string): Promise<number> {
        const parts = path.split('/').filter(p => p.length > 0)
        const filename = parts[parts.length-1]
        const stat = await this.stat(path)
        const state: FileDownload = {filename: path, size: stat.size, downloaded: 0}
        const idx = this.downloads.length
        this.downloads[idx] = state

        const target = await dialog.showSaveDialog({defaultPath: filename})
        if(!target.filePath) return Promise.reject()

        const file = fs.createWriteStream(target.filePath)
        const stream = this.drive.createReadStream(path, {db:{encrypted: true}})
        stream.pipe(file)
        stream.on('data', (chunk) => state.downloaded += chunk.length)
        stream.on('error', err => state.error = err)
        stream.on('close', () => { 
            state.downloaded = state.size
            state.localPath = target.filePath
        })

        return idx
    }
    async getDownloadStates(): Promise<FileDownload[]> {
        return this.downloads
    }
}