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
  lastActivity: Date;
  logoutTimer: any;

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
   // Attach event listeners for user activity
   document.addEventListener('mousemove', this.resetTimer);
   document.addEventListener('keypress', this.resetTimer);
 
   // Initialize lastActivity with current timestamp
   this.lastActivity = new Date();
 
   // Start the timer for automatic logout
   this.startLogoutTimer();
 }
 resetTimer = () => {
  // Update lastActivity with current timestamp
  this.lastActivity = new Date();
};

startLogoutTimer() {
  // const timeout = 30000;
  const timeout = 60000 * 60;

  // Start the timer
  this.logoutTimer = setTimeout(() => {
    // Calculate the time since the last activity
    const currentTime = new Date();
    const timeDiff = currentTime.getTime() - this.lastActivity.getTime();

    if (timeDiff >= timeout) {
      this.onLogout();
    } else {
      // Restart the timer
      this.startLogoutTimer();
    }
  }, timeout);
}
 onLogout(){
  clearTimeout(this.logoutTimer);
   this.adminService.deleteToken();
   this.router.navigate(['/signin']);
 }

 showSubmenu(itemEl: HTMLElement) {
   itemEl.classList.toggle("showMenu");
 }

}

// // Import the browser-specific notification types
// declare var Notification: any;
// export class DashboardComponent implements OnInit {

//   ngOnInit() {
//     // Check if driver is not found
//     if (!driverFound) {
//       this.showNotification('Driver Not Found', 'Please check again later.');
//     }
//   }

//   showNotification(title: string, message: string) {
//     // Check if the browser supports notifications
//     if (!('Notification' in window)) {
//       console.log('This browser does not support system notifications.');
//       return;
//     }

//     // Request permission to display notifications
//     Notification.requestPermission().then((permission) => {
//       if (permission === 'granted') {
//         // Create a new notification
//         new Notification(title, { body: message });
//       } else {
//         console.log('Notification permission denied.');
//       }
//     });
//   }


//  // Function to handle push notification received
//  handlePushNotification() {
//   // Increment the notification count
//   this.notificationCount++;
//   // Play a sound using the Web Audio API
//   this.playSoundNotification();
// }

// // Function to handle driver found and decrease notification count
// handleDriverFound() {
//   // Decrement the notification count
//   this.notificationCount--;
// }

// // Function to play a sound notification
// playSoundNotification() {
//   // Use the Web Audio API to play a sound
//   // Implementation depends on your specific requirements
// }