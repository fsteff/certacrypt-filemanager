# certacrypt-filemanager

Filemanager GUI as a demonstration for [CertaCrypt](https://github.com/fsteff/certacrypt).
From a user perspective it aims to look like the web interface of a cloud-storage solution similar to Dropbox or Google Drive, hiding the fact that it works completely decentralized using P2P technology.
It provides a simple user system that allows to add friends, which in turn are shared with your friend to extend the address book.
Files and directories can be shared by URL or by directly giving permissions in-app. Friends can be given write permission to directories.
All previously given permissions can be revoked.

![Example Image](https://github.com/fsteff/certacrypt/raw/master/docs/Filemanager-UI.png)

## Architecture

The GUI is implemented using Electron and Angular.
[Hyperspace](https://github.com/hypercore-protocol/hyperspace) is utilized for hypercore storage and networking.

![Architecture](https://github.com/fsteff/certacrypt/raw/master/docs/app-architecture.png)