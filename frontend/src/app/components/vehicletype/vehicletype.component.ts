import { HttpEvent } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { VehicletypeService } from 'src/app/shared/vehicletype.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-vehicletype',
  templateUrl: './vehicletype.component.html',
  styleUrls: ['./vehicletype.component.css']
})
export class VehicletypeComponent {
  vehicles: any[] = [];
  isShow = false;
  isShowAddBtn = false;
  isShowEditBtn= false
  preview: string;
  vehicleForm: FormGroup;
  selectedVehicle: any = null;
  availableVehicleTypes: string[] = ['Suv', 'Hatchback', 'Sedan','Sports','Xuv'];
  selectedVehicleTypes: string[] = [];
  // percentDone?: any = 0;
  // users: any[] = [];

  constructor(public fb: FormBuilder, public router: Router,private vehicletypeService: VehicletypeService,private toastr: ToastrService) {

    this.vehicleForm = this.fb.group({
      vehicleimg: [null,[Validators.required]],
      vehicletype: ['',[Validators.required]]
    });
  }
  getVehicleType() {
    this.vehicletypeService.getVehicleType().subscribe((res) => {
      this.vehicles = res['vehicletype'];
      console.log(this.vehicles);
      
      this.selectedVehicleTypes = this.vehicles.map(vehicle => vehicle.vehicletype);
    });
  }

  

  onAddBtnVehicle() {
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

  ngOnInit(): void {
    this.getVehicleType();
  }
  uploadFile(event) {
    const file = (event.target as HTMLInputElement).files[0];
    this.vehicleForm.patchValue({
      vehicleimg: file,
    });
    this.vehicleForm.get('vehicleimg').updateValueAndValidity();

    // File Preview
    // const reader = new FileReader();
    // reader.onload = () => {
    //   this.preview = reader.result as string;
    // };
    // reader.readAsDataURL(file);
  }

  isOptionDisabled(vehicleType: string): boolean {
    return this.selectedVehicleTypes.includes(vehicleType);
  }
  
  disableSelectedOption() {
    const selectedVehicleType = this.vehicleForm.value.vehicletype;
    if (selectedVehicleType && this.selectedVehicleTypes.includes(selectedVehicleType)) {
      this.vehicleForm.patchValue({
        vehicletype: ''
      });
    }
  }
  submitVehicleForm() {

    const selectedVehicleType = this.vehicleForm.value.vehicletype;

  if (!this.selectedVehicleTypes.includes(selectedVehicleType)) {
    this.selectedVehicleTypes.push(selectedVehicleType);

    var formData: any = new FormData();
    formData.append('vehicletype', selectedVehicleType);
    formData.append('vehicleimg', this.vehicleForm.value.vehicleimg);

    if (this.selectedVehicle) {
      // Updating an existing vehicle
      formData.append('id', this.selectedVehicle._id);

      this.vehicletypeService.updateVehicleType(formData).subscribe((res:any) => {
        // Update the edited vehicle in the vehicles array
        const index = this.vehicles.findIndex(v => v._id === this.selectedVehicle._id);
        this.vehicles[index] = res['VehicleTypeUpdated'];
        this.toastr.success(res.message);
        this.selectedVehicle = null;
      });
    } else {
      // Adding a new vehicle
      this.vehicletypeService.addVehicleType(formData).subscribe(
        (res:any) => {
            this.vehicles.push(res['VehicleTypCreated']);
             this.toastr.success(res.message);
        },
        (error) => {
          this.toastr.error(error.error.message);
        // res => {
        // this.vehicles.push(res['VehicleTypCreated']);
        // this.toastr.success({res.message});
      });
    }
  }
    // const selectedVehicleType = this.vehicleForm.value.vehicletype;
    // if (!this.selectedVehicleTypes.includes(selectedVehicleType)) {
    //   this.selectedVehicleTypes.push(selectedVehicleType);
    // var formData: any = new FormData();
    // formData.append('vehicletype', selectedVehicleType);
    // formData.append('vehicleimg', this.vehicleForm.value.vehicleimg);
    // this.vehicletypeService
    //   .addVehicleType(formData).subscribe(res => {
    //     this.vehicles.push(res['VehicleTypCreated'])
    //   })
    // }
    this.isShow = !this.isShow;
    this.vehicleForm.reset();
  }
onEditBtnVehicle(vehicle: any){

  this.selectedVehicle = vehicle;
  this.vehicleForm.patchValue({
    vehicletype: vehicle.vehicletype

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

onCancelBtn() {
  this.isShow = !this.isShow;
  this.vehicleForm.reset();
  // this.editingVehiclePricing = null;
  this.isShowAddBtn = false;
  this.isShowEditBtn = false;
}
}
   
       