import { Component, OnInit } from '@angular/core';
import { Share } from '../../../../src/EventInterfaces';
import { ContactService } from '../contact.service';

@Component({
  selector: 'app-share-list',
  templateUrl: './share-list.component.html',
  styleUrls: ['./share-list.component.css']
})
export class ShareListComponent implements OnInit {

  sentShares: Share[]
  receivedShares: Share[]

  constructor(private contacts: ContactService) { }

  async ngOnInit() {
    this.sentShares = await this.contacts.getAllSentShares()
    this.receivedShares = await this.contacts.getAllReceivedShares() 
  }

}
