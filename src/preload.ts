import { ipcRenderer } from 'electron/renderer'
import { RendererEventHandler } from './RenderEventHandler'

process.once('loaded', () => {
    const drive = new RendererEventHandler(ipcRenderer, 'drive')
    drive.initStubs().then(() => console.log('Drive IPC ready'))

    const contacts = new RendererEventHandler(ipcRenderer, 'contacts')
    contacts.initStubs().then(() => console.log('Contacts IPC ready'))
})