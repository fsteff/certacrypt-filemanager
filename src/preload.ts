import { ipcRenderer } from 'electron/renderer'
import { RendererEventHandler } from './RenderEventHandler'

process.once('loaded', () => {
    const drive = new RendererEventHandler(ipcRenderer, 'drive')
    drive.initStubs().then(() => console.log('IPC ready'))
})