import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService } from 'src/app/shared/admin.service';

@Component({
  selector: 'app-adminpanel',
  templateUrl: './adminpanel.component.html',
  styleUrls: ['./adminpanel.component.css']
})
export class AdminpanelComponent implements OnInit {
  userDetails;
  openSidebar: boolean = true;

 menuSidebar = [
   // {
   //   link_name: "Dashboard",
   //   link: "/dashboard",
   //   icon: "bx bx-grid-alt",
   //   sub_menu: []
   // }, 
   {
     link_name: "Rides",
     link: null,
     icon: "fa-solid fa-car-side",
     sub_menu: [
       {
         link_name: "Create Ride",
         link: "createride",
       }, {
         link_name: "Confirmed Rides",
         link: "confirmrides",
       }, {
         link_name: "Ride History",
         link: "ridehistory",
       }
     ]
   }, {
     link_name: "Users",
     link: "users",
     icon: "fa-solid fa-user",
     sub_menu: []
   }, {
     link_name: "Drivers",
     link: null,
     icon: "fa-solid fa-id-card",
     sub_menu: [
       {
         link_name: "List",
         link: "list",
       }, {
         link_name: "Running Request",
         link: "runningrequest",
       }
     ]
   }, {
     link_name: "Pricing",
     link: null,
     icon: "fa-solid fa-money-check-dollar",
     sub_menu: [
       {
         link_name: "Country",
         link: "country",
       }, {
         link_name: "City",
         link: "city",
       }, {
         link_name: "Vehicle Type",
         link: "vehicletype",
       }, {
         link_name: "Vehicle Pricing",
         link: "vehiclepricing",
       }
     ]
   },{
     link_name: "Settings",
     link: "settings",
     icon: "fa-solid fa-gear",
     sub_menu: []
   }
 ]
  constructor(private adminService: AdminService, private router: Router) { }
 
 ngOnInit() {
 }

 onLogout(){
   this.adminService.deleteToken();
   this.router.navigate(['/signin']);
 }

 showSubmenu(itemEl: HTMLElement) {
   itemEl.classList.toggle("showMenu");
 }

}
