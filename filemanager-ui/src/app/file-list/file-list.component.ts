import { Component, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { DriveService } from '../drive.service'

@Component({
  selector: 'app-file-list',
  templateUrl: './file-list.component.html',
  styleUrls: ['./file-list.component.css']
})
export class FileListComponent implements OnInit {
  files: {name: string, size: string, lastChanged: string}[] = []
  columnsToDisplay = ['name', 'size', 'lastChanged']

  constructor (private drive: DriveService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      let path = window.decodeURIComponent(params.get('path'))
      this.getFiles(path)
    })
  }

  getFiles(path: string) { 
    this.drive.readdir(path).subscribe(files => {
      this.files = files.map(r => {return {name: r.name, size: formatSize(r.stat?.size), lastChanged: toDate(r.stat?.mtime)}})
    })
  }
}

function toDate(timestamp?: string): string {
  if(timestamp) return new Date(timestamp).toLocaleDateString()
  else return ''
}

function formatSize(bytes?: number): string {
  if(typeof bytes === 'number') {
    if (bytes > 1000000) return bytes / 1000000 + ' MB'
    if (bytes > 1000) return bytes / 1000 + ' KB'
    return bytes + ' B'
  } else {
    return ''
  }
}
