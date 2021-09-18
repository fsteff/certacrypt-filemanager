import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Contact } from '../../../../src/EventInterfaces';
import { ContactService } from '../contact.service';
import { DriveService } from '../drive.service';

@Component({
  selector: 'app-profile-image',
  templateUrl: './profile-image.component.html',
  styleUrls: ['./profile-image.component.css']
})
export class ProfileImageComponent implements AfterViewInit {

  @Input()
  profile: Contact

  backgroundImage: string

  constructor(private contacts: ContactService, private drive: DriveService) { }

  ngAfterViewInit() {
    //this.profile = Object.assign(this.profile || {publicUrl: ''}, {profilePicture: 'hyper://e8fbe0a24ea46e9a15c5c94ffe78f1384a8501a3a829de1b51c815aaa58dc65d/14?key=1eb8394b46e208d9279453467955cfa8370799a6d9dbfc9a72453d5f3305fb8d'})
  
    if(this.profile?.profilePicture) {
      this.contacts.readProfileImage(this.profile.profilePicture).then(dataUri => {
        this.backgroundImage = dataUri
      })
    }
  }

}
