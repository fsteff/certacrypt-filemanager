import os from 'os'
import { CertaCrypt, GraphObjects, User, FriendState } from "certacrypt";
import { IpcMain, dialog } from "electron";
import { Vertex } from "hyper-graphdb";
import { Contact, IContactsEventHandler, Profile } from "./EventInterfaces";
import { MainEventHandler } from "./MainEventHandler";
import { PubSub } from "./pubsub";

export default class ContactsEventHandler extends MainEventHandler implements IContactsEventHandler {
    constructor(app: IpcMain, readonly certacrypt: CertaCrypt, readonly pubsub: PubSub) {
        super(app, 'contacts')
    }

    static async init(app: IpcMain, certacrypt: CertaCrypt, pubsub: PubSub) {
        await certacrypt.contacts

        const user = await certacrypt.user
        const profile = await user.getProfile() || new GraphObjects.UserProfile()
        if(! profile?.username) {
            profile.username = os.userInfo().username
            await user.setProfile(profile)
        }

        return new ContactsEventHandler(app, certacrypt, pubsub)
    }

    async getAllContacts(): Promise<Contact[]> {
        return (await this.certacrypt.contacts).getAllContacts()
    }

    async getReceivedFriendRequests() :Promise<Contact[]> {
        const urls = await this.pubsub.getReceivedUserUrls()
        const profiles = new Array<Contact>()
        for(const url of urls) {
            try {
                const profile = await this.getProfile(url)
                profiles.push(profile)
            } catch (err) {
                console.error('failed to load profile: ' + err)
            }
        }
        return profiles
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

    async getFriendState(url: string): Promise<FriendState> {
        const user = await this.certacrypt.getUserByUrl(url)
        return (await this.certacrypt.contacts).getFriendState(user)
    }

    async readProfileImage(url: string): Promise<string> {
        const {name, readFile} = await this.certacrypt.getFileByUrl(url)
        const data = await readFile({db: {encrypted: true}, encoding: 'base64'})
        const mime = getImageMime(name)

        return 'url(data:' + mime + ';base64,' + data + ')'
    }

    async getUserByUrl(url: string): Promise<Contact> {
        const user = await this.certacrypt.getUserByUrl(url)
        const profile: Contact = {...await user.getProfile(), publicUrl: url}
        return profile
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