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
    const self = this
    window.setTimeout(() => {
      globals.drive.getLocalDriveId().then(id => self.onData(id))
    }, 1000)
  }

  onData (id) {
    fetch('hyper://' + id + '/.enc/1/test.txt').then(rsp => rsp.text).then(console.log)
  }
}
