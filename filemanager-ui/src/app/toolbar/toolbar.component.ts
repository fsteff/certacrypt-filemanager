import { Component, OnInit } from '@angular/core';
import { FormControl, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DriveService } from '../drive.service';
import { ContactService } from '../contact.service';
import { Contact } from '../../../../src/EventInterfaces';
import { ContactsDialogComponent } from '../contacts-dialog/contacts-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent implements OnInit {
  mkdirFormControl = new FormControl('', [
    Validators.required,
    this.fileExistsValidator.bind(this)
  ])

  private currentPath: string

  constructor(private drive: DriveService, private activatedRoute: ActivatedRoute, private router: Router, private dialog: MatDialog) { }

  ngOnInit(): void {

    this.drive.observePath(this.activatedRoute).subscribe(async path => {
      this.currentPath = path
    })
  }

  async onMount(url: string, target: string) {
    const path = this.currentPath + '/' + target
    await this.drive.mountShare(url, path)
    this.drive.reload()
  }

  async onUpload() {
    await this.drive.uploadFile(this.currentPath)
    this.drive.reload()
  }

  onReload() {
    this.drive.reload()
  }

  async onMkdir(name: string){
    await this.drive.mkdir(this.currentPath + '/' + name)
    this.drive.reload()
  }

  onAddressBook(){
    this.dialog.open(ContactsDialogComponent, {width: '80%', maxWidth: '32em'})
  }

  private async fileExistsValidator(control: FormControl) : Promise<ValidationErrors>{
    const value = <string> control?.value
    if(value && value.length > 0) {
      const files = (await this.drive.readdir(this.currentPath).toPromise()).map(res => res.name)
      if(files.includes(value)){
        return {
          'exists': value
        }
      }
    }
    return null
  }

}
