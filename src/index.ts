import {Server, Client} from 'hyperspace'
import { app, BrowserWindow, ipcMain, protocol } from 'electron'
import { promises as fs } from 'fs'
import Main from './Main';

import { CertaCrypt, GraphObjects, enableDebugLogging } from 'certacrypt'
import { DefaultCrypto } from 'certacrypt-crypto'

import DriveEventHandler from './DriveEventHandler'
import ContactsEventHandler from './ContactsEventHandler'
import { Feed } from 'hyperobjects';

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
    const cores = new Map<string, Feed>()
    corestore.get = function(...args) {
        let key: string
        if(args.length > 0) {
            if(Buffer.isBuffer(args[0])) key = args[0].toString('hex')
            else if (typeof args[0] === 'string') key = args[0]
            else if(typeof args[0] === 'object' && args[0].key) {
                if(Buffer.isBuffer(args[0].key)) key = args[0].toString('hex')
                else if (typeof args[0].key === 'string') key = args[0].key
            }
            if(key && cores.has(key)) {
                return cores.get(key)
            }
        }

        const feed = oldGet.call(corestore, ...args)
        if(key) {
            cores.set(key, feed)
        } else {
            feed.once('ready', () => cores.set(feed.key.toString('hex'), feed))
        }
        
        client.replicate(feed).then(() => {
            console.log('replicating feed ' + feed.key.toString('hex'))
            if(feed.peers.length > 0) console.log('already have peers for feed ' + feed.key.toString('hex') + ': ' + feed.peers.map(p => p.remoteAddress).join(', '))
            feed.on('peer-add', peer => console.log('peer-add for feed ' + feed.key.toString('hex') + ': ' + peer.remoteAddress + '|' + peer.type))
        })
        return feed
    }

    const crypto = new DefaultCrypto()

    const configFile = app.getPath('home') + '/.hyperspace/certacrypt.json'
    const config: {sessionUrl?: string} = await fs.readFile(configFile, 'utf-8')
        .then(txt => JSON.parse(txt))
        .catch(async err => {
            console.error('can`t find or open certacrypt.json')
            return {}
        })

    enableDebugLogging()

    const certacrypt = new CertaCrypt(corestore, crypto, config.sessionUrl)
    //client.network.configure(corestore.get((await certacrypt.sessionRoot).getFeed()), {announce: true, lookup: true})

    if(!config.sessionUrl) {
        const driveRoot = certacrypt.graph.create<GraphObjects.Directory>()
        await certacrypt.graph.put(driveRoot)
        const appRoot = await certacrypt.path('/apps')
        appRoot.addEdgeTo(driveRoot, 'filemanager')
        await certacrypt.graph.put(appRoot)

        config.sessionUrl = await certacrypt.getSessionUrl()
        const json = JSON.stringify(config)
        await fs.writeFile(configFile, json, 'utf-8')
    }
    await DriveEventHandler.init(ipcMain, certacrypt, client)
    await ContactsEventHandler.init(ipcMain, certacrypt)

    console.log(await certacrypt.debugDrawGraph())

    Main.main(app, BrowserWindow)
}
