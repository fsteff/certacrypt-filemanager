import { Component, Input, OnInit } from '@angular/core';
import { FriendState } from 'certacrypt';
import { ContactService } from '../contact.service';

@Component({
  selector: 'app-friend-state',
  templateUrl: './friend-state.component.html',
  styleUrls: ['./friend-state.component.css']
})
export class FriendStateComponent implements OnInit {

  @Input()
  publicUrl: string

  friendState: FriendState

  constructor(private contacts: ContactService) { }

  async ngOnInit(): Promise<void> {
    this.friendState = await this.contacts.getFriendState(this.publicUrl)
  }

  async onClick() {
    if(this.friendState === 'none' || this.friendState === 'received') {
      await this.contacts.addFriend(this.publicUrl)
      this.friendState = await this.contacts.getFriendState(this.publicUrl)
    }
  }
}
