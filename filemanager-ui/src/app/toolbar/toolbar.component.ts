import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, ValidationErrors, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { DriveService } from '../drive.service';

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

  public mountShareName: string = ''
  private currentPath: string

  constructor(private drive: DriveService, private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {

    this.drive.observePath(this.activatedRoute).subscribe(async path => {
      this.currentPath = path
    })
    
    
  }

  /*
  async onMount(url: string, target: string) {
    const path = this.currentPath + '/' + target
    await this.drive.mountShare(url, path).catch(onError)
    this.drive.reload()

    function onError() {
      this.snackBarRef.open('Failed to mount Share - is this a valid link?', 'dismiss', {duration: 2000})
    }
  }

  async onMountChange(value: string) {
    if(!value || ! value.trim()) return
    
    const url = new URL(value)
    const shareName = url.searchParams.get('name')
    const type = url.searchParams.get('type')
    if(type && type !== 'share') {
      this.snackBarRef.open('This link is not of type Share', 'dismiss', {duration: 2000})
    }
    if(shareName) this.mountShareName = shareName
  }*/

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
