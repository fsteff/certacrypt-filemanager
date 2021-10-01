import { ContactProfile, FriendState, GraphObjects } from 'certacrypt'
import { GraphObject } from 'hyper-graphdb';

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
    atime: string,
    mtime: string,
    ctime: string,
    linkname?: any,
    isDirectory?: boolean,
    isFile?: boolean,
    isSymlink?: boolean
}

export type RawGraphObject<T extends GraphObject> = Omit<{[Property in keyof T]: T[Property]}, 'typeName' | 'serialize'> 
export type Contact = RawGraphObject<ContactProfile>
export type Profile = RawGraphObject<GraphObjects.UserProfile>

export type Peer = {};

export type FileDownload = {filename: string, size: number, downloaded: number, error?: Error, localPath?: string}

export type readdirResult = { name: string, path: string, stat: Stat }

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

    shareFile(path: string): Promise<string>
    mountShare(url: string, path: string): Promise<string>

    lookupPeers(url: string): Promise<Peer>
}