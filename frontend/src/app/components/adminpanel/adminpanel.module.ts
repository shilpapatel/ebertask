import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminpanelComponent } from './adminpanel.component';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/auth/auth.guard';
const routes: Routes = [
  {
    path:'',canActivate: [AuthGuard], canActivateChild: [AuthGuard],
     component: AdminpanelComponent,
    children:[
      {
        path: 'dashboard',
        loadChildren: () => import('../dashboard/dashboard.module').then(m => m.DashboardModule)
      },
      {
        path: 'city',
        loadChildren: () => import('../city/city.module').then(m => m.CityModule)
      },
      {
        path: 'confirmrides',
        loadChildren: () => import('../confirmrides/confirmrides.module').then(m => m.ConfirmridesModule)
      },
      {
        path: 'country',
        loadChildren: () => import('../country/country.module').then(m => m.CountryModule)
      },
      {
        path: 'createride',
        loadChildren: () => import('../createride/createride.module').then(m => m. CreaterideModule)
      },
      {
        path: 'list',
        loadChildren: () => import('../list/list.module').then(m => m.ListModule)
      },
      {
        path: 'ridehistory',
        loadChildren: () => import('../ridehistory/ridehistory.module').then(m => m. RidehistoryModule)
      },
      {
        path: 'runningrequest',
        loadChildren: () => import('../runningrequest/runningrequest.module').then(m => m. RunningrequestModule)
      },
      {
        path: 'settings',
        loadChildren: () => import('../settings/settings.module').then(m => m.SettingsModule)
      },
      {
        path: 'users',
        loadChildren: () => import('../users/users.module').then(m => m. UsersModule)
      },
      {
        path: 'vehiclepricing',
        loadChildren: () => import('../vehiclepricing/vehiclepricing.module').then(m => m. VehiclepricingModule)
      },
      {
        path: 'vehicletype',
        loadChildren: () => import('../vehicletype/vehicletype.module').then(m => m.VehicletypeModule)
      }
    ]
  }
]
@NgModule({
  declarations: [],
  imports: [
    CommonModule,RouterModule.forChild(routes)
  ],
  exports:[RouterModule]

})
export class AdminpanelModule { }
