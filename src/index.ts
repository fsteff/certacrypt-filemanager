import {Server, Client} from 'hyperspace'
import { app, BrowserWindow, ipcMain, protocol } from 'electron'
import { promises as fs } from 'fs'
import Main from './Main';

import { CertaCrypt } from 'certacrypt'
import { DefaultCrypto } from 'certacrypt-crypto'

import DriveEventHandler from './DriveEventHandler'

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
    if(!config.sessionUrl) {
        config.sessionUrl = await certacrypt.getSessionUrl()
        const json = JSON.stringify(config)
        await fs.writeFile(configFile, json, 'utf-8')
    }
    new DriveEventHandler(ipcMain, certacrypt)

    //const drive = await certacrypt.getDefaultDrive()
    //await drive.promises.writeFile('test.txt', 'hello world')

    Main.main(app, BrowserWindow)
}
