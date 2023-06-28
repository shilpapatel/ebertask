import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { CreaterideComponent } from './createride.component';
const routes: Routes = [
  {
    path:'',
    component: CreaterideComponent
  }
]
@NgModule({
  declarations: [],
  imports: [
    CommonModule,RouterModule.forChild(routes)
  ],
  exports:[RouterModule]

})

export class CreaterideModule { }
