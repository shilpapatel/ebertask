import { Component } from '@angular/core';
import { SocketService } from 'src/app/shared/socket.service';

@Component({
  selector: 'app-runningrequest',
  templateUrl: './runningrequest.component.html',
  styleUrls: ['./runningrequest.component.css']
})
export class RunningrequestComponent {
  createridedata: any[] = [];

  currentPage: number = 1;
  totalPages: number = 0;
  pageSize: number = 3;
  searchQuery: string = '';
  sortOrder: string = 'asc'; 
  sortField: string = 'assigned';
  
  constructor(private socketService: SocketService) { }
  ngOnInit(): void {
    this.getDriverRideData()
     this.subscribeToListenDriverRideUpdate()
  }
getDriverRideData(): void {
    this.socketService.getDriverRideRunningData().subscribe(
      (driverridedata: any) => {
        this.createridedata = driverridedata;
        // this.createridedata =driverridedata.filter(createride => createride.assigned === 'assigning');
         console.log(this.createridedata,"driverridedata");  
      },
      (error: any) => {
        console.error(error);
      }
    );
  }

// getDriverRideData(): void {
//   this.socketService.getDriverRideData(this.currentPage, this.pageSize, this.searchQuery,this.sortField,this.sortOrder).subscribe(
//     (data: any) => {
//       this.createridedata = data.driverridedata.filter(createride => createride.assigned === 'assigning');;
//       this.totalPages = data.totalPages;
//     },
//     (error: any) => {
//       console.error(error);
//     }
//   );
// }
  subscribeToListenDriverRideUpdate() {
    this.socketService.subscribeToListenDriverRideUpdate().subscribe(updatedDriverRide => {
      console.log(updatedDriverRide);
        const index = this.createridedata.findIndex(d => d._id === updatedDriverRide._id);
        console.log(index);
        
        if (index !== -1) {
          // this.createridedata= updatedDriverRide
          this.createridedata[index].driverId = updatedDriverRide.driverId;
          this.createridedata[index].assigned = updatedDriverRide.assigned;
           console.log(this.createridedata);
          //  this.getDriverRideData()
          // this.onAssignBtnClick(this.selectedRide)
        }
        this.getDriverRideData()
      // this.toastr.success('Driver Ride Updated');
    });
  }

  onAcceptRequest(driverrideId: string){
    // console.log(driverrideId);
    this.socketService.acceptDriverRide(driverrideId); 
  }

  onArriveRequest(driverrideId: string) {
    this.socketService.arriveDriverRide(driverrideId);
  }
  
  onStartRequest(driverrideId: string) {
    this.socketService.startDriverRide(driverrideId);
  }
  
  onCompleteRequest(driverrideId: string) {
    this.socketService.completeDriverRide(driverrideId);
  }

   onDeleteDriver(driverrideId: string) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.socketService.deleteDriverRide(driverrideId).subscribe(
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

  // subscribeToUpdateDriverRideData(): void {
  //   this.socketService.getUpdatedDriverRideData().subscribe(
  //     (driverridedata: any) => {
  //       this.driverridedata = driverridedata;
  //       console.log(this.driverridedata, "Updated driverridedata");
  //     },
  //     (error: any) => {
  //       console.error(error);
  //     }
  //   );


    // this.socketService.getTimeoutDriverRideData().subscribe((timeoutId: string) => {
    //   console.log(timeoutId);
    //   this.driverridedata = this.driverridedata.filter(
    //     (driverride: any) => driverride._id !== timeoutId
    //   );
    //   // this.getDriverRideData()
    // });
  // }


  // subscribeToAssignedDriverNameUpdate(): void {
  //   this.socketService.getAssignedDriverNameUpdate().subscribe(
  //     (data: any) => {
  //       const rideId = data.rideId;
  //       const driverName = data.driverName;

  //       const ride = this.driverridedata.find(ride => ride._id === rideId);
  //       if (ride) {
  //         ride.assignedDriverName = driverName;
  //       }
  //     },
  //     (error: any) => {
  //       console.error(error);
  //     }
  //   );
  // }


  // onDeleteDriver(driverrideId: string) {
  //   if (confirm('Are you sure you want to delete this user?')) {
  //     this.socketService.deleteDriverRide(driverrideId).subscribe(
  //       response => {
          
  //         // this.getDriverRideData();
  //       },
  //       error => {
  //         console.log(error);
  //       }
  //     );
  //    }
  // }