import { Component } from '@angular/core';
import { CreaterideService } from 'src/app/shared/createride.service';
import { CsvExportService } from 'src/app/shared/csv-export.service';
import { SocketService } from 'src/app/shared/socket.service';
import { VehicletypeService } from 'src/app/shared/vehicletype.service';
declare const google: any;

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
  searchQuery: string = '';
  sortOrder: string = 'asc'; 
  sortField: string = 'datetime';
  // filterField: string = 'from';
  paymentFilter: string = '';
  statusFilter:string= '';
  vehicleTypeFilter: string = '';
  startDateFilter: string = '';
  endDateFilter: string = '';
  fromFilter:string = '';
  toFilter:string = '';
  vehicles: any[] = [];
  

  constructor(private socketService: SocketService, private csvExportService: CsvExportService,private vehicletypeService: VehicletypeService,private createrideService:CreaterideService) { }
  ngOnInit(): void {
    this.getVehicleType()
    // this.getDriverRideData()
    this.getRideHistory()
     this.subscribeToListenDriverRideUpdate()
     this.initMap()
  }

  getVehicleType() {
    this.vehicletypeService.getVehicleType().subscribe((res) => {
      this.vehicles = res['vehicletype'];
    });
  }
  downloadDataAsCsv(): void {
     this.csvExportService.exportToCsv(this.createridedata, 'ridehistory.csv');
  }


// getUniqueVehicleTypes(createridedata: any[]): string[] {
//   console.log(createridedata);
  
//   const uniqueTypes = new Set<string>();
//   for (const confirmride of createridedata) {
//       uniqueTypes.add(confirmride.vehicleType);
//       // console.log(confirmride.vehicleType);
      
//   }
//   return Array.from(uniqueTypes);
// }
getRideHistory():void{
  this.createrideService.getRideHistory(this.currentPage, this.pageSize, this.searchQuery,this.sortField,this.sortOrder,this.paymentFilter,this.statusFilter, this.vehicleTypeFilter, this.fromFilter, this.toFilter,this.startDateFilter,
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
  
  // getDriverRideData(): void {
  //   this.socketService.getDriverRideHistoryData(this.currentPage, this.pageSize, this.searchQuery,this.sortField,this.sortOrder,this.paymentFilter,this.statusFilter, this.vehicleTypeFilter, this.fromFilter, this.toFilter,this.startDateFilter,
  //     this.endDateFilter).subscribe(
  //     (data: any) => {
  //       console.log(data);
        
  //       console.log(data.driverridedata);
  //       this.createridedata = data.driverridedata;
  //       // this.createridedata = data.driverridedata.filter(createride => createride.assigned === 'cancelled');
  //       this.totalPages = data.totalPages;
  //       this.currentPage = data.currentPage
  //     },
  //     (error: any) => {
  //       console.error(error);
  //     }
  //   );
  // }
  applyFilter(): void {
    this.currentPage = 1; // Reset to the first page when applying filters
    // this.getDriverRideData();
    this.getRideHistory()
  }
  clearFilter(): void {
    this.paymentFilter = '';
    this.statusFilter = '';
    this.vehicleTypeFilter = '';
    this.fromFilter = '';
    this.toFilter = '';
    this.startDateFilter = '';
    this.endDateFilter = '';
    this.currentPage = 1; // Reset to the first page when clearing filters
    // this.getDriverRideData();
    this.getRideHistory()
  }

  generatePageArray(): number[] {
    return Array(this.totalPages).fill(0).map((_, index) => index + 1);
  }

  onSearch() {
    console.log('Search query:', this.searchQuery);
    this.currentPage = 1; // Reset to the first page when searching
    // this.getDriverRideData()
    this.getRideHistory()
  }
  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
    // this.getDriverRideData()
    this.getRideHistory()
  }
  
  goToPage(page: number): void {
    this.currentPage = page;
    // this.getDriverRideData()
    this.getRideHistory()
  }
  // Function to go to the next page
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
    // this.getDriverRideData()
    this.getRideHistory()
  }

  onSort() {
    this.currentPage = 1; // Reset to the first page when sorting
    // this.getDriverRideData()
    this.getRideHistory()
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
        }
        // this.getDriverRideData()
        this.getRideHistory()
      // this.toastr.success('Driver Ride Updated');
    });
  }


  onselectedride(createridedata:any){
    this.selectedcreateride = createridedata
    // console.log(this.selectedridedata,"selected");
    this.initMap()
  }

  initMap() {
    const myLatLng = { lat: 22.309157, lng: 70.703702 };
    const mapOptions = {
      center: myLatLng,
      zoom: 7,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
  
    const map = new google.maps.Map(document.getElementById('googleMap'), mapOptions);
  
    const geocoder = new google.maps.Geocoder();
  
    const fromAddress = this.selectedcreateride.from; // Replace with the actual address of the "From" location
    const toAddress = this.selectedcreateride.to; // Replace with the actual address of the "To" location
  console.log(fromAddress);
  console.log(toAddress);
  
    // Geocode the "From" location address
    geocoder.geocode({ address: fromAddress }, (results, status) => {
      if (status === google.maps.GeocoderStatus.OK) {
        const fromLatLng = results[0].geometry.location;
  
        // Create a marker for the "From" location
        const fromMarker = new google.maps.Marker({
          position: fromLatLng,
          map: map,
          title: 'From Location'
        });
  
        // Geocode the "To" location address
        geocoder.geocode({ address: toAddress }, (results, status) => {
          if (status === google.maps.GeocoderStatus.OK) {
            const toLatLng = results[0].geometry.location;
  
            // Create a marker for the "To" location
            const toMarker = new google.maps.Marker({
              position: toLatLng,
              map: map,
              title: 'To Location'
            });
  
            // Create a polyline between the "From" and "To" locations
            const polyline = new google.maps.Polyline({
              path: [fromLatLng, toLatLng],
              strokeColor: '#FF0000',
              strokeOpacity: 1.0,
              strokeWeight: 2
            });
  
            polyline.setMap(map);
          } else {
            console.log('Geocode was not successful for the "To" location: ' + status);
          }
        });
      } else {
        console.log('Geocode was not successful for the "From" location: ' + status);
      }
    });
  }

}


// getDriverRideData(): void {
//     this.socketService.getDriverRideData().subscribe(
//       (driverridedata: any) => {
//         console.log(driverridedata);
        
//         // this.createridedata = driverridedata;
//         this.createridedata =driverridedata.filter(createride => createride.assigned === 'cancelled');
//         //  console.log(this.createridedata,"driverridedata");  
//       },
//       (error: any) => {
//         console.error(error);
//       }
//     );
//   }

