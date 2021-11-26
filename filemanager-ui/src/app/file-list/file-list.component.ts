import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core'
import { MatSort } from '@angular/material/sort'
import { MatTableDataSource } from '@angular/material/table'
import { MatDialog } from '@angular/material/dialog'
import { ActivatedRoute, Router } from '@angular/router'
import { DriveService } from '../drive.service'
import { ShareDialogComponent } from '../share-dialog/share-dialog.component'
import { Space } from '../../../../src/EventInterfaces'

export interface FileData {
  name: string, 
  isFile?: boolean, 
  link?: string,
  icon?: string,
  size: string, 
  lastChanged: string, 
  path: string,
  space?: Space
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

  constructor (private drive: DriveService, private route: ActivatedRoute, private dialog: MatDialog, private router: Router) {}

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

  async onShare(file: FileData) {
    this.dialog.open(ShareDialogComponent, {width: '32em', data: file})
  }

  async onDelete(file: FileData) {
    console.log('deleted: ' + await this.drive.unlink(file.path))
    this.drive.reload()
  }

  async getFiles(path: string) { 
    const dirStat = await this.drive.stat(path)
    if(dirStat.isFile) {
      const parts = path.split('/').filter(p => p.length > 0)
      parts.splice(parts.length-1, 1)
      path = window.encodeURIComponent(parts.join('/')) 
      console.warn('path is a file, cannot display as directory - move one up: ' + (path || '/'))
      this.router.navigateByUrl('/explorer/%2f' + path)
    }

    this.drive.readdir(path).subscribe(files => {
      files.sort((a,b) => (a.name.toLocaleLowerCase().localeCompare(b.name.toLocaleLowerCase())))
      let dirs = files.filter(f => f.stat?.isDirectory)
      files = dirs.concat(files.filter(f => ! f.stat?.isDirectory))

      this.files.data = 
        files.map(r => {
          let name = window.decodeURIComponent(r.name)
          if(name.length > 64) name = name.substr(0, 32) + '...'
          let icon = 'description'
          if(r.stat?.isDirectory) {
            if(r.space) {
              icon = 'folder_shared'
            } else {
              icon = 'folder'
            }
          }
          return {
            name: name,
            path: r.path,
            isFile: r.stat?.isFile,
            icon: icon,
            link: r.stat?.isDirectory ? '/explorer/' + window.encodeURIComponent(r.path) : undefined, // TODO: download link?
            size: formatSize(r.stat?.size), 
            lastChanged: toDate(r.stat?.mtime),
            space: r.space
          }
        })
    })
  }
}

function toDate(timestamp?: Date): string {
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
