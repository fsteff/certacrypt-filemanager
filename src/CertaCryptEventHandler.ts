import { CertaCrypt } from '@certacrypt/certacrypt';
import { IpcMain } from 'electron';
import DriveEventHandler from './DriveEventHandler';
import { ICertaCryptEventHandler, IDriveEventHandler } from './EventInterfaces'
import { MainEventHandler } from './MainEventHandler';

export default class CertaCryptEventHandler extends MainEventHandler implements ICertaCryptEventHandler{
    private certacrypt: CertaCrypt
    private driveHandlers: Map<String, IDriveEventHandler>
    
    constructor(app: IpcMain, certacrypt: CertaCrypt) {
        super(app, '@certacrypt/certacrypt')
        this.certacrypt = certacrypt
        this.driveHandlers = new Map<String, IDriveEventHandler>()
    }
    
}