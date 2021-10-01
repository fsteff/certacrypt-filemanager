import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSpinner } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Contact } from '../../../../src/EventInterfaces';
import { ContactService } from '../contact.service';

@Component({
  selector: 'app-contacts-dialog',
  templateUrl: './contacts-dialog.component.html',
  styleUrls: ['./contacts-dialog.component.css']
})
export class ContactsDialogComponent implements OnInit {

  contactList: Contact[]
  isLoading = false

  constructor(private contacts: ContactService, private snackBarRef: MatSnackBar) { }

  async ngOnInit(): Promise<void> {
    const [list, requests] = await Promise.all([this.contacts.getAllContacts(), this.contacts.getReceivedFriendRequests()])
    for(const user of requests) {
      if(! list.find(c => c.publicUrl === user.publicUrl)) {
        list.push(user)
      }
    }
    this.contactList = list
  }

  async onFriendInput(event: Event) {
    let input = (event.target as HTMLInputElement)
    const url = input?.value
    if(url && url.startsWith('hyper://')) {
      try {
        this.isLoading = true
        const profile = await this.contacts.getUserByUrl(url)
        const me = await this.contacts.getProfile()
        if(profile && ! this.contactList.find(c => c.publicUrl === url) && url !== me.publicUrl) {
          await this.contacts.addFriend(url)
          this.contactList = [profile].concat(this.contactList)
        }
      } catch(err) {
        console.log(err)
        this.snackBarRef.open('Failed to load user from URL, try again later or see the logs', 'dismiss', {duration: 3000})
      } finally {
        this.isLoading = false;
        input.value = ''
      }

    }
  }
}