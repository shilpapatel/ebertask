import { HttpClient } from '@angular/common/http';
import { Socket, io } from 'socket.io-client';
import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CreaterideService } from 'src/app/shared/createride.service';
import { ListService } from 'src/app/shared/list.service';
import { UsersService } from 'src/app/shared/users.service';
import { SocketService } from 'src/app/shared/socket.service';
import { NotificationService } from 'src/app/shared/notification.service';
import { VehicletypeService } from 'src/app/shared/vehicletype.service';

@Component({
  selector: 'app-confirmrides',
  templateUrl: './confirmrides.component.html',
  styleUrls: ['./confirmrides.component.css']
})
export class ConfirmridesComponent {
  createdriverridedata: any;
  createridedata: any[] = [];
  showModal: boolean = false;
  private socket: Socket;
  // assignedDriverName: string;
  assignedDriverName: string = 'Assign Driver';
  selectedUserId: string | undefined;
  selectedUserData: any | undefined;
  filteredRides:any
  driverdata: any[] = [];
  driverdatafiltered: any[] = [];
  selectedRide: any;
  selectedDriver: any;

  userdatas: any[] = [];
  // currentPage: number = 1;
  // totalPages: number = 0;
  // pageSize: number = 3;
  // searchQuery: string = '';
  // sortOrder: string = 'asc';
  // sortField: string = 'name';
  activeDrivers: any[] = [];
  selectedcreateride: any;

  currentPage: number = 1;
  totalPages: number = 0;
  pageSize: number = 5;
  searchQuery: string
  sortOrder: string = 'asc'; 
  sortField: string = 'datetime';
  // filterField: string = 'from';
  // paymentFilter: string = '';
  statusFilter:string='';
  vehicleTypeFilter: string = '';
  startDateFilter: string = '';
  endDateFilter: string = '';
  fromFilter:string = '';
  toFilter:string = '';
  vehicles: any[] = [];
  assignedDriverData: any[] = [];
  

  constructor(private http: HttpClient, private formBuilder: FormBuilder, public router: Router, private toastr: ToastrService,
    private createrideService: CreaterideService, public usersservice: UsersService,
    public listService: ListService, private socketService: SocketService, private notificationService: NotificationService,private vehicletypeService: VehicletypeService) { }

  ngOnInit(): void {
    this.getVehicleType()
    this.getDriversAllData()
    this.getDriverRideData()
    this.subscribeToListenDriverRideUpdate()
    this.subscribeToListenDriverStatusUpdate()
    this.subscribeToListenDriverTypeUpdate()
    this.subscribeToListenDriverUpdate()
    this.subscribeToListenAssignDriverData()
    // this.onAssignBtnClick(this.selectedRide)
    // this.subscribeToListenDriverRideUpdate()

    // this.socketService.getTimeoutDriverRideData().subscribe((timeoutResult: any) => {
    //   console.log(timeoutResult);
      // console.log(this.createdriverridedata._id !== timeoutId);
      // if (this.createdriverridedata._id !== timeoutId) {
      //   // this.createdriverridedata._id && 
      //   this.assignedDriverName = 'Assign Driver';
      // }
    // });

  }

  getVehicleType() {
    this.vehicletypeService.getVehicleType().subscribe((res) => {
      this.vehicles = res['vehicletype'];
    });
  }

  getDriverRideData(): void {
    this.socketService.getDriverRideData(this.currentPage, this.pageSize, this.searchQuery,this.sortField,this.sortOrder,this.statusFilter, this.vehicleTypeFilter, this.fromFilter, this.toFilter,this.startDateFilter,
      this.endDateFilter).subscribe(
      (data: any) => {
        console.log(data);
        
        console.log(data.driverridedata);
        this.createridedata = data.driverridedata;
        // this.createridedata = data.driverridedata.filter(createride => createride.assigned === 'cancelled');
        this.totalPages = data.totalPages;
        this.currentPage = data.currentPage
      },
      (error: any) => {
        console.error(error);
      }
    );
  }
  applyFilter(): void {
    this.currentPage = 1; // Reset to the first page when applying filters
    this.getDriverRideData();
  }
  clearFilter(): void {
    this.statusFilter = '';
    this.vehicleTypeFilter = '';
    this.fromFilter = '';
    this.toFilter = '';
    this.startDateFilter = '';
    this.endDateFilter = '';
    this.currentPage = 1; // Reset to the first page when clearing filters
    this.getDriverRideData();
  }

  generatePageArray(): number[] {
    return Array(this.totalPages).fill(0).map((_, index) => index + 1);
  }

  onSearch() {
    console.log('Search query:', this.searchQuery);
    this.currentPage = 1; // Reset to the first page when searching
    this.getDriverRideData()
  }
  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
    this.getDriverRideData()
  }
  
  goToPage(page: number): void {
    this.currentPage = page;
    this.getDriverRideData()
  }
  // Function to go to the next page
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
    this.getDriverRideData()
  }

  onSort() {
    this.currentPage = 1; // Reset to the first page when sorting
    this.getDriverRideData()
  }
  clearSearch(): void {
    this.searchQuery = '';
    this.onSearch();
  }

  subscribeToListenDriverRideUpdate() {
    this.socketService.subscribeToListenDriverRideUpdate().subscribe(updatedDriverRide => {
        const index = this.createridedata.findIndex(d => d._id === updatedDriverRide._id);
        if (index !== -1) {
          // this.createridedata= updatedDriverRide
          this.createridedata[index].driverId = updatedDriverRide.driverId;
          this.createridedata[index].assigned = updatedDriverRide.assigned;
        }
        //  console.log(this.createridedata);
           this.getDriverRideData()
        // }
    });
  }

  subscribeToListenDriverUpdate() {
    this.socketService.subscribeToListenDriverUpdate().subscribe(updatedDriver => {
      // console.log(updatedDriver);

      const index = this.driverdata.findIndex(d => d._id === updatedDriver._id);
      if (index !== -1) {
        this.driverdata[index].assign = updatedDriver.assign;
        console.log(this.driverdata);
        this.onAssignBtnClick(this.selectedcreateride)
        //  this.getDriversAllData();
      }
      this.getDriversAllData();
      // this.toastr.success('Driver Status Updated');
    });
  }
  subscribeToListenDriverStatusUpdate() {
    this.socketService.subscribeToListenDriverStatusUpdate().subscribe(updatedDriver => {
      // console.log(updatedDriver);

      const index = this.driverdata.findIndex(d => d._id === updatedDriver._id);
      if (index !== -1) {
        this.driverdata[index].status = updatedDriver.status;
        this.driverdata[index].rideStatus = updatedDriver.rideStatus;
        console.log(this.driverdata);
        this.onAssignBtnClick(this.selectedcreateride)
        // this.getDriversAllData();
      }
      this.getDriversAllData();
      // this.toastr.success('Driver Status Updated');
    });
  }

  subscribeToListenDriverTypeUpdate(){
    this.socketService.subscribeToListenDriverTypeUpdate().subscribe(updatedDriverType => {
      console.log(updatedDriverType);
       const index = this.driverdata.findIndex(d => d._id === updatedDriverType._id);
       if (index !== -1) {
         this.driverdata[index].vehicletype_id= updatedDriverType.vehicletype_id;
         console.log(this.driverdata);
         this.onAssignBtnClick(this.selectedcreateride)
        //  this.toastr.success('Driver VehicleType Updated');
       }
       this.getDriversAllData();
     });
    }

  getDriversAllData(): void {
    this.socketService.getDriversWithoutPage().subscribe(
      (driversData: any) => {
        this.driverdata = driversData;
        // console.log(this.driverdata, "getDriversAllData");
      },
      (error: any) => {
        console.error(error);
      }
    );
  }

  onInfoClick(createride: any) {
    this.selectedcreateride = createride
    // console.log(this.selectedcreateride);
  }

  subscribeToListenAssignDriverData() {
    this.socketService.subscribeToListenAssignDriverData().subscribe(assigndriverdata => {
       console.log(assigndriverdata);
       this.assignedDriverData = assigndriverdata
       console.log(this.assignedDriverData.length);
       if (this.assignedDriverData.length == 0) {
        this.notificationService.incrementNotificationCount();  // Increment notification count
        this.showNotification('Driver Not Found'); // Show browser notification
        this.notifysent = true
      } else {
        this.notificationService.decrementNotificationCount();// Decrement notification count
      }
    });
  }

  notifysent:boolean = false;
  onAssignBtnClick(createride: any) {
    this.selectedcreateride = createride;
    console.log(this.selectedcreateride);
    const cityId = this.selectedcreateride.cityId
    const vehicleTypeId = this.selectedcreateride.vehicleTypeId

     this.socketService.emitridefordriverdata(cityId,vehicleTypeId);
    //  this.subscribeToListenAssignDriverData()
    // this.assignedDriverName = 'Assign Driver';
    // if (this.selectedcreateride) {
    //   const selectedCityId = this.selectedcreateride.cityId;
    //   const selectedVehicleTypeId = this.selectedcreateride.vehicleTypeId;
    //   const filteredDrivers = this.driverdata.filter(driver => {
    //     return driver.city_id === selectedCityId && driver.vehicletype_id === selectedVehicleTypeId;
    //   });
    //   console.log(filteredDrivers);
      
    //   this.driverdatafiltered = filteredDrivers.filter(driver => driver.status === 'Approved' && driver.assign === '0');
    //   console.log(this.driverdatafiltered, "driverfiltereddata");
    // if (this.selectedcreateride) {
      // console.log(this.assignedDriverData.length);
      
      // if (this.assignedDriverData.length == 0) {
      //   this.notificationService.incrementNotificationCount();  // Increment notification count
      //   this.showNotification('Driver Not Found'); // Show browser notification
      //   this.notifysent = true
      // } else {
      //   this.notificationService.decrementNotificationCount();// Decrement notification count
      // }
    // }  
  }

  showNotification(message: string) {
    if (Notification.permission === 'granted') {
      const notification = new Notification('Notification Title', { body: message });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          const notification = new Notification('Notification Title', { body: message });
        }
      });
    }
  }
  onAssignDriver(driver: any) {
    this.selectedDriver = driver;
    // this.selectedDriver.rideStatus = "Hold";
    // this.selectedcreateride.assigned = 1 ;
    // this.selectedcreateride.created = Date.now()
    this.socketService.updateDriverRide(this.selectedcreateride._id, this.selectedDriver._id);
}
 onAssignNearestDriver(selectedcreateride:any) {
  // console.log(this.driverdatafiltered);
  console.log(selectedcreateride);
  
  // this.selectedcreateride.assigned = 1;
  // this.selectedcreateride.created = Date.now()
  this.socketService.updateNearestDriverRide(this.selectedcreateride);
  // this.socketService.updateNearestDriverRide(this.selectedcreateride._id, this.driverdatafiltered,this.selectedcreateride.created);
  // this.subscribeToListenDriverRideUpdate() 
}

 onDeleteConfirmRide(createrideId:any){
  // const rideId = createrideId;
  // console.log(rideId);
  if (confirm('Are you sure you want to delete this user?')) {
    this.socketService.deleteConfirmRide(createrideId).subscribe(
      response => {
        
        this.getDriverRideData();
      },
      error => {
        console.log(error);
      }
    );
   }
  

 }
}



  // getDriverRideData(): void {
  //   this.socketService.getDriverRideData(this.currentPage, this.pageSize, this.searchQuery,this.sortField,this.sortOrder).subscribe(
  //     (data: any) => {
  //       this.createridedata = data.driverridedata.filter(createride => createride.assigned === 'pending' || createride.assigned === 'timeout' || createride.assigned === 'rejected' || createride.assigned === 'accepted');;
  //       this.totalPages = data.totalPages;
  //     },
  //     (error: any) => {
  //       console.error(error);
  //     }
  //   );
  // }


  // getUniqueVehicleTypes(createridedata: any[]): string[] {
  //   console.log(createridedata);
    
  //   const uniqueTypes = new Set<string>();
  //   for (const confirmride of createridedata) {
  //       uniqueTypes.add(confirmride.vehicleType);
  //       // console.log(confirmride.vehicleType);
        
  //   }
  //   return Array.from(uniqueTypes);
  // }
  // getDriverRideData(): void {
  //   this.socketService.getDriverRideData().subscribe(
  //     (driverridedata: any) => {
  //       this.createridedata = driverridedata;
  //       console.log(this.createridedata);
        
  //       //  console.log(this.createridedata,"driverridedata");  
  //     },
  //     (error: any) => {
  //       console.error(error);
  //     }
  //   );
  // }

 // if (this.driverdatafiltered.length === 0) {
    //   // Send a request to the backend to trigger the push notification
    //   this.http.post('/api/send-notification', { rideId: this.selectedcreateride.id }).subscribe(
    //     () => {
    //       console.log('Notification sent to admin');
    //     },
    //     error => {
    //       console.error('Error sending notification:', error);
    //     }
    //   );
    // }
    
  // if (this.driverdatafiltered.length > 0) {
  //   const driverCount = this.driverdatafiltered.length;

  //   for (let index = 0; index < driverCount; index++) {
  //     const driver = this.driverdatafiltered[index];
  //     this.selectedDriver = driver;
  //     this.selectedDriver.isAvailable = false;
  //     this.selectedcreateride.created = Date.now();

  //     await this.socketService.updateDriverRide(
  //       this.selectedcreateride._id,
  //       this.selectedDriver._id,
  //       this.selectedcreateride.assigned,
  //       this.selectedcreateride.created
  //     );

  //     // Delay in milliseconds (e.g., 20000 for 20 seconds)
  //     // await new Promise((resolve) => setTimeout(resolve, 20000));
  //   }
  // }

  // onAssignNearestDriver() {
    
  // if (this.driverdatafiltered.length > 0) {
  //   let index = 0;
  //   const driverCount = this.driverdatafiltered.length;

  //   const processNextDriver = () => {
  //     if (index < driverCount) {
  //       const driver = this.driverdatafiltered[index];
  //       this.selectedDriver = driver;
  //       this.selectedDriver.isAvailable = false;
  //       this.selectedcreateride.created = Date.now()


  //       this.socketService.updateDriverRide(
  //         this.selectedcreateride._id,
  //         this.selectedDriver._id,
  //         this.selectedcreateride.assigned,
  //         this.selectedcreateride.created
  //       );

  //       index++;
  //         setTimeout(processNextDriver, 20000); // Delay in milliseconds (e.g., 1000 for 1 second)
  //     }
  //   };
  //   processNextDriver();
  // }
  // }

  // getCreateRide() {
  //   this.createrideService.getCreateRide().subscribe((res) => {
  //     this.createridedata = res['createridedata'];
  //     console.log(this.createridedata);
  //   });
  // }
  
  // subscribeToListenDriverRideUpdate() {
  //   this.socketService.subscribeToListenDriverRideUpdate().subscribe(updatedDriverRide => {
  //     console.log(updatedDriverRide);

  //     const index = this.createridedata.findIndex(d => d._id === updatedDriverRide._id);
  //     if (index !== -1) {
  //       this.createridedata[index].driverId = updatedDriverRide.driverId;
  //       // console.log(this.driverdata);
  //       // this.onAssignBtnClick(this.selectedRide)
  //     }
  //     this.toastr.success('Driver Ride Updated');
  //   });
  // }
    // if (this.selectedDriver) {
    //   const selectedDriverCityId = this.selectedDriver.city_id;
    //   const selectedDriverVehicleTypeId = this.selectedDriver.vehicletype_id;

    //   this.filteredRides = this.createridedata.filter(createride => {
    //     return createride.cityId === selectedDriverCityId && createride.vehicleTypeId === selectedDriverVehicleTypeId;
    //   });
    //   console.log( this.filteredRides);
    //   console.log(this.filteredRides._id);
    // }

    

    // const combinedDriverRideData = {
    //   filteredRides: filteredRides,
    //   selectedDriver: this.selectedDriver,
    //   // driver_id:this.selectedDriver._id
    // };

    // this.socketService.updateAssignedDriverName(this.selectedRide._id, this.assignedDriverName);

    // this.socketService.addDriverRide(rideData ).subscribe(
    //   response => {
    //     this.createdriverridedata = response.driverrideCreated
    //     console.log(this.createdriverridedata._id, 'response');
    //   },
    //   error => {
    //     console.log(error);
    //   }
    // );
    // this.socketService.updateAssignedDriverName(this.createdriverridedata._id, this.assignedDriverName);

  // onAssignNearestDriver() {

  //   if (this.driverdatafiltered.length > 0) {
  //     const nearestDriver = this.driverdatafiltered[0];
  //     nearestDriver.assigned = true;
  //     console.log(nearestDriver);
  //     this.assignedDriverName = nearestDriver.name;
  //     const selectedDriverCityId = nearestDriver.cityId;
  //     const selectedDriverVehicleTypeId = nearestDriver.vehicleTypeId;

  //     const filteredRides = this.createridedata.filter(createride => {
  //       return createride.cityId === selectedDriverCityId && createride.vehicleTypeId === selectedDriverVehicleTypeId;
  //     });

  //     const combinedDriverRideData = {
  //       filteredRides: filteredRides,
  //       selectedDriver: nearestDriver
  //     };

  //     this.socketService.addDriverRide(combinedDriverRideData).subscribe(
  //       response => {
  //         console.log(response, 'response');
  //       },
  //       error => {
  //         console.log(error);
  //       }
  //     );
  //   }
  // }

// }





// subscribeToAssignedDriverNameUpdate(): void {
  //   this.socketService.getAssignedDriverNameUpdate().subscribe(
  //     (data: any) => {
  //       const rideId = data.rideId;
  //       const driverName = data.driverName;

  //       const ride = this.driverridedata.find((ride) => ride._id === rideId);
  //       if (ride) {
  //         ride.assignedDriverName = driverName;
  //       }
  //     },
  //     (error: any) => {
  //       console.error(error);
  //     }
  //   );
  // }

  // updateAssignedDriverName(): void {
  //   this.socketService.updateAssignedDriverName(
  //     this.selectedRide._id,
  //     this.assignedDriverName
  //   );
  // }

