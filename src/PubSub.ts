import { CertaCrypt, FriendState } from '@certacrypt/certacrypt'
import { debug as HyperPubSubDebug, PubSub as HyperPubSub } from 'hyperpubsub'
import { Client } from 'hyperspace'

const CACHE_PATH = 'certacrypt-filemanager/pubsub/received'

export class PubSub {
    readonly pubsub: HyperPubSub
    
    constructor(private client: Client, private certacrypt: CertaCrypt) {
        this.pubsub = new (HyperPubSubDebug()).PubSub(this.client.network)
        this.pubsub.on('error', console.error)
        this.init()
    }

    async init() {
        const user = await this.certacrypt.user
        this.pubsub.subPrivateMsg(await user.getPublicKey(), user.getSecretKey(), (msg, app, peer) => this.onMessage(msg, app, peer).catch(console.error))

        const contacts = await this.certacrypt.contacts
        const friends = await contacts.getFriends()
        for(const friend of friends) {
            this.pubsub.joinPublicKey(await friend.getPublicKey())
        }
        setInterval(() => this.tryNotifyFriends().catch(console.error), 30000)
    }

    async tryNotifyFriends() {
        const contacts = await this.certacrypt.contacts
        const friends = await contacts.getFriends()
        const message = Buffer.from((await this.certacrypt.user).getPublicUrl(), 'utf-8')
        for(const friend of friends) {
            const state = await contacts.getFriendState(friend)
            if(state === FriendState.REQUEST_SENT) {
                this.pubsub.pubPrivateMsg(await friend.getPublicKey(), message)
                const username =  (await friend.getProfile()).username
                console.log('DEBUG: sent PubSub Friend URL to ' + username)
            }
        }
    }

    async onMessage(msg: Buffer, app: string, peer: {}) {
        const url = msg.toString('utf-8')
        console.log('received PubSub Friend URL: ' + url)
        
        const observed = await this.getReceivedUserUrls()
        if(observed.indexOf(url) < 0) {
            observed.push(url)
            const cache = await this.certacrypt.cacheDb
            await cache.put(CACHE_PATH, observed)
        }
    }

    async getReceivedUserUrls() {
        const cache = await this.certacrypt.cacheDb
        const observed = (await cache.get<string[]>(CACHE_PATH)) || []
        return observed
    }


}