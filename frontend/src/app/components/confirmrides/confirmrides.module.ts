import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ConfirmridesComponent } from './confirmrides.component';
const routes: Routes = [
  {
    path:'',
    component: ConfirmridesComponent
  }
]
@NgModule({
  declarations: [],
  imports: [
    CommonModule,RouterModule.forChild(routes)
  ],
  exports:[RouterModule]

})
export class ConfirmridesModule { }
