import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CityService } from 'src/app/shared/city.service';
import { CountryService } from 'src/app/shared/country.service';
import { ListService } from 'src/app/shared/list.service';
import { SocketService } from 'src/app/shared/socket.service';
import { VehicletypeService } from 'src/app/shared/vehicletype.service';
// import { io, Socket } from 'socket.io-client';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent {

  // socket: Socket;
  isShow = false;
  countries: any;
  isShowAddBtn = false;
  isShowEditBtn= false;
  isShowEditType= false
  driversForm: FormGroup;
  vehicletypeForm: FormGroup;
  driverdata: any[] = [];
  editingDriver: any;
  editingDriverType: any;
  callingCodes: string[] = [];
  countriesrcvd: any[] = [];
  citiesrcvd: any[] = [];
  selectedcountry: any[] = [];
  newStatus:any;
  vehicles: any[] = [];
  
  currentPage: number = 1;
  totalPages: number = 0;
  pageSize: number = 3;
  searchQuery: string = '';
  sortOrder: string = 'asc'; 
  sortField: string = 'name';
  constructor(private formBuilder: FormBuilder,private http: HttpClient,
    private vehicletypeService: VehicletypeService, private countryService: CountryService,
     private cityService: CityService, public router: Router,
    public listService: ListService,private toastr: ToastrService,private socketService:SocketService) {
    this.driversForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      code:['',[Validators.required]],
      phone: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
       profile: [null],
      // profile: [null, [Validators.required]],
      country_id: ['', Validators.required],
      city_id: ['', Validators.required],  
    }),
    this.vehicletypeForm= this.formBuilder.group({
      vehicletype_id: ['']
    })
  
    // this.socket = io('http://localhost:5000/');
}


  
  
  // getDriver() {
  //   this.listService.getDriver().subscribe((res) => {
  //     this.driverdata = res['driverlistdata'];
  //   });
  // }

  
  getDriver(){
    this.listService
      .getDriver(this.currentPage, this.pageSize, this.searchQuery,this.sortField,this.sortOrder)
      .subscribe((res) => {
        this.driverdata = res['driverlistdata'];
        this.totalPages = res['totalPages'];
        this.currentPage = res['currentPage'];
         console.log(this.driverdata,"dataaaaaaaaaaaa");
        
      });
  }

  generatePageArray(): number[] {
    return Array(this.totalPages).fill(0).map((_, index) => index + 1);
  }

  onSearch() {
    console.log('Search query:', this.searchQuery);
    this.currentPage = 1; // Reset to the first page when searching
    this.getDriver();
  }
  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
    this.getDriver();
  }
  
  goToPage(page: number): void {
    this.currentPage = page;
    this.getDriver();
  }
  // Function to go to the next page
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
    this.getDriver();
  }

  onSort() {
    this.currentPage = 1; // Reset to the first page when sorting
    this.getDriver();
  }
  clearSearch(): void {
    this.searchQuery = '';
    this.onSearch();
  }
  ngOnInit(): void {
    this.countryService.getCountries().subscribe((countries) => {
      this.countries = countries;
      // console.log(this.countries);
      this.countries.forEach((country:any) => { 
        if (country.idd.suffixes) {
          const countrycode = country.idd.root + country.idd.suffixes[0]
          // console.log( country.idd.suffixes[0]);
          this.callingCodes.push(countrycode);
          
        }
      });
  
    });
    this.subscribeToListenDriverTypeUpdate()
    this.subscribeToListenDriverUpdate()
    this.getDriver();
    this.getCountry();
    this.getCity();

  }
  subscribeToListenDriverTypeUpdate(){
  this.socketService.subscribeToListenDriverTypeUpdate().subscribe(updatedDriverType => {
    console.log(updatedDriverType);
     const index = this.driverdata.findIndex(d => d._id === updatedDriverType._id);
     if (index !== -1) {
       this.driverdata[index].vehicletype_id= updatedDriverType.vehicletype_id;
       console.log(this.driverdata);
        this.getDriver();
       this.toastr.success('Driver Status Updated');
     }
   });
  }
  subscribeToListenDriverUpdate(){
    this.socketService.subscribeToListenDriverUpdate().subscribe(updatedDriver => {
      const index = this.driverdata.findIndex(d => d._id === updatedDriver._id);
      if (index !== -1) {
        this.driverdata[index].status = updatedDriver.status;
        this.driverdata[index].rideStatus = updatedDriver.rideStatus;
        console.log(this.driverdata);
        console.log(this.driverdata);
        // this.getDriver();
        
        this.toastr.success('Driver Status Updated');
      }
    });
  }
  onToggleStatus(event: Event, driver: any) {
    // console.log(driver);
    
    const checked = (event.target as HTMLInputElement).checked;
    driver.status = checked ? 'Approved' : 'Declined';
    // driver.rideStatus = checked ? 'Online' : 'Offline';

    this.socketService.updateStatus(driver._id, driver.status);
  }
  getCountry() {
    this.countryService.getCountry(this.searchQuery).subscribe((res) => {
      this.countriesrcvd = res['countrydata'];
    });
  }
  getCity() {
    this.cityService.getCity().subscribe((res) => {
      this.citiesrcvd = res['citydata'];
      //  this.selectedcountry = this.citiesrcvd.map(country => country.city);
    });
  }
  onCountrySelected() {
    const selectedCountry = this.driversForm.value.country_id;
     this.selectedcountry = this.citiesrcvd.filter(city => city.country_id === selectedCountry);
    // this.selectedcountry = this.citiesrcvd.map(country => country.city === selectedCountry);
  }
  onAddBtnDriver() {
    // this.isShow = !this.isShow;
    this.isShowAddBtn = true;
    this.isShowEditBtn = false;
    if(this.isShow){
      this.isShow = this.isShow;
    }
    else{
      this.isShow = !this.isShow;
    }
  }
  // onFileSelected(event: any) {
  //   const file: File = (event.target as HTMLInputElement).files[0];
  //   this.userForm.controls['profile'].setValue(file);
  //   this.userForm.controls['profile'].markAsTouched();
  // }
  onFileSelected(event: any) {
    const file: File = (event.target as HTMLInputElement).files[0];
    this.driversForm.patchValue({
      profile: file
    });
    // this.userForm.get('profile').updateValueAndValidity();
  }
  onSubmit() {
    var formData: any = new FormData();

    formData.append('name', this.driversForm.value.name);
    formData.append('email', this.driversForm.value.email);
    formData.append('phone', this.driversForm.value.phone);
    formData.append('code', this.driversForm.value.code);
    formData.append('profile', this.driversForm.value.profile);
    formData.append('country_id', this.driversForm.value.country_id);
    formData.append('city_id', this.driversForm.value.city_id);
    if (this.editingDriver) {
      // Updating an existing vehicle
      formData.append('id', this.editingDriver._id);

      this.listService.updateDriver(formData).subscribe(res => {
        // Update the edited vehicle in the vehicles array
        const index = this.driverdata.findIndex(v => v._id === this.editingDriver._id);
        this.driverdata[index] = res['driverUpdated'];
        this.getDriver();
        this.toastr.success('Driver Updated ')
        // this.router.navigate([], { skipLocationChange: true });
        this.editingDriver = null;
        this.driversForm.reset();
        //  this.getUser();
      });
    } else {
      // Adding a new vehicle
      this.listService.addDrivers(formData).subscribe(
        (res)=> {
        this.driverdata.push(res['driverCreated']);
         this.getDriver();
        this.toastr.success('Driver Added ')
        // this.router.navigate(['users']);
      },
      (error) =>{
        
        this.toastr.error(error.error.message)
      }
      )
    }
    this.isShow = !this.isShow;
  }


onEditDriver(driver: any, event: Event) {
  event.preventDefault();
  // this.isShow = !this.isShow;
  this.editingDriver = driver;
  const slicephone = driver.phone.slice(-10)
  const slicecode = driver.phone.slice(0,-10)
  this.driversForm.patchValue({
    name: driver.name,
    email: driver.email,
    phone: slicephone,
    code:slicecode,
    country_id: driver.country_id,
    city_id: driver.city_id,
  });
  this.isShowEditBtn = true;
  this.isShowAddBtn = false;
  // this.isShow = !this.isShow;
  if(this.isShow){
    this.isShow = this.isShow;
  }
  else{
    this.isShow = !this.isShow;
  }
}

onEditType(driver: any,event: Event){
  event.preventDefault();
  // console.log(driver);
 
  this.editingDriverType=driver;
  this.vehicletypeForm.patchValue({
    vehicletype_id: driver.vehicletype_id,
    
  });
  this.isShowEditType = !this.isShowEditType;
  this.getVehicleType()

}
onSubmitvehicletypeForm(){
  //  var formData: any = new FormData();
   const formValue = this.vehicletypeForm.value;
   const driverTypeData: any = {
    _id:formValue._id,
    vehicletype_id: formValue.vehicletype_id,
    
   }

  if (this.editingDriverType) {
    driverTypeData._id = this.editingDriverType._id;
    console.log(driverTypeData._id);
    console.log(driverTypeData.vehicletype_id);

    this.socketService.updateType(driverTypeData._id, driverTypeData.vehicletype_id);

      
  
    }
    this.isShowEditType = !this.isShowEditType;
  }
   

  
 // this.listService.updateType(this.editingDriverType._id,driverTypeData).subscribe(res => {

    //   const index = this.driverdata.findIndex(v => v._id === this.editingDriverType._id);
    //   this.driverdata[index] = res['driverTypeUpdated'];
    //   console.log(this.driverdata,"driverdata");
    //   this.toastr.success('Driver Type Updated ')
    //   this.editingDriverType = null;
    //   this.driversForm.reset();
    // });
  // }
onCancelBtn() {
  this.isShowEditType = !this.isShowEditType;
  this.vehicletypeForm.reset();
  // this.isShowEditBtn = false;
}
getVehicleType() {
  this.vehicletypeService.getVehicleType().subscribe((res) => {
    this.vehicles = res['vehicletype'];
    console.log(this.vehicles,"vehicle");
    
  });
}
onDeleteDriver(driverId: string, event: Event) {
  event.preventDefault();
  if (confirm('Are you sure you want to delete this user?')) {
    this.listService.deleteDriver(driverId).subscribe(
      (res) => {
        console.log(res);
        this.getDriver();
      },
      (err) => {
        console.log(err);
      }
    );
  }
}

}

