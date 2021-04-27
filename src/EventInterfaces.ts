
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
    // TODO: clarify
    //isDirectory: boolean,
    //isFile: boolean,
    //isSymlink: boolean
}

export interface ICertaCryptEventHandler {
    
}

export interface IDriveEventHandler {
    readdir(path: string): Promise<Array<string>>
    mkdir(path: string): Promise<void>
    rmdir(path: string): Promise<void>
    stat(path: string): Promise<Stat>

    open(path: string, flags: string): Promise<Fd>
    read(fd: Fd, position?: number, length?: number): Promise<{buffer: Uint8Array, bytesRead: number}>
    write(fd: Fd, buf: Uint8Array, position?: number): Promise<void>

    readFile(path: string): Promise<Fd>
    writeFile(path: string, content: Uint8Array|string): Promise<void>
}