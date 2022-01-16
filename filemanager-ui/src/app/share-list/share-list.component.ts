import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DriveShare } from '@certacrypt/certacrypt';
import { Share } from '../../../../src/EventInterfaces';
import { ContactService } from '../contact.service';
import { DriveService } from '../drive.service';

@Component({
  selector: 'app-share-list',
  templateUrl: './share-list.component.html',
  styleUrls: ['./share-list.component.css']
})
export class ShareListComponent implements OnInit {

  sentShares: Share[]
  receivedShares: Share[]
  mountShareName: string

  constructor(private contacts: ContactService, private drive: DriveService, private snackBarRef: MatSnackBar) { }

  async ngOnInit() {
    this.sentShares = await this.contacts.getAllSentShares()
    this.receivedShares = await this.contacts.getAllReceivedShares() 
  }

  async onMount(url: string, target: string) {
    const path = '/shares/' + target
    await this.drive.mountShare(url, path).catch(onError)
    this.drive.reload()

    function onError() {
      this.snackBarRef.open('Failed to mount Share - is this a valid link?', 'dismiss', {duration: 2000})
    }
  }

  async onMountChange(value: string) {
    if(!value || ! value.trim()) return
    
    const url = new URL(value)
    const shareName = url.searchParams.get('name')
    const type = url.searchParams.get('type')
    if(type && type !== 'share') {
      this.snackBarRef.open('This link is not of type Share', 'dismiss', {duration: 2000})
    }
    if(shareName) this.mountShareName = shareName
  }
}
