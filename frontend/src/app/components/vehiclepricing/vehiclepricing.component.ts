import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CityService } from 'src/app/shared/city.service';
import { CountryService } from 'src/app/shared/country.service';
import { VehiclePricing } from 'src/app/shared/vehiclepricing.model';
import { VehiclepricingService } from 'src/app/shared/vehiclepricing.service';
import { VehicletypeService } from 'src/app/shared/vehicletype.service';

@Component({
  selector: 'app-vehiclepricing',
  templateUrl: './vehiclepricing.component.html',
  styleUrls: ['./vehiclepricing.component.css']
})
export class VehiclepricingComponent implements OnInit{
  isShow = false;
  isShowAddBtn = false;
  isShowEditBtn= false
  vehiclePricingForm: FormGroup;
  countriesrcvd: any[] = [];
  citiesrcvd: any[] = [];
  vehicles: any[] = [];
  selectedcountry: any[] = [];
  vehiclepricingdata: any[] = [];
  editingVehiclePricing: VehiclePricing | null = null;
  availabledistanceforbaseprice: string[] = ['5', '1', '3','4','2'];
  vehiclepricingdatas: VehiclePricing  = {
    _id:'',
    country_id:'',
    city_id: '', 
    vehicletype_id: '',
    driverprofit: '', 
    minfare: '',
    distanceforbaseprice: '', 
    baseprice: '',
    priceperunitdistance: '', 
    priceperunittime: '',
    maxspace: '',
  }
  searchQuery: string = '';

  constructor(private fb: FormBuilder, public router: Router, private countryService: CountryService,
     private cityService: CityService,private vehicletypeService: VehicletypeService, 
     public vehiclepricingService: VehiclepricingService,private toastr: ToastrService) { }
  
  ngOnInit() {
    this.vehiclePricingForm = this.fb.group({
      country_id: ['', Validators.required],
      city_id: ['', Validators.required],
      vehicletype_id: ['', Validators.required],
      driverprofit: ['', Validators.required],
      minfare: ['', Validators.required],
      distanceforbaseprice: ['', Validators.required],
      baseprice: ['', Validators.required],
      priceperunitdistance: ['', Validators.required],
      priceperunittime: ['', Validators.required],
      maxspace: ['', Validators.required],
    });

    this.getCountry();
    this.getCity();
    this.getVehicleType()
    this.getVehiclePricing();
  }

  onAddBtnVehiclePricing() {
    this.vehiclePricingForm.reset();
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
  getVehicleType() {
    this.vehicletypeService.getVehicleType().subscribe((res) => {
      this.vehicles = res['vehicletype'];
    });
  }
  getVehiclePricing() {
    this.vehiclepricingService.getVehiclePricing().subscribe((res) => {
      this.vehiclepricingdata = res['vehiclepricingdata'];
      console.log(this.vehiclepricingdata);
      
    });
  }
  onCountrySelected() {
  const selectedCountry = this.vehiclePricingForm.value.country_id;
  console.log(selectedCountry);
  
   this.selectedcountry = this.citiesrcvd.filter(city => city.country_id === selectedCountry);
  // this.selectedcountry = this.citiesrcvd.map(country => country.city === selectedCountry);
  console.log(this.selectedcountry,"citiescountry");
  
}
  onSubmitvehiclePricingForm(){
if(this.vehiclePricingForm.invalid){
  this.vehiclePricingForm.markAllAsTouched();
  return;
}
else{
  const formValue = this.vehiclePricingForm.value;
  // console.log(formValue);
  
  const vehiclePricingData: VehiclePricing = {
    _id:formValue._id,
    country_id: formValue.country_id,
    city_id: formValue.city_id,
    vehicletype_id: formValue.vehicletype_id,
    driverprofit: formValue.driverprofit,
    minfare: formValue.minfare,
    distanceforbaseprice: formValue.distanceforbaseprice,
    baseprice: formValue.baseprice,
    priceperunitdistance: formValue.priceperunitdistance,
    priceperunittime: formValue.priceperunittime,
    maxspace: formValue.maxspace,
    // id:formValue.id,
  };
  console.log(vehiclePricingData);
  

    if (this.editingVehiclePricing) {
      // Updating an existing vehicle
      //  formValue.append('id', this.editingVehiclePricing._id);
       vehiclePricingData._id = this.editingVehiclePricing._id;

      this.vehiclepricingService.updateVehiclePricing(this.editingVehiclePricing._id, vehiclePricingData).subscribe(res => {
        // Update the edited vehicle in the vehicles array
        const index = this.vehiclepricingdata.findIndex(v => v._id === this.editingVehiclePricing._id);
        this.vehiclepricingdata[index] = res['vehiclepricingUpdated'];
        this.getVehiclePricing();
        this.toastr.success('VehiclePricing Updated ')
        // this.router.navigate([], { skipLocationChange: true });
        this.editingVehiclePricing = null;
        this.vehiclePricingForm.reset();
        //  this.getUser();
      });
    } else {
      // Adding a new vehicle
      this.vehiclepricingService.addVehiclePricing(vehiclePricingData).subscribe(res=> {
        this.vehiclepricingdata.push(res['vehiclepricingCreated']);
        this.getVehiclePricing();
        this.toastr.success('VehiclePricing Added ')
        // this.router.navigate(['users']);
      })
    }
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
    this.vehiclePricingForm.reset();
    this.isShow = !this.isShow;
  }
  }
  onEditVehiclePricing(vehiclepricing: VehiclePricing, event: Event) {
    event.preventDefault();
    // this.isShow = !this.isShow;
    
    this.editingVehiclePricing = vehiclepricing;
  //   this.vehiclePricingForm.get('country_id').disable();
  // this.vehiclePricingForm.get('city_id').disable();
  // this.vehiclePricingForm.get('vehicletype_id').disable();

    this.vehiclePricingForm.patchValue({
      country_id: vehiclepricing.country_id,
      city_id: vehiclepricing.city_id,
      vehicletype_id: vehiclepricing.vehicletype_id,
      driverprofit: vehiclepricing.driverprofit,
      minfare: vehiclepricing.minfare,
      distanceforbaseprice: vehiclepricing.distanceforbaseprice,
      baseprice: vehiclepricing.baseprice,
      priceperunitdistance: vehiclepricing.priceperunitdistance,
      priceperunittime: vehiclepricing.priceperunittime,
      maxspace: vehiclepricing.maxspace,
    });
   
     // Retrieve the selected country from the form value
  const selectedCountry = this.vehiclePricingForm.value.country_id;

  // Filter the cities based on the selected country
  this.selectedcountry = this.citiesrcvd.filter(city => city.country_id === selectedCountry);
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

  onDeleteVehiclePricing(vehiclepricingId: string, event: Event) {
    event.preventDefault();
    if (confirm('Are you sure you want to delete this user?')) {
      this.vehiclepricingService.deleteVehiclePricing(vehiclepricingId).subscribe(
        (res) => {
          console.log(res);
          this.getVehiclePricing();
        },
        (err) => {
          console.log(err);
        }
      );
    }
  }

  onCancelBtn() {
    this.isShow = !this.isShow;
    this.vehiclePricingForm.reset();
    this.editingVehiclePricing = null;
    this.isShowAddBtn = false;
    this.isShowEditBtn = false;
  }
}
