import { IpcRenderer } from "electron"
import { contextBridge } from "electron/renderer"

interface FunctionStub {
    (...args): Promise<Object>
}

export class RendererEventHandler {
    private functionStubs: Map<String, FunctionStub>
    private app: IpcRenderer
    private channelName: string

    constructor (app: IpcRenderer, channelName: string) {
        this.app = app
        this.channelName = channelName
        this.functionStubs = new Map<String, FunctionStub>()
    }

    public async initStubs() {
        const proto = <Array<string>> await this.app.invoke(this.channelName)
        for(const foo of proto) {
            this.createStub(foo)
        }
        this.publishStubs()
    }

    private createStub(name: string) {
        const foo = async (...args) => this.app.invoke(this.channelName, name, ...args)
        this.functionStubs.set(name, foo)
        return foo
    }

    /**
     * Use with caution!
     */
    public publishStubs()  {
        const obj = {}
        for(const [name, stub] of this.functionStubs) {
            obj[name.valueOf()] = stub
        }
        contextBridge.exposeInMainWorld(this.channelName, obj)
        console.info('published IPC stubs: ' + Object.keys(obj))
    }
}