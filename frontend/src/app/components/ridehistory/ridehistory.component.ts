import { Component } from '@angular/core';
import { SocketService } from 'src/app/shared/socket.service';

@Component({
  selector: 'app-ridehistory',
  templateUrl: './ridehistory.component.html',
  styleUrls: ['./ridehistory.component.css']
})
export class RidehistoryComponent {
  createridedata: any[] = [];
  selectedcreateride: any;
  constructor(private socketService: SocketService) { }
  ngOnInit(): void {
    this.getDriverRideData()
     this.subscribeToListenDriverRideUpdate()
  }
getDriverRideData(): void {
    this.socketService.getDriverRideData().subscribe(
      (driverridedata: any) => {
        // this.createridedata = driverridedata;
        this.createridedata =driverridedata.filter(createride => createride.assigned === 'Accepted');
        //  console.log(this.createridedata,"driverridedata");  
      },
      (error: any) => {
        console.error(error);
      }
    );
  }
  subscribeToListenDriverRideUpdate() {
    this.socketService.subscribeToListenDriverRideUpdate().subscribe(updatedDriverRide => {
      console.log(updatedDriverRide);
        const index = this.createridedata.findIndex(d => d._id === updatedDriverRide._id);
        if (index !== -1) {
          this.createridedata= updatedDriverRide
          // this.createridedata[index].driverId = updatedDriverRide.driverId;
          this.createridedata[index].assigned = updatedDriverRide.assigned;
          //  console.log(this.createridedata);
           this.getDriverRideData()
          // this.onAssignBtnClick(this.selectedRide)
        }

      // this.toastr.success('Driver Ride Updated');
    });
  }


  onselectedride(createridedata:any){
    this.selectedcreateride = createridedata
    // console.log(this.selectedridedata,"selected");
    
  }

}
