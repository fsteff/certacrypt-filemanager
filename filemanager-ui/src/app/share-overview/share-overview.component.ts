import { Component, Input, OnInit } from '@angular/core';
import { Contact, Share } from '../../../../src/EventInterfaces';
import { ContactService } from '../contact.service';
import { DriveService } from '../drive.service';

@Component({
  selector: 'app-share-overview',
  templateUrl: './share-overview.component.html',
  styleUrls: ['./share-overview.component.css']
})
export class ShareOverviewComponent implements OnInit {

  @Input()
  share: Share

  @Input()
  showSharedBy = true
  
  @Input()
  showSharedWith = true

  sharedBy: Contact
  sharedWith: Contact[]
  shareLink: string
  created: string
  isFile: boolean
  count: number
  filePath: string

  constructor(private contacts: ContactService, private drive: DriveService) { }

  async ngOnInit() {
    if(this.showSharedBy) this.sharedBy = await this.contacts.getUserByUrl(this.share.sharedBy)
    if(this.showSharedWith) this.sharedWith = await Promise.all(this.share.sharedWith.map(u => this.contacts.getUserByUrl(u)))
    if(this.share.drivePath) {
      this.shareLink = '/explorer/' + window.encodeURIComponent(this.share.drivePath)
      
      const path = this.share.drivePath.split('/')
      let filename = path[path.length-1]
      if(filename.length > 64) filename = filename.slice(0, 16) + '...'

      path.splice(path.length-1, 1)
      if(this.share.name) {
        const usr = await this.contacts.getProfile(this.share.owner)
        filename = usr.username + ': ' + this.share.name
      }

      this.filePath = path.concat(filename).join('/')

      const info = await this.drive.stat(this.share.drivePath)
      this.isFile = info.isFile
      this.created = info.ctime.toLocaleString()
    
      const dir = await this.drive.readdir(this.share.drivePath).toPromise()
      this.count = dir.length
    }
    
  }

}
