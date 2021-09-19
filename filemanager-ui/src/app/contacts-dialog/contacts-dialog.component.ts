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

  ngOnInit(): void {
    Promise.all([this.contacts.getAllContacts(), this.contacts.getProfile()]).then(([list, me]) => {
      this.contactList = [me].concat(list)
    })
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

// hyper://7db4706d943bc99bac986ccaa5d3b513c12b1a787a981340a6fee35eef9ca54a/7?key=eb21630535af73605a34813ce8979b1b5b9f2ded2cb498fc9f406abb498d40ac&type=user