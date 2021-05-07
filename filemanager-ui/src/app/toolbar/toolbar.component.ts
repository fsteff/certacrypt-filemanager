import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DriveService } from '../drive.service';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent implements OnInit {
  shareInput: string

  private currentPath: string

  constructor(private drive: DriveService, private route: ActivatedRoute) { }

  ngOnInit(): void {

    this.drive.observePath(this.route).subscribe(path => this.currentPath = path)
  }

  onMount() {
    console.log(this.shareInput)
  }

  async onUpload() {
    console.log(await this.drive.uploadFile(this.currentPath))
    this.drive.reload()
  }

  onReload() {
    this.drive.reload()
  }

}
