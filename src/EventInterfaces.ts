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

export type FileDownload = {filename: string, size: number, downloaded: number, error?: Error, localPath?: string}

export type readdirResult = { name: string, path: string, stat: Stat }

export interface ICertaCryptEventHandler {
    
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

    uploadFile(path: string): Promise<string[]>

    shareFile(path: string): Promise<string>
    mountShare(url: string, path: string): Promise<string>
}