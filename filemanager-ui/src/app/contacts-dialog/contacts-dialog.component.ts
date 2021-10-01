import { Component, OnInit, ViewChild } from '@angular/core';
import { Contact } from '../../../../src/EventInterfaces';
import { ContactService } from '../contact.service';

@Component({
  selector: 'app-contacts-dialog',
  templateUrl: './contacts-dialog.component.html',
  styleUrls: ['./contacts-dialog.component.css']
})
export class ContactsDialogComponent implements OnInit {

  contactList: Contact[]
  addedFriends: Contact[] = []

  constructor(private contacts: ContactService) { }

  async ngOnInit(): Promise<void> {
    this.contactList = await this.contacts.getAllContacts()
  }

  async onFriendInput(event: Event) {
    const url = (event?.target as HTMLInputElement)?.value
    if(url && url.startsWith('hyper://')) {
      const profile = await this.contacts.getUserByUrl(url)
      if(profile) {
        await this.contacts.addFriend(url)
        this.addedFriends.push(profile)
      }

    }
  }
}