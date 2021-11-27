import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Contact } from '../../../../src/EventInterfaces';
import { ContactService } from '../contact.service';
import { DriveService } from '../drive.service';
import { ProfileDialogComponent } from '../profile-dialog/profile-dialog.component';

@Component({
  selector: 'app-profile-image',
  templateUrl: './profile-image.component.html',
  styleUrls: ['./profile-image.component.css']
})
export class ProfileImageComponent implements OnInit {

  @Input()
  profile: Contact

  @Input()
  tooltip: string

  @Input()
  writeable = false

  backgroundImage: string
  

  constructor(private contacts: ContactService, private dialog: MatDialog) { }

  async ngOnInit() {
    if(!this.profile) {
      this.profile = await this.contacts.getProfile()
      this.writeable = true
      this.tooltip = this.tooltip || 'You'
    }

    if(this.profile?.profilePicture) {
      console.log('loading profile picture ' + this.profile.profilePicture)
      this.contacts.readProfileImage(this.profile.profilePicture).then(dataUri => {
        this.backgroundImage = dataUri
      })
    } else {
      console.log('no profile picture found')
    }
  }

  onClick() {
    const dialogRef = this.dialog.open(ProfileDialogComponent, {width: '80%', maxWidth: '32em', data: {profile: this.profile, writeable: this.writeable, image: this.backgroundImage}})
    dialogRef.afterClosed().subscribe(async () => {
      if(this.writeable) {
        this.profile = await this.contacts.getProfile(this.profile.publicUrl)
        if(this.profile?.profilePicture) {
          this.contacts.readProfileImage(this.profile.profilePicture).then(dataUri => {
            this.backgroundImage = dataUri
          })
        }
      }
    })
  }

}
