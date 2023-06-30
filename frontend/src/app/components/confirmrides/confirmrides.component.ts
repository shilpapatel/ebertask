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
  currentPage: number = 1;
  totalPages: number = 0;
  pageSize: number = 3;
  searchQuery: string = '';
  sortOrder: string = 'asc';
  sortField: string = 'name';
  activeDrivers: any[] = [];
  selectedcreateride: any;

  constructor(private http: HttpClient, private formBuilder: FormBuilder, public router: Router, private toastr: ToastrService,
    private createrideService: CreaterideService, public usersservice: UsersService,
    public listService: ListService, private socketService: SocketService) { }

  ngOnInit(): void {
    this.subscribeToListenDriverUpdate()
    this.getDriversAllData()
    this.getDriverRideData()
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

  getDriverRideData(): void {
    this.socketService.getDriverRideData().subscribe(
      (driverridedata: any) => {
        this.createridedata = driverridedata;
        //  console.log(this.createridedata,"driverridedata");  
      },
      (error: any) => {
        console.error(error);
      }
    );

  }
  subscribeToListenDriverUpdate() {
    this.socketService.subscribeToListenDriverUpdate().subscribe(updatedDriver => {
      // console.log(updatedDriver);

      const index = this.driverdata.findIndex(d => d._id === updatedDriver._id);
      if (index !== -1) {
        this.driverdata[index].status = updatedDriver.status;
        // console.log(this.driverdata);
        this.onAssignBtnClick(this.selectedRide)
      }
      this.toastr.success('Driver Status Updated');
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
  onAssignBtnClick(createride: any) {
    this.selectedcreateride = createride;
    console.log(this.selectedcreateride);
    this.assignedDriverName = 'Assign Driver';
    this.selectedcreateride.assigned = "assigning";
    this.selectedcreateride.created = Date.now()
    // console.log(this.selectedcreateride.created);
    

    if (this.selectedcreateride) {
      const selectedCityId = this.selectedcreateride.cityId;
      const selectedVehicleTypeId = this.selectedcreateride.vehicleTypeId;
      const filteredDrivers = this.driverdata.filter(driver => {
        return driver.city_id === selectedCityId && driver.vehicletype_id === selectedVehicleTypeId;
      });
      this.driverdatafiltered = filteredDrivers.filter(driver => driver.status === 'Approved');
      console.log(this.driverdatafiltered, "driverfiltereddata");
    }
  }

  onAssignDriver(driver: any) {
    this.selectedDriver = driver;
    this.socketService.updateDriverRide(this.selectedcreateride._id, this.selectedDriver._id,this.selectedcreateride.assigned,this.selectedcreateride.created);
    
    // this.assignedDriverName = this.selectedDriver.name;
    // console.log(this.assignedDriverName);
    // console.log(this.selectedDriver,"selecteddriver");
    // console.log(this.selectedDriver._id,"selecteddriverid");
    // console.log(this.selectedcreateride,"selectedride");
    // console.log(this.selectedcreateride._id,"selectedrideid");
    // this.selectedcreateride.assigned = "assigning";
    // (this.selectedcreateride.assigned === "assigning")
    // }
}

 onAssignNearestDriver() {
  if (this.driverdatafiltered.length > 0) {
    let index = 0;
    const driverCount = this.driverdatafiltered.length;

    const processNextDriver = () => {
      if (index < driverCount) {
        const driver = this.driverdatafiltered[index];
        this.selectedDriver = driver;

        this.socketService.updateDriverRide(
          this.selectedcreateride._id,
          this.selectedDriver._id,
          this.selectedcreateride.assigned,
          this.selectedcreateride.created
        );

        index++;
        setTimeout(processNextDriver, 20000); // Delay in milliseconds (e.g., 1000 for 1 second)
      }
    };

    processNextDriver();
  }

  //   if (this.driverdatafiltered.length > 0) {

  //     for (const driver of this.driverdatafiltered) {
  //       this.selectedDriver = driver;

  //   console.log(this.assignedDriverName);
  //   console.log(this.selectedDriver,"selecteddriver");
  //   console.log(this.selectedDriver._id,"selecteddriverid");
  //   console.log(this.selectedcreateride,"selectedride");
  //   console.log(this.selectedcreateride._id,"selectedrideid");
  //   // this.selectedcreateride.assigned = "assigning";
  //   // (this.selectedcreateride.assigned === "assigning")
  //   this.socketService.updateDriverRide(this.selectedcreateride._id, this.selectedDriver._id,this.selectedcreateride.assigned,this.selectedcreateride.created);
  //   // }
  // }  
  //     }
   
   }
}





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

