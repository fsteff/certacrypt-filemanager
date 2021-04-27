import { CertaCrypt } from "certacrypt";
import { IpcMain } from "electron";
import { MainEventHandler } from "./MainEventHandler";
import { IDriveEventHandler, Fd, Stat } from "./EventInterfaces";

export default class DriveEventHandler extends MainEventHandler implements IDriveEventHandler{
    private drive: any

    constructor(app: IpcMain, hyperdrive: any) {
        super(app, 'drive')
        this.drive = hyperdrive
    }

    async readdir(path: string): Promise<Array<string>> {
        return this.drive.promises.readdir(path)
    }
    async mkdir(path: string): Promise<void> {
        return this.drive.promises.mkdir(path)
    }
    async rmdir(path: string): Promise<void> {
        return this.drive.promises.rmdir(path)
    }
    async stat(path: string): Promise<Stat>{
        return this.drive.promises.stat(path)
    }

    open(path: string, flags: string): Promise<Fd>{
        return Promise.reject(new Error('not implemented'))
    }
    read(fd: Fd, position?: number, length?: number): Promise<Buffer>{
        return Promise.reject(new Error('not implemented'))
    }
    write(fd: Fd, buf: Buffer, position?: number): Promise<void>{
        return Promise.reject(new Error('not implemented'))
    }

    readFile(path: string): Promise<Fd>{
        return Promise.reject(new Error('not implemented'))
    }
    writeFile(path: string, content: Buffer|string): Promise<void>{
        return Promise.reject(new Error('not implemented'))
    }
}