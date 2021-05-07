import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent implements OnInit {
  shareInput: string

  constructor() { }

  ngOnInit(): void {
  }

  onMount() {
    console.log(this.shareInput)
  }

  onUpload() {
    console.log('upload')
  }

}
