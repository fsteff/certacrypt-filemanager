import { Component, ContentChild, ElementRef, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DriveService } from '../drive.service';
import { FileData } from '../file-list/file-list.component';

@Component({
  selector: 'app-share-dialog',
  templateUrl: './share-dialog.component.html',
  styleUrls: ['./share-dialog.component.css']
})
export class ShareDialogComponent implements OnInit {
  url: string

  @ViewChild('urlInput') urlInput: ElementRef<HTMLInputElement>

  constructor(
    private drive: DriveService,
    private dialogRef: MatDialogRef<ShareDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public fileData: FileData) { }

  async ngOnInit(): Promise<void> {
    this.url = await this.drive.createShare(this.fileData.path)
  }

  onCopy() {
    const input = this.urlInput.nativeElement
    input.select()
    document.execCommand('copy')
  }
}
