import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AdminService } from 'src/app/shared/admin.service';
import { Router } from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild {

  constructor(private adminService: AdminService, private router: Router) { }
  
  canActivate(): boolean {
    if (this.adminService.isLoggedIn()) {
      return true;
    }else{
      this.router.navigateByUrl('/signin');
      this.adminService.deleteToken();
      console.log("hellooo");
      return false;
    }
    
    
  }

  canActivateChild(): boolean {
    if (this.adminService.isLoggedIn()) {
      return true;
    }else{
      this.router.navigateByUrl('/signin');
      this.adminService.deleteToken();
      console.log("hellooo");
      return false;
    }}
  //   if (!this.adminService.isLoggedIn()) {
  //     this.router.navigateByUrl('/signin');
  //     this.adminService.deleteToken();
  //     return false;
  //   }
  //   return true;
  // }


}
