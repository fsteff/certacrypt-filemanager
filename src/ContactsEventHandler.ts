import { CertaCrypt, GraphObjects } from "certacrypt";
import { IpcMain } from "electron";
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
    async getProfile(url?: string): Promise<Profile> {
        if(url) {
            const user = await this.certacrypt.getUserByUrl(url)
            return user.getProfile().then(profile => profile || {})
        } else {
            return (await this.certacrypt.user).getProfile().then(profile => profile || {})
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
    
}