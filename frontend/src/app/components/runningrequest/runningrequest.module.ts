import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { RunningrequestComponent } from './runningrequest.component';
const routes: Routes = [
  {
    path:'',
    component: RunningrequestComponent
  }
]
@NgModule({
  declarations: [],
  imports: [
    CommonModule,RouterModule.forChild(routes)
  ],
  exports:[RouterModule]

})

export class RunningrequestModule { }
