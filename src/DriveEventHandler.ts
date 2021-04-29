import { CertaCrypt, Hyperdrive } from "certacrypt";
import { IpcMain } from "electron";
import { MainEventHandler } from "./MainEventHandler";
import { IDriveEventHandler, Fd, Stat } from "./EventInterfaces";
import { resolve } from "node:path";

export default class DriveEventHandler extends MainEventHandler implements IDriveEventHandler{
    private drive: Hyperdrive

    constructor(app: IpcMain, hyperdrive: Hyperdrive) {
        super(app, 'drive')
        this.drive = hyperdrive
    }

    async readdir(path: string): Promise<Array<string>> {
        return <Promise<string[]>> this.drive.promises.readdir(path, {db: {encrypted: true}})
    }
    async mkdir(path: string): Promise<void> {
        return this.drive.promises.mkdir(path, {db: {encrypted: true}})
    }
    async rmdir(path: string): Promise<void> {
        return Promise.reject(new Error('not implemented'))
        //return this.drive.promises.rmdir(path)
    }
    async stat(path: string): Promise<Stat>{
        return this.drive.promises.stat(path, {db: {encrypted: true}})
    }

    async open(path: string, flags: string): Promise<Fd>{
        //  TODO: this api does not support encryption!
        return Promise.reject(new Error('not implemented'))
        //return new Promise((resolve, reject) => this.drive.open(path, flags, (err, fd) => err ? reject(err) : resolve(fd)))
    }
    async read(fd: Fd, position?: number, length?: number): Promise<{buffer: Buffer, bytesRead: number}>{
        length = length || 1024
        position = position || 0
        const buffer = Buffer.alloc(length)
        const count = <number> await new Promise((resolve, reject) => this.drive.read(fd, buffer, 0, length, position, (err, bytesRead, res) => err ? reject(err) : resolve(bytesRead)))
        return Promise.reject(new Error('not implemented'))
        //return {buffer, bytesRead: count}
    }
    async write(fd: Fd, buf: Buffer, position?: number): Promise<void>{
        position = position || 0
        return Promise.reject(new Error('not implemented'))
        //return new Promise((resolve, reject) => this.drive.write(fd, buf, 0, buf.length, position, (err) => err ? reject(err) : resolve(undefined)))
    }

    readFile(path: string, encoding: string = 'utf-8'): Promise<Buffer>{
        return this.drive.promises.readFile(path, {db: {encrypted: true}, encoding})
    }
    writeFile(path: string, content: Buffer|string, encoding: string = 'utf-8'): Promise<void>{
        return this.drive.promises.writeFile(path, content, {db: {encrypted: true}, encoding})
    }
}