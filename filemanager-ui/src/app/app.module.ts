import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatCardModule } from '@angular/material/card'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatTableModule}  from '@angular/material/table'
import { MatIconModule } from '@angular/material/icon'
import { MatMenuModule } from '@angular/material/menu'
import { MatButtonModule } from '@angular/material/button'
import { MatDividerModule } from '@angular/material/divider'
import { MatGridListModule } from '@angular/material/grid-list'
import { MatDialogModule } from '@angular/material/dialog'
import { MatInputModule } from '@angular/material/input'
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatListModule} from '@angular/material/list';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import {MatExpansionModule} from '@angular/material/expansion'; 

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AddressBarComponent } from './address-bar/address-bar.component';
import { FileListComponent } from './file-list/file-list.component';
import { ExplorerComponent } from './explorer/explorer.component';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { ShareDialogComponent } from './share-dialog/share-dialog.component';
import { ProfileDialogComponent } from './profile-dialog/profile-dialog.component';
import { ProfileImageComponent } from './profile-image/profile-image.component';
import { ContactsDialogComponent } from './contacts-dialog/contacts-dialog.component';
import { FriendStateComponent } from './friend-state/friend-state.component';

@NgModule({
  declarations: [
    AppComponent,
    AddressBarComponent,
    FileListComponent,
    ExplorerComponent,
    ToolbarComponent,
    ShareDialogComponent,
    ProfileDialogComponent,
    ProfileImageComponent,
    ContactsDialogComponent,
    FriendStateComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatToolbarModule,
    MatTableModule,
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
    MatDividerModule,
    MatGridListModule,
    MatDialogModule,
    MatInputModule,
    MatSnackBarModule,
    MatListModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
