import { CertaCrypt } from 'certacrypt'
import {Server, Client} from 'hyperspace'
import { app, BrowserWindow } from 'electron';
import Main from './Main';

Main.main(app, BrowserWindow);

test()

async function test() {
    const server = new Server()
    await server.ready()
    const client = new Client()
    await client.ready()

    const key = CertaCrypt.generateMasterKey()
    const certacrypt = new CertaCrypt(key, client.corestore())
}
