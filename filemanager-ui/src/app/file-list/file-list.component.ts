import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core'
import { MatSort } from '@angular/material/sort'
import { MatTableDataSource } from '@angular/material/table'
import { ActivatedRoute } from '@angular/router'
import { DriveService } from '../drive.service'

@Component({
  selector: 'app-file-list',
  templateUrl: './file-list.component.html',
  styleUrls: ['./file-list.component.css']
})
export class FileListComponent implements OnInit, AfterViewInit {
  files: MatTableDataSource<{name: string, link?: string, icon?: string ,size: string, lastChanged: string}>
  columnsToDisplay = ['icon', 'name', 'size', 'lastChanged']

  @ViewChild(MatSort) sort: MatSort;

  constructor (private drive: DriveService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.files = new MatTableDataSource()
    this.route.paramMap.subscribe(params => {
      let path = window.decodeURIComponent(params.get('path'))
      this.getFiles(path)
    })
  }

  ngAfterViewInit() {
    this.files.sort = this.sort
  }

  getFiles(path: string) { 
    this.drive.readdir(path).subscribe(files => {
      this.files.data = 
        files.map(r => {
          return {
            name: r.name, 
            icon: r.stat.isDirectory ? 'folder' : 'description',
            link: r.stat.isDirectory ? '/explorer/' + window.encodeURIComponent(r.path) : undefined,
            size: formatSize(r.stat?.size), 
            lastChanged: toDate(r.stat?.mtime)}
        })
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
