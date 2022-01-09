import { Injectable } from '@angular/core';

import globals from '../../../src/globals'
import {Profile, Contact, Share} from '../../../src/EventInterfaces'

@Injectable({
  providedIn: 'root'
})
export class ContactService {

  constructor() { }

  getProfile(userUrl?: string) {
    return globals.contacts.getProfile(userUrl)
  }

  setProfile(profile: Profile) {
    return globals.contacts.setProfile(profile)
  }

  addFriend(userUrl: string) {
    return globals.contacts.addFriend(userUrl)
  }

  getAllContacts(): Promise<Contact[]> {
    return globals.contacts.getAllContacts()
  }

  readProfileImage(url: string) {
    return globals.contacts.readProfileImage(url)
  }

  getUserByUrl(url: string) {
    return globals.contacts.getUserByUrl(url)
  }

  getFriendState(url: string) {
    return globals.contacts.getFriendState(url)
  }

  getReceivedFriendRequests() {
    return globals.contacts.getReceivedFriendRequests()
  }

  sendShare(user: string, url: string) {
    return globals.contacts.sendShare([user], url)
  }

  getAllReceivedShares() : Promise<Share[]> {
    return globals.contacts.getAllReceivedShares()
  }

  getAllSentShares() : Promise<Share[]> {
    return globals.contacts.getAllSentShares()
  }

  revokeShare(userUrl: string, path: string) : Promise<void> {
    return globals.contacts.revokeShare(userUrl, path)
  }
}
