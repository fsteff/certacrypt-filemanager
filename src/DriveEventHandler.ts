import { CertaCrypt } from "certacrypt";
import { IpcMain } from "electron";
import { MainEventHandler } from "./MainEventHandler";
import { IDriveEventHandler } from "./EventInterfaces";

export default class DriveEventHandler extends MainEventHandler implements IDriveEventHandler{
    private certacrypt: CertaCrypt

    constructor(app: IpcMain, certacrypt: CertaCrypt) {
        super(app, 'drive')
        this.certacrypt = certacrypt
    }

    async getLocalDriveId() {
        const drive = await this.certacrypt.getDefaultDrive()
        return drive.key
    }
}