import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ContactsDialogComponent } from '../contacts-dialog/contacts-dialog.component';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  constructor(private dialog: MatDialog) { }

  ngOnInit(): void {
  }

  onAddressBook(){
    this.dialog.open(ContactsDialogComponent, {width: '80%', maxWidth: '32em'})
  }
}
