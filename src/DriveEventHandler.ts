import { Hyperdrive } from "certacrypt";
import { IpcMain, dialog } from "electron";
import fs from 'fs'
import { MainEventHandler } from "./MainEventHandler";
import { IDriveEventHandler, FileDownload , Stat, readdirResult} from "./EventInterfaces";
import unixify from 'unixify'

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
    async mkdir(path: string): Promise<string> {
        await this.drive.promises.mkdir(path, {db: {encrypted: true}})
        return path
    }
    async rmdir(path: string): Promise<string> {
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
        const filename = filenameFromPath(path)
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

    async uploadFile(path: string): Promise<string[]> {
        const selections = await dialog.showOpenDialog({message: "Upload File(s)", properties: ['openFile', "multiSelections"]})
        if(selections.canceled || selections.filePaths.length === 0) return Promise.reject()

        const files = selections.filePaths
        const existing = await this.readdir(path)

        const uploads: Array<{source: string, target: string}> = []
        for(const sourcePath of files) {
            const filename = filenameFromPath(sourcePath)
            let targetName = unixify(path) + '/' + filename
            if(existing.findIndex(f => f.name === filename) >= 0) {
                let num = 2
                while(existing.findIndex(f => f.name === (filename + '_' + num)) >= 0) {
                    num++
                }
                targetName += '_' + num
            }
            uploads.push({source: sourcePath, target: targetName})
        }

        for(const {source, target} of uploads) {
            const sourceStream = fs.createReadStream(source)
            const targetStream = this.drive.createWriteStream(target, {db: {encrypted: true}})
            sourceStream.pipe(targetStream)
            await new Promise((resolve, reject) => {
                sourceStream.on('error', err => reject(err))
                targetStream.on('end', () => resolve(undefined))
            })
        }
        return uploads.map(u => u.target)
    }
}

function filenameFromPath(path: string) {
    const normalized = unixify(path)
    const parts = normalized.split('/').filter(p => p.length > 0)
    return parts[parts.length-1]
}