import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { ExplorerComponent } from './explorer/explorer.component';

const routes: Routes = [
  {path: 'explorer/:path', component: ExplorerComponent},
  {path: '**', redirectTo: 'explorer/%2f'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
