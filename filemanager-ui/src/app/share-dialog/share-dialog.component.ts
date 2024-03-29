import { AfterViewInit, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatExpansionPanel } from '@angular/material/expansion';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTable } from '@angular/material/table';


import { Contact } from '../../../../src/EventInterfaces';
import { ContactService } from '../contact.service';
import { DriveService } from '../drive.service';
import { FileData } from '../file-list/file-list.component';

@Component({
  selector: 'app-share-dialog',
  templateUrl: './share-dialog.component.html',
  styleUrls: ['./share-dialog.component.css']
})
export class ShareDialogComponent implements AfterViewInit {
  url: string
  sharedWith: Contact[] = []
  allContacts: Contact[] = []

  @ViewChild('urlInput') urlInput: ElementRef<HTMLInputElement>
  @ViewChild('sharedWithTable') sharedWithTable: MatTable<Contact>
  @ViewChild('allContactsTable') allContactsTable: MatTable<Contact>
  @ViewChild('shareUrlPanel') shareUrlPanel: MatExpansionPanel

  constructor(
    private drive: DriveService,
    private contacts: ContactService,
    private snackBarRef: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public fileData: FileData) { }

  ngAfterViewInit() {
    this.shareUrlPanel.afterExpand.subscribe(async () => {
      if(!this.url) this.url = await this.drive.createShare(this.fileData.path)
    })
    return this.reloadShares()
  }

  async reloadShares() {
    const allContacts = await this.contacts.getAllContacts()
    const shares = await this.contacts.getAllSentShares()
    const details = shares.filter(s => {
      return normalize(s.drivePath) === normalize(this.fileData.path)
    })
    if(details) {
      this.sharedWith = await Promise.all(flatMap(details.map(d => d.sharedWith.map(u => this.contacts.getProfile(u)))))
      for (const user of this.sharedWith) {
        const idx = allContacts.findIndex(u => u.publicUrl === user.publicUrl)
        if(idx >= 0) allContacts.splice(idx, 1)
      }
    }

    allContacts.sort((a,b) => a.username?.localeCompare(b.username))
    this.allContacts = allContacts
    this.fileData.space = await this.drive.getSpace(this.fileData.path)
    this.allContactsTable?.renderRows()
    this.sharedWithTable?.renderRows()
  }

  isWriter(user: string) {
    return this.fileData.space?.writers.includes(user)
  }

  onCopy() {
    const input = this.urlInput.nativeElement
    input.select()
    document.execCommand('copy')
    this.snackBarRef.open('Share URL copied to clipboard!', 'dismiss', {duration: 2000})
  }

  async toggleWriter(user: Contact) {
    if(this.isWriter(user.publicUrl)) {
      await this.contacts.revokeWriteAccess(user.publicUrl, this.fileData.path)
    } else {
      await this.drive.addWriterToSpace(this.fileData.path, user.publicUrl)
      console.log('converted directory ' + this.fileData.path + ' to collaboration space')
    }
    await this.reloadShares()
  }

  async onRevokeRead(user: Contact) {
    await this.contacts.revokeShare(user.publicUrl, this.fileData.path)
    this.reloadShares()
  }

  async onAdd(user: Contact) {
    await this.contacts.sendShare(user.publicUrl, this.fileData.path)
    this.reloadShares()
  }
}

function flatMap<T>(arr: T[][]) {
  return arr.reduce((acc, x) => acc.concat(x), [])
}

function normalize(path: string) {
  return path.replace('\\', '/')
  .split('/')
  .map(s => s.trim())
  .filter(s => s.length > 0)
  .join('/')
}