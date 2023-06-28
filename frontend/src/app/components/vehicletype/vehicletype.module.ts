import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { VehicletypeComponent } from './vehicletype.component';
const routes: Routes = [
  {
    path:'',
    component: VehicletypeComponent
  }
]
@NgModule({
  declarations: [],
  imports: [
    CommonModule,RouterModule.forChild(routes)
  ],
  exports:[RouterModule]

})

export class VehicletypeModule { }
