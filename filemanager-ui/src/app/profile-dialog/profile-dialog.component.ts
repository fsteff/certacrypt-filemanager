import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, Inject, OnInit } from '@angular/core';
import { Contact } from '../../../../src/EventInterfaces';
import { ContactService } from '../contact.service';
import { DriveService } from '../drive.service';

export type ProfileDialogParameters = {
  profile: Contact
  writeable: boolean
  image?: string
}

@Component({
  selector: 'app-profile-dialog',
  templateUrl: './profile-dialog.component.html',
  styleUrls: ['./profile-dialog.component.css']
})
export class ProfileDialogComponent implements OnInit {

  image: string
  profile: Contact
  writeable: boolean

  constructor(private contacts: ContactService, 
              private drive: DriveService,
              private dialogRef: MatDialogRef<ProfileDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public params: ProfileDialogParameters) 
  {
    this.profile = params.profile
    this.image = params.image
    this.writeable = params.writeable
  }

  ngOnInit(): void {
    if(! this.image && this.profile?.profilePicture) {
      this.contacts.readProfileImage(this.profile.profilePicture).then(dataUri => {
        this.image = dataUri
      })
    }
  }
  
  async saveChanges () {
    await this.contacts.setProfile(this.profile)
    this.dialogRef.close()
  }

  close(){
    this.dialogRef.close()
  }

  async onUploadImage(){
    const upload = await this.drive.uploadFile('/.public/', false)
    if(!upload || upload.length === 0) return

    const share = await this.drive.shareFile(upload[0])
    this.profile.profilePicture = share

    this.contacts.readProfileImage(share).then(dataUri => {
      this.image = dataUri
    })
  }
}
