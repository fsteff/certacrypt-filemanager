import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, Inject, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
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
              private snackBarRef: MatSnackBar,
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

    const url = await this.drive.getFileUrl(upload[0])
    this.profile.profilePicture = url

    this.contacts.readProfileImage(url).then(dataUri => {
      this.image = dataUri
    })
  }

  onCopyUrl(){
    navigator.clipboard.writeText(this.profile.publicUrl)
    this.snackBarRef.open('Profile URL copied to clipboard!', 'dismiss', {duration: 2000})
  }
}
