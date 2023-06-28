import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ListComponent } from './list.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
const routes: Routes = [
  {
    path:'',
    component: ListComponent
  }
]
@NgModule({
  declarations: [],
  imports: [
    CommonModule,RouterModule.forChild(routes),
    MatButtonModule,
    MatIconModule,
    MatMenuModule
  ],
  exports:[RouterModule]

})

export class ListModule { }
