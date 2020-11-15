import { CertaCrypt } from 'certacrypt'
import {Server, Client} from 'hyperspace'
import { app, BrowserWindow, ipcMain } from 'electron';
import { promises as fs } from 'fs'
import Main from './Main';
import DriveEventHandler from './DriveEventHandler';

Main.main(app, BrowserWindow)
startServer()

async function startServer() {
    const server = new Server()
    await server.ready()
    const client = new Client()
    await client.ready()

    const configFile = app.getPath('home') + '/.hyperspace/certacrypt.json'
    const config = await fs.readFile(configFile, 'utf-8')
        .then(txt => JSON.parse(txt))
        .catch(async err => {
            console.error(err)
            const cfg = {key: CertaCrypt.generateMasterKey().toString('hex')}
            await fs.writeFile(configFile, JSON.stringify(cfg))
            return cfg
        })

    const certacrypt = new CertaCrypt(config.key, client.corestore())
    new DriveEventHandler(ipcMain, certacrypt)
}
