import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin/admin.component';
import { SignUpComponent } from './admin/sign-up/sign-up.component';
import { SignInComponent } from './admin/sign-in/sign-in.component';
import { AuthGuard } from './auth/auth.guard';

const routes: Routes = [

  { path: 'signup', component: AdminComponent, children: [{ path: '', component: SignUpComponent }] },
  { path: 'signin', component: AdminComponent, children: [{ path: '', component: SignInComponent }] },
  {
    path: 'adminpanel',canActivate: [AuthGuard], canActivateChild: [AuthGuard],
    loadChildren: () => import('./components/adminpanel/adminpanel.module').then(m => m.AdminpanelModule)
  },
  { path: '', redirectTo: '/signin', pathMatch: 'full' },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

// import { AdminpanelComponent } from './components/adminpanel/adminpanel.component';
// import { VehicletypeComponent } from './components/vehicletype/vehicletype.component';
// import { CountryComponent } from './components/country/country.component';
// import { UsersComponent } from './components/users/users.component';
// import { CreaterideComponent } from './components/createride/createride.component';
// import { ConfirmridesComponent } from './components/confirmrides/confirmrides.component';
// import { RidehistoryComponent } from './components/ridehistory/ridehistory.component';
// import { ListComponent } from './components/list/list.component';
// import { RunningrequestComponent } from './components/runningrequest/runningrequest.component';
// import { CityComponent } from './components/city/city.component';
// import { VehiclepricingComponent } from './components/vehiclepricing/vehiclepricing.component';
// import { SettingsComponent } from './components/settings/settings.component';

// const routes: Routes = [

//   { path: 'signup', component: AdminComponent, children: [{ path: '', component: SignUpComponent }] },
//   { path: 'signin', component: AdminComponent, children: [{ path: '', component: SignInComponent }] },
//   {
//     path: 'adminpanel', component: AdminpanelComponent, canActivate: [AuthGuard], canActivateChild: [AuthGuard],
//     children: [
//       { path: 'createride', component: CreaterideComponent },
//       { path: 'confirmrides', component: ConfirmridesComponent },
//       { path: 'ridehistory', component: RidehistoryComponent },
//       { path: 'users', component: UsersComponent },
//       { path: 'list', component: ListComponent },
//       { path: 'runningrequest', component: RunningrequestComponent },
//       { path: 'country', component: CountryComponent },
//       { path: 'city', component: CityComponent },
//       { path: 'vehicletype', component: VehicletypeComponent },
//       { path: 'vehiclepricing', component: VehiclepricingComponent },
//       { path: 'settings', component: SettingsComponent },


//     ]
//   },
//   { path: '', redirectTo: '/signin', pathMatch: 'full' },

// ];