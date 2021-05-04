import {Server, Client} from 'hyperspace'
import { app, BrowserWindow, ipcMain, protocol } from 'electron'
import { promises as fs } from 'fs'
import Main from './Main';

import { CertaCrypt, Directory, enableDebugLogging } from 'certacrypt'
import { DefaultCrypto } from 'certacrypt-crypto'

import DriveEventHandler from './DriveEventHandler'
import { Vertex } from 'hyper-graphdb';

app.on('ready', startServer)

async function startServer() {
    const server = new Server()
    await server.ready()
    const client = new Client()
    await client.ready()

    const crypto = new DefaultCrypto()

    const configFile = app.getPath('home') + '/.hyperspace/certacrypt.json'
    const config: {sessionUrl?: string} = await fs.readFile(configFile, 'utf-8')
        .then(txt => JSON.parse(txt))
        .catch(async err => {
            console.error('can`t find or open certacrypt.json')
            return {}
        })

    const certacrypt = new CertaCrypt(client.corestore(), crypto, config.sessionUrl)
    enableDebugLogging()
    if(!config.sessionUrl) {
        const driveRoot = certacrypt.graph.create<Directory>()
        await certacrypt.graph.put(driveRoot)
        const appRoot = await certacrypt.path('/apps')
        appRoot.addEdgeTo(driveRoot, 'filemanager')
        await certacrypt.graph.put(appRoot)

        config.sessionUrl = await certacrypt.getSessionUrl()
        const json = JSON.stringify(config)
        await fs.writeFile(configFile, json, 'utf-8')
    }
    const rootVertex = <Vertex<Directory>> await certacrypt.path('/apps/filemanager')
    const drive = await certacrypt.drive(rootVertex)

    const api = new DriveEventHandler(ipcMain, drive)
    const files = await api.readdir('/')
    if(files.findIndex(f => f.name === 'readme.txt') < 0) {
        await api.writeFile('readme.txt', 'hello world')
    }

    if(files.findIndex(f => f.name === 'pics') < 0) {
        await api.mkdir('pics')
    }
    const sub = await api.readdir('/pics')
    if(sub.findIndex(f => f.name === 'hello.txt') < 0) {
        await api.writeFile('/pics/hello.txt', 'salut')
    }
    
    Main.main(app, BrowserWindow)
}
