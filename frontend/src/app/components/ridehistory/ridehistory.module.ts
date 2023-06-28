import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { RidehistoryComponent } from './ridehistory.component';
const routes: Routes = [
  {
    path:'',
    component: RidehistoryComponent
  }
]
@NgModule({
  declarations: [],
  imports: [
    CommonModule,RouterModule.forChild(routes)
  ],
  exports:[RouterModule]

})

export class RidehistoryModule { }
