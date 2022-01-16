import { CertaCrypt, GraphObjects, CryptoHyperdrive, createUrl, parseUrl, URL_TYPES, DriveShare, Space as CollaborationSpace} from '@certacrypt/certacrypt';
import { IpcMain, dialog } from "electron";
import fs from 'fs'
import { MainEventHandler } from "./MainEventHandler";
import { IDriveEventHandler, FileDownload , Stat, readdirResult, Peer, Share, Space} from "./EventInterfaces";
import unixify from 'unixify'
import { Vertex } from "@certacrypt/hyper-graphdb";
import Client from '@hyperspace/client'

export default class DriveEventHandler extends MainEventHandler implements IDriveEventHandler{
    private downloads: Array<FileDownload> = []
    private static readonly appPath = '/apps/filemanager'

    constructor(app: IpcMain, private drive: CryptoHyperdrive, private certacrypt: CertaCrypt, private hyperspace: Client) {
        super(app, 'drive')
    }

    static async init(app: IpcMain, certacrypt: CertaCrypt, hyperspace: Client): Promise<DriveEventHandler> {
        let rootVertex = <Vertex<GraphObjects.Directory>> await certacrypt.path(this.appPath)
        const drive = await certacrypt.drive(rootVertex)

        await (await certacrypt.driveShares).mountAt(drive, rootVertex, 'shares')

        return new DriveEventHandler(app, drive, certacrypt, hyperspace)
    }

    async readdir(path: string): Promise<Array<readdirResult>> {
        return <Promise<readdirResult[]>> this.drive.promises.readdir(path, {db: {encrypted: true}, includeStats: true})
    }
    async mkdir(path: string): Promise<string> {
        await this.drive.promises.mkdir(path, {db: {encrypted: true}})
        return path
    }
    async unlink(path: string): Promise<string> {
        await this.drive.promises.unlink(path, {db:{encrypted: true}})
        return path
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

    async uploadFile(path: string, multiple = true): Promise<string[]> {
        const properties: ['openFile', "multiSelections"] | ['openFile'] = multiple ? ['openFile', "multiSelections"] : ['openFile']
        const selections = await dialog.showOpenDialog({message: "Upload File(s)", properties})
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

    async createUrlShare(path: string): Promise<string> {
        const file = await this.certacrypt.path('/apps/filemanager' + path)
        const share = await this.certacrypt.createShare(file, true)
        const key = this.certacrypt.graph.getKey(share)
        const pathParts = path.split('/')
        const filename = pathParts[pathParts.length-1]
        return createUrl(share, key, undefined, URL_TYPES.SHARE, filename)
    }

    async mountShare(url: string, path: string): Promise<string> {
        const parts = path.split('/').filter(p => p.length > 0)
        const filename = parts[parts.length-1]
        const parentPath = '/apps/filemanager/' + parts.slice(0, parts.length-1).join('/')
        let parent = await this.certacrypt.path(parentPath)
        if(parent instanceof DriveShare.VirtualDriveShareVertex) {
            parent = (<DriveShare.VirtualDriveShareVertex>parent).realVertex
        }
        await this.certacrypt.mountShare(parent, filename, url)
        return path
    }

    async lookupPeers(url: string): Promise<Peer> {
        const parsed = parseUrl(url)
        const core = this.certacrypt.corestore.get({key: parsed.feed})
        await this.hyperspace.replicate(core)
        return new Promise((resolve, reject) => {
            core.on('peer-add', (peer: Peer) => resolve(peer))
            core.on('error', (err: Error) => reject(err))
        })
    }

    async getFileUrl(path: string): Promise<string> {
        const file = <Vertex<GraphObjects.DriveGraphObject>> await this.certacrypt.path('/apps/filemanager' + path)
        const pathParts = path.split('/')
        const filename = pathParts[pathParts.length-1]
        return this.certacrypt.getFileUrl(file, filename) 
    }

    async convertToSpace(path: string): Promise<{space: CollaborationSpace.CollaborationSpace,metadata: Space}> {
        await this.certacrypt.convertToCollaborationSpace(DriveEventHandler.appPath + path)
        const spaceMeta = await this.drive.getSpace(path)
        if(!spaceMeta?.metadata) {
            throw new Error('convertToSpace: conversion failed for ' + path)
        }
        return spaceMeta
    }
    async addWriterToSpace(path: string, userUrl: string) {
        let fileSpace = await this.drive.getSpace(path)
        if(!fileSpace?.space) {
            fileSpace = await this.convertToSpace(path)
        }
        const user = await this.certacrypt.getUserByUrl(userUrl)
        await fileSpace.space.addWriter(user)
        fileSpace.metadata.writers.push(userUrl)
        return <Space> fileSpace.metadata
    }

    async getSpace(path: string): Promise<Space> {
        let fileSpace = await this.drive.getSpace(path)
        if(!fileSpace?.space) {
            return undefined
        }
        return fileSpace.metadata
    }
}

function filenameFromPath(path: string) {
    const normalized = unixify(path)
    const parts = normalized.split('/').filter(p => p.length > 0)
    return parts[parts.length-1]
}