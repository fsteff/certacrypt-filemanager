import { Component } from '@angular/core';
import globals from '../../../src/globals';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'filemanager-ui';
  constructor () {
    console.log('drive is ' + !!globals.drive)
    window.setTimeout(() => {
      console.log('drive.getLocalDriveId is ' + !!globals.drive.getLocalDriveId)
      globals.drive.getLocalDriveId().then(id => this.title = id)
    }, 1000)
  }
}
