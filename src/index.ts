import {Server, Client} from 'hyperspace'
import { app, BrowserWindow, ipcMain, protocol } from 'electron'
import { promises as fs } from 'fs'
import Main from './Main';

import { CertaCrypt, Directory, enableDebugLogging } from 'certacrypt'
import { DefaultCrypto } from 'certacrypt-crypto'

import DriveEventHandler from './DriveEventHandler'

app.on('ready', startServer)

async function startServer() {
    let client
    try {
        client = new Client()
        await client.ready()
    } catch(e) {
        console.log('no hyperspace server running, starting up a new one')
        const server = new Server()
        await server.ready()
        client = new Client()
        await client.ready()
    }

    const corestore = client.corestore()
    const oldGet = corestore.get
    corestore.get = function(...args) {
        const feed = oldGet.call(corestore, ...args)
        client.replicate(feed).then(() => console.log('replicating feed ' + feed.key.toString('hex')))
        return feed
    }

    client.network.on('peer-add', peer => console.log(peer))

    const crypto = new DefaultCrypto()

    const configFile = app.getPath('home') + '/.hyperspace/certacrypt.json'
    const config: {sessionUrl?: string} = await fs.readFile(configFile, 'utf-8')
        .then(txt => JSON.parse(txt))
        .catch(async err => {
            console.error('can`t find or open certacrypt.json')
            return {}
        })

    const certacrypt = new CertaCrypt(corestore, crypto, config.sessionUrl)
    //client.network.configure(corestore.get((await certacrypt.sessionRoot).getFeed()), {announce: true, lookup: true})

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
    await DriveEventHandler.init(ipcMain, certacrypt)

    Main.main(app, BrowserWindow)
}
