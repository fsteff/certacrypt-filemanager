import os from 'os'
import { CertaCrypt, GraphObjects, User, FriendState, parseUrl, URL_TYPES, createUrl, CommShare } from "certacrypt";
import { ShareGraphObject } from 'certacrypt-graph';
import { IpcMain, dialog } from "electron";
import { Generator, GraphObject, GRAPH_VIEW, IVertex, Query, QueryState, Vertex, VertexQueries } from "hyper-graphdb";
import { Contact, IContactsEventHandler, Profile, Share } from "./EventInterfaces";
import { MainEventHandler } from "./MainEventHandler";
import { PubSub } from "./pubsub";
import { GraphObjectTypeNames } from 'certacrypt/lib/graphObjects';

export default class ContactsEventHandler extends MainEventHandler implements IContactsEventHandler {
    constructor(app: IpcMain, readonly certacrypt: CertaCrypt, readonly pubsub: PubSub) {
        super(app, 'contacts')
        this.certacrypt.contacts.then(async contacts => {
            // download and seed the main feed of all friends
            const friends = await contacts.getFriends()
            for (const friend of friends) {
                const feed = friend.publicRoot.getFeed()
                const name = (await friend.getProfile())?.username || friend.getPublicUrl()
                const store = await this.certacrypt.graph.core.getStore(feed)
                console.log('DEBUG: starting download of friend feed: ' + name)
                store.feed.feed.download(undefined, err => {
                    if(err) console.error('download of friend feed failed: ' + err)
                    else console.log('DEBUG: download of friend feed finished: ' + name)
                })
            }
        })
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

    async sendShare(userUrls: string[], shareUrl: string) {
        const users = await Promise.all(userUrls.map(u => this.certacrypt.getUserByUrl(u)))
        await this.certacrypt.sendShare(shareUrl, users)
    }

    async getAllReceivedShares() : Promise<Share[]>{
        const shares = await (await this.certacrypt.contacts).getAllReceivedShares()
        return Promise.all(shares.map(share => this.convertToShare(share)))
    }

    async getAllSentShares() : Promise<Share[]>{
        const shares = await (await this.certacrypt.contacts).getAllSentShares()
        return Promise.all(shares.map(share => this.convertToShare(share)))
    }

    private async convertToShare(share: CommShare): Promise<Share> {
        const shareUrl = createUrl(share.share, this.certacrypt.graph.getKey(share.share), undefined, URL_TYPES.SHARE, share.name)
        const target = <Vertex<GraphObject>> share.target

        const appRoot = await this.certacrypt.path('/apps/filemanager')
        const view = this.certacrypt.graph.factory.get(GRAPH_VIEW)
        const visited: IVertex<GraphObject>[] = []
        const path = await traverse(view.query(Generator.from([new QueryState(appRoot, [], [], view)])), [], 0)
        const drivePath = path ? path.join('/') : undefined
        
        return <Share> {shareUrl, drivePath, name: share.name, info: share.info, owner: share.owner, sharedBy: share.sharedBy, sharedWith: share.sharedWith}

        async function traverse(query: Query<GraphObject>, path: string[], depth: number): Promise<string[]|undefined> {
            if(depth > 100) return

            const vertices = await query.generator().destruct(err => 'failed to get vertex for path: ' + err)
            if(vertices.find(v => v.equals(target))) return path

            let results = vertices.map(v => v.getEdges().map(e => {return {vertex: v, label: e.label}})).reduce((arr, val) => arr.concat(val))
            const promises: Promise<string[]|undefined>[] = []
            for(let result of results) {
                if(visited.find(v => v.equals(result.vertex))) continue
                const query = view.query(Generator.from([new QueryState(result.vertex, [], [], view)])).out(result.label)
                const promise = traverse(query, path.concat([result.label]), depth + 1)
                    .then((found) => {
                        visited.push(result.vertex)
                        return found
                    })
                promises.push(promise)
            }
            for (const found of await Promise.all(promises)) {
                if(found) return found
            }
        }
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