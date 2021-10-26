import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
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
export class ShareDialogComponent implements OnInit {
  url: string
  sharedWith: Contact[] = []
  allContacts: Contact[] = []

  @ViewChild('urlInput') urlInput: ElementRef<HTMLInputElement>
  @ViewChild('sharedWithTable') sharedWithTable: MatTable<Contact>
  @ViewChild('allContactsTable') allContactsTable: MatTable<Contact>

  constructor(
    private drive: DriveService,
    private contacts: ContactService,
    private snackBarRef: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public fileData: FileData) { }

  async ngOnInit(): Promise<void> {
    this.url = await this.drive.createShare(this.fileData.path)
    const allContacts = await this.contacts.getAllContacts()
  
    const shares = await this.contacts.getAllSentShares()
    const urlParsed = new URL(this.url)
    const details = shares.find(s => {
      const parsed = new URL(s.shareUrl)
      return parsed.pathname === urlParsed.pathname
    })
    if(details) {
      this.sharedWith = await Promise.all(details.sharedWith.map(u => this.contacts.getProfile(u)))
      for (const user of this.sharedWith) {
        const idx = allContacts.findIndex(u => u.publicUrl === user.publicUrl)
        if(idx >= 0) allContacts.splice(idx, 1)
      }
    }

    allContacts.sort((a,b) => a.username?.localeCompare(b.username))
    this.allContacts = allContacts
  }

  onCopy() {
    const input = this.urlInput.nativeElement
    input.select()
    document.execCommand('copy')
    this.snackBarRef.open('Share URL copied to clipboard!', 'dismiss', {duration: 2000})
  }

  async onAdd(user: Contact) {
    await this.contacts.sendShare(user.publicUrl, this.url)
    this.allContacts.splice(this.allContacts.indexOf(user), 1)
    this.sharedWith.push(user)
    this.sharedWith.sort((a,b) => a.username?.localeCompare(b.username))
    this.allContactsTable?.renderRows()
    this.sharedWithTable?.renderRows()
  }
}
