import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatCardModule } from '@angular/material/card'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatTableModule}  from '@angular/material/table'
import { MatIconModule } from '@angular/material/icon'
import { MatMenuModule } from '@angular/material/menu'
import { MatButtonModule } from '@angular/material/button'
import { MatDividerModule } from '@angular/material/divider'
import { MatGridListModule } from '@angular/material/grid-list'
import { MatDialogModule } from '@angular/material/dialog'

import { AddressBarComponent } from './address-bar/address-bar.component';
import { FileListComponent } from './file-list/file-list.component';
import { ExplorerComponent } from './explorer/explorer.component';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { ShareDialogComponent } from './share-dialog/share-dialog.component';
import { ProfileDialogComponent } from './profile-dialog/profile-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    AddressBarComponent,
    FileListComponent,
    ExplorerComponent,
    ToolbarComponent,
    ShareDialogComponent,
    ProfileDialogComponent
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
    MatDialogModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
