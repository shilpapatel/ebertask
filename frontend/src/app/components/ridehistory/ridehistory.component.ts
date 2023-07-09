import { Component } from '@angular/core';
import { CsvExportService } from 'src/app/shared/csv-export.service';
import { SocketService } from 'src/app/shared/socket.service';

@Component({
  selector: 'app-ridehistory',
  templateUrl: './ridehistory.component.html',
  styleUrls: ['./ridehistory.component.css']
})
export class RidehistoryComponent {
  createridedata: any[] = [];
  selectedcreateride: any;

  currentPage: number = 1;
  totalPages: number = 0;
  pageSize: number = 3;
  searchQuery: string
  sortOrder: string = 'asc'; 
  sortField: string = 'assigned';

  constructor(private socketService: SocketService, private csvExportService: CsvExportService) { }
  ngOnInit(): void {
    this.getDriverRideData()
     this.subscribeToListenDriverRideUpdate()
  }

  downloadDataAsCsv(): void {
     this.csvExportService.exportToCsv(this.createridedata, 'ridehistory.csv');
  }

getDriverRideData(): void {
    this.socketService.getDriverRideData().subscribe(
      (driverridedata: any) => {
        console.log(driverridedata);
        
        // this.createridedata = driverridedata;
        this.createridedata =driverridedata.filter(createride => createride.assigned === 'cancelled');
        //  console.log(this.createridedata,"driverridedata");  
      },
      (error: any) => {
        console.error(error);
      }
    );
  }

  // getDriverRideData(): void {
  //   this.socketService.getDriverRideHistoryData(this.currentPage, this.pageSize, this.searchQuery,this.sortField,this.sortOrder).subscribe(
  //     (data: any) => {
  //       this.createridedata = data.driverridedata.filter(createride => createride.assigned === 'cancelled');;
  //       this.totalPages = data.totalPages;
  //     },
  //     (error: any) => {
  //       console.error(error);
  //     }
  //   );
  // }

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
