import { ContactProfile, FriendState, GraphObjects } from '@certacrypt/certacrypt'
import { GraphObject } from '@certacrypt/hyper-graphdb';

export type Fd = number
export type Stat = {
    dev: number,
    nlink: number,
    rdev: number,
    blksize: number,
    ino: number,
    mode: number,
    uid: number,
    gid: number,
    size: number,
    offset: number,
    blocks: number,
    atime: Date,
    mtime: Date,
    ctime: Date,
    linkname?: any,
    isDirectory?: boolean,
    isFile?: boolean,
    isSymlink?: boolean
}

export type RawGraphObject<T extends GraphObject> = Omit<{[Property in keyof T]: T[Property]}, 'typeName' | 'serialize'> 
export type Contact = RawGraphObject<ContactProfile>
export type Profile = RawGraphObject<GraphObjects.UserProfile>

export type Share =  {
    owner: string
    info: string
    name: string
    sharedBy: string,
    sharedWith: string[],
    shareUrl: string
    drivePath: string
}

export type ShareMeta = {
    owner: string,
    name: string, 
    share: string,
    path: string
}

export type Space = {space: string, owner: string, writers: string[], isWriteable: boolean}

export type Peer = {};

export type FileDownload = {filename: string, size: number, downloaded: number, error?: Error, localPath?: string}

export type readdirResult = { name: string, path: string, stat: Stat, space?: Space, share?: ShareMeta }

export interface ICertaCryptEventHandler {
    
}

export interface IContactsEventHandler {
    getAllContacts(): Promise<Contact[]>
    getReceivedFriendRequests() :Promise<Contact[]>
    
    getProfile(url?: string): Promise<Contact>
    setProfile(profile: Profile): Promise<void>
    
    addFriend(url: string): Promise<void>

    readProfileImage(url: string): Promise<string> 
    getUserByUrl(url: string): Promise<Contact>
    getFriendState(url: string): Promise<FriendState>
    sendShare(userUrls: string[], path: string): Promise<void>

    getAllReceivedShares() : Promise<Share[]>
    getAllSentShares(): Promise<Share[]>

    revokeShare(userUrl: string, path: string): Promise<void>
    revokeWriteAccess(userUrl: string, path: string): Promise<void>
}

export interface IDriveEventHandler {
    readdir(path: string): Promise<readdirResult[]>
    mkdir(path: string): Promise<string>
    unlink(path: string): Promise<string>
    stat(path: string): Promise<Stat>

    readFile(path: string, encoding?: string): Promise<Uint8Array|string>
    writeFile(path: string, content: Uint8Array|string, encoding?: string): Promise<void>

    downloadFile(path: string): Promise<number>
    getDownloadStates(): Promise<FileDownload[]>

    uploadFile(path: string, multiple: boolean): Promise<string[]>

    createUrlShare(path: string): Promise<string>
    mountShare(url: string, path: string): Promise<string>

    lookupPeers(url: string): Promise<Peer>
    getFileUrl(path: string): Promise<string>

    addWriterToSpace(path: string, user: string): Promise<Space>
    getSpace(path: string): Promise<Space>
}