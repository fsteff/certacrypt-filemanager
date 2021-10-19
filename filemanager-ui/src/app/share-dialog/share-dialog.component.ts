import { Component, ContentChild, ElementRef, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';


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

  constructor(
    private drive: DriveService,
    private contacts: ContactService,
    @Inject(MAT_DIALOG_DATA) public fileData: FileData) { }

  async ngOnInit(): Promise<void> {
    this.url = await this.drive.createShare(this.fileData.path)
    this.allContacts = await this.contacts.getAllContacts()
    this.allContacts.sort((a,b) => a.username?.localeCompare(b.username))
  }

  onCopy() {
    const input = this.urlInput.nativeElement
    input.select()
    document.execCommand('copy')
  }

  async onAdd(user: Contact) {
    this.contacts.sendShare(user.publicUrl, this.url)
    this.allContacts.splice(this.allContacts.indexOf(user), 1)
    this.sharedWith.push(user)
    this.sharedWith.sort((a,b) => a.username?.localeCompare(b.username))
  }
}
