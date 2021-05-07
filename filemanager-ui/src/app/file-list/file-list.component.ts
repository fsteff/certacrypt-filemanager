import { UrlResolver } from '@angular/compiler'
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core'
import { MatSort } from '@angular/material/sort'
import { MatTableDataSource } from '@angular/material/table'
import { ActivatedRoute } from '@angular/router'
import { DriveService } from '../drive.service'

interface FileData {
  name: string, 
  isFile?: boolean, 
  link?: string,
  icon?: string,
  size: string, 
  lastChanged: string, 
  path: string
}

@Component({
  selector: 'app-file-list',
  templateUrl: './file-list.component.html',
  styleUrls: ['./file-list.component.css']
})
export class FileListComponent implements OnInit, AfterViewInit {
  files: MatTableDataSource<FileData>
  columnsToDisplay = ['icon', 'name', 'size', 'lastChanged', 'more']

  @ViewChild(MatSort) sort: MatSort;

  constructor (private drive: DriveService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.files = new MatTableDataSource()
    this.drive.observePath(this.route).subscribe(path => this.getFiles(path))
  }

  ngAfterViewInit() {
    this.files.sort = this.sort
  }

  async onDownload(file: FileData) {
    const download = await this.drive.downloadFile(file.path)
    download.subscribe(state => {
      console.log('downloading ' + file.path + ': ' + state.downloaded + ' / ' + state.size)
    })
  }

  onShare(file: FileData) {
    console.log('onShare: ' + file.path)
  }

  getFiles(path: string) { 
    this.drive.readdir(path).subscribe(files => {
      files.sort((a,b) => (a.name.toLocaleLowerCase().localeCompare(b.name.toLocaleLowerCase())))
      let dirs = files.filter(f => f.stat?.isDirectory)
      files = dirs.concat(files.filter(f => ! f.stat?.isDirectory))

      this.files.data = 
        files.map(r => {
          return {
            name: r.name,
            path: r.path,
            isFile: r.stat?.isFile,
            icon: r.stat?.isDirectory ? 'folder' : 'description',
            link: r.stat?.isDirectory ? '/explorer/' + window.encodeURIComponent(r.path) : undefined,
            size: formatSize(r.stat?.size), 
            lastChanged: toDate(r.stat?.mtime)
          }
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
    if (bytes > 1000000) return Math.floor(bytes / 1000000) + ' MB'
    if (bytes > 1000) return Math.floor(bytes / 1000) + ' KB'
    return bytes + ' B'
  } else {
    return ''
  }
}
