import { IpcMain } from 'electron'


export abstract class MainEventHandler {
    private app: IpcMain
    private channelName: string

    constructor (app: IpcMain, channel: string) {
        this.app = app
        this.channelName = channel
        this._init()
    }

    private _init() {
        const self = this
        const props = []
        for(const prop of Object.getOwnPropertyNames(Object.getPrototypeOf(this))) {
            if(prop !== 'constructor') {
                props.push(prop)
            }
        }

        this.app.handle(this.channelName, (event: Electron.IpcMainInvokeEvent, foo: string, ...args) => {
            if(!foo) return props
            else return self[foo].call(self, ...args)
        })
    }


}

