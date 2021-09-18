import { CertaCrypt, GraphObjects } from "certacrypt";
import { IpcMain, dialog } from "electron";
import { Vertex } from "hyper-graphdb";
import { Contact, IContactsEventHandler, Profile } from "./EventInterfaces";
import { MainEventHandler } from "./MainEventHandler";

export default class ContactsEventHandler extends MainEventHandler implements IContactsEventHandler {
    constructor(app: IpcMain, readonly certacrypt: CertaCrypt) {
        super(app, 'contacts')
    }

    static async init(app: IpcMain, certacrypt: CertaCrypt) {
        await certacrypt.contacts
        return new ContactsEventHandler(app, certacrypt)
    }

    async getAllContacts(): Promise<Contact[]> {
        return (await this.certacrypt.contacts).getAllContacts()
    }
    async getProfile(url?: string): Promise<Contact> {
        if(url) {
            const user = await this.certacrypt.getUserByUrl(url)
            return user.getProfile().then(profile => Object.assign(profile || {}, {publicUrl: url}))
        } else {
            const user = await this.certacrypt.user
            return user.getProfile().then(profile => Object.assign(profile || {}, {publicUrl: user.getPublicUrl()}))
        }
    }
    async setProfile(profile: Profile): Promise<void> {
        const obj = new GraphObjects.UserProfile()
        Object.assign(obj, profile)
        return (await this.certacrypt.user).setProfile(obj)
    }

    async addFriend(url: string): Promise<void> {
        const user = await this.certacrypt.getUserByUrl(url)
        return (await this.certacrypt.contacts).addFriend(user)
    }

    async readProfileImage(url: string): Promise<string> {
        const drive = await this.certacrypt.drive(url)
        const files = await drive.promises.readdir('/', {db: {encrypted: true}})
        if(files.length !== 1) {
            throw new Error('expected exactly one file from url ' + url + ' but got: ' + files)
        }
        const filename = <string> files[0]
        const mime = getImageMime(filename)
        const data = await drive.promises.readFile(filename, {db: {encrypted: true}, encoding: 'base64'})
        return 'url(data:' + mime + ';base64,' + data + ')'
    }
}

function getImageMime(filename: string) {
    const parts = filename.split('.')
    const ext = parts[parts.length-1].toLocaleLowerCase()
    switch (ext) {
        case 'png': 
            return 'image/png'
        case 'jpg':
        case 'jpeg':
            return 'image/jpeg'
        case 'gif':
            return 'image/gif'
        default:
            console.error('unknown image file extension: ' + ext)    
            return 'image/png'
        //throw new Error('unknown image file extension: ' + ext)
    }
}