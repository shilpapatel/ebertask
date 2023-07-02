import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule,HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AdminComponent } from './admin/admin.component';
import { SignInComponent } from './admin/sign-in/sign-in.component';
import { SignUpComponent } from './admin/sign-up/sign-up.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrModule } from 'ngx-toastr';
import { AdminService } from './shared/admin.service';
import { CityService } from './shared/city.service';
import { CountryService } from './shared/country.service';
import {UsersService} from './shared/users.service';
import {VehiclepricingService} from './shared/vehiclepricing.service';
import { AdminpanelComponent } from './components/adminpanel/adminpanel.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxSpinnerModule } from 'ngx-spinner';
import { DatePipe } from '@angular/common';

import { AuthGuard } from './auth/auth.guard';
import { AuthInterceptor } from './auth/auth.interceptor';
import { VehicletypeComponent } from './components/vehicletype/vehicletype.component';
import { CountryComponent } from './components/country/country.component';
import { UsersComponent } from './components/users/users.component';
import { CreaterideComponent } from './components/createride/createride.component';
import { ConfirmridesComponent } from './components/confirmrides/confirmrides.component';
import { RidehistoryComponent } from './components/ridehistory/ridehistory.component';
import { ListComponent } from './components/list/list.component';
import { RunningrequestComponent } from './components/runningrequest/runningrequest.component';
import { CityComponent } from './components/city/city.component';
import { VehiclepricingComponent } from './components/vehiclepricing/vehiclepricing.component';
import { SettingsComponent } from './components/settings/settings.component';
import { AdminpanelModule } from './components/adminpanel/adminpanel.module';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

@NgModule({
  declarations: [
    AppComponent,
    AdminComponent,
    SignInComponent,
    SignUpComponent,
    AdminpanelComponent,
    VehicletypeComponent,
    CountryComponent,
    UsersComponent,
    CreaterideComponent,
    ConfirmridesComponent,
    RidehistoryComponent,
    ListComponent,
    RunningrequestComponent,
    CityComponent,
    VehiclepricingComponent,
    SettingsComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    ToastrModule.forRoot(),
    NgxPaginationModule,AdminpanelModule,
    MatIconModule,
    MatMenuModule,
    NgxSpinnerModule
    
    
  ],
  providers: [{
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptor,
    multi: true
  },AuthGuard,AdminService,CityService,CountryService,UsersService,VehiclepricingService,DatePipe],
  bootstrap: [AppComponent]
})
export class AppModule { }
