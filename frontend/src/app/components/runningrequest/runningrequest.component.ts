import { Component } from '@angular/core';
import { SocketService } from 'src/app/shared/socket.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CreaterideService } from 'src/app/shared/createride.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-runningrequest',
  templateUrl: './runningrequest.component.html',
  styleUrls: ['./runningrequest.component.css']
})
export class RunningrequestComponent {
  createridedata: any[] = [];
  feedbackForm: FormGroup;
  selectedcreateride: any;

  currentPage: number = 1;
  totalPages: number = 0;
  pageSize: number = 3;
  searchQuery: string = '';
  sortOrder: string = 'asc'; 
  sortField: string = 'assigned';
  
  constructor(private socketService: SocketService,private formBuilder: FormBuilder,private createrideService: CreaterideService,private toastr: ToastrService,) { 
    this.feedbackForm = this.formBuilder.group({
      name: [''],
      email: [''],
      feedback:['']
    })

  }
  ngOnInit(): void {
    this.getDriverRideData()
     this.subscribeToListenDriverRideUpdate()
  }

 

getDriverRideData(): void {
    this.socketService.getDriverRideRunningData().subscribe(
      (driverridedata: any) => {
        this.createridedata = driverridedata;
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
        const index = this.createridedata.findIndex(d => d._id === updatedDriverRide._id);       
        if (index !== -1) {
          this.createridedata[index].driverId = updatedDriverRide.driverId;
          this.createridedata[index].assigned = updatedDriverRide.assigned;
           console.log(this.createridedata);
        }
        this.getDriverRideData()
    });
  }

  onAcceptRequest(driverrideId: string,driverId:string){
    this.socketService.acceptDriverRide(driverrideId,driverId); 
  }

  onArriveRequest(driverrideId: string,driverId:string) {
    this.socketService.arriveDriverRide(driverrideId,driverId);
  }
  
  onStartRequest(driverrideId: string,driverId:string) {
    this.socketService.startDriverRide(driverrideId,driverId);
  }
  
  onCompleteRequest(createride:any) {
    this.selectedcreateride = createride
    this.feedbackForm.patchValue({
      name: this.selectedcreateride.userdata.name,
      email: this.selectedcreateride.userdata.email,
    });
    this.socketService.completeDriverRide(this.selectedcreateride);
  }

  onSubmit(ride:any) {
    const feedbackData = {
      feedback:this.feedbackForm.value.feedback,
      rideId:ride._id
    }
    console.log(feedbackData);
    

    this.createrideService.updateRideFeedbackData(feedbackData).subscribe(
      (res) => {
        console.log(res);
        
    });
    const modalElement = document.getElementById('exampleModal');
    if (modalElement) {
      modalElement.classList.remove('show');
      modalElement.style.display = 'none';
      modalElement.setAttribute('aria-hidden', 'true');
      modalElement.removeAttribute('aria-modal');
      document.body.classList.remove('modal-open');
      const modalBackdrop = document.getElementsByClassName('modal-backdrop')[0];
      if (modalBackdrop) {
        modalBackdrop.parentNode?.removeChild(modalBackdrop);
      }
    }
    this.feedbackForm.reset();

  }
  onCancelBtn() {
    this.feedbackForm.reset();
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