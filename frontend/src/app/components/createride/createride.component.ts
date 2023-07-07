import { Component, ElementRef, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CityService } from 'src/app/shared/city.service';
import { CountryService } from 'src/app/shared/country.service';
import { SettingsService } from 'src/app/shared/settings.service';
import { UsersService } from 'src/app/shared/users.service';
import { VehiclepricingService } from 'src/app/shared/vehiclepricing.service';
import { DatePipe } from '@angular/common';
import { CreaterideService } from 'src/app/shared/createride.service';
import { VehicletypeService } from 'src/app/shared/vehicletype.service';
import { SocketService } from 'src/app/shared/socket.service';

declare const google: any;

@Component({
  selector: 'app-createride',
  templateUrl: './createride.component.html',
  styleUrls: ['./createride.component.css']
})
export class CreaterideComponent {

  currentDateTime: string;
  isShow = false;
  isShowDirection = false;
  countries: any;
  isShowAddBtn = false;
  isShowEditBtn = false;
  isShowDirectionBtn = false
  isbuttonshow : boolean = true; 
  usersForm: FormGroup;
  userphoneForm: FormGroup;
  bookrideForm: FormGroup;
  directionForm: FormGroup;
  userdatas: any[] = [];
  editingUser: any;
  callingCodes: string[] = [];
  citiesrcvd: any[] = [];
  vehiclepricingdata: any[] = [];

  currentPage: number = 1;
  totalPages: number = 0;
  pageSize: number = 3;
  searchQuery: string = '';
  sortOrder: string = 'asc';
  sortField: string = 'name';

  fromCoordinates: any;
  ridecity: any;
  _id: string;
  settingsdata: any[] = [];
  stopControls: FormControl[] = [];
  addedStops: number[] = [];
  stops: any[] = [];
  totalDistanceInKm: any;
  totalTimeInHr: any;
  totalTimeInMin: any;
  vehicleTypesService: any[] = [];
  showEstimatedPrices: boolean = false;
  estimatePrice:any;
  countriesrcvd: any[] = [];
  totalDistanceInput :any;
  totalTimeInput :any;
  userDetails:any
  matchedVehicles:any
  vehicles: any[] = [];
  createridedata: any[] = [];
  
  // selectedCity:any;
  // selectedVehicle:any;
  // availabelcordinates: any;

  constructor(private http: HttpClient, private formBuilder: FormBuilder,
    private cityService: CityService, private countryService: CountryService,
    public router: Router, public usersservice: UsersService, private toastr: ToastrService,
    public vehiclepricingService: VehiclepricingService, private settingsService: SettingsService,
     private datePipe: DatePipe, private createrideService: CreaterideService,
     private vehicletypeService: VehicletypeService, private socketService: SocketService) {
    this.usersForm = this.formBuilder.group({
      name: [''],
      email: [''],
      code: [''],
      phone: [''],
    })
    this.userphoneForm = this.formBuilder.group({
      code: [''],
      phone: [''],
    })
    // this.directionForm = this.formBuilder.group({
    //   from: [''],
    //   to: [''],
    //   stops: [''],
    // });
    this.bookrideForm = this.formBuilder.group({
      totalDistance: [''],
      totalTime: [''],
      vehicletype: [''],
      paymentoption: [''],
      bookride: [''],
      datetime: ['']
    });
  }
  // getUser() {
  //   this.usersservice.getUser().subscribe((res) => {
  //     this.userdatas = res['userdata'];
  //   });
  // }

  ngOnInit(): void {
    this.currentDateTime = this.datePipe.transform(new Date(), 'yyyy-MM-ddTHH:mm');
    // this.onAddStop();
    // this.initAutocomplete();

    // this.countryService.getCountries().subscribe((countries) => {
    //   this.countries = countries;
    //   // console.log(this.countries);
    //   this.countries.forEach((country: any) => {
    //     if (country.idd.suffixes) {
    //       const countrycode = country.idd.root + country.idd.suffixes[0]
    //       // console.log( country.idd.suffixes[0]);
    //       this.callingCodes.push(countrycode);
    //     }
    //   });
    // });
    this.getCountry()
    this.getVehicleType();
    this.getVehiclePricing();
    this.getUser();
    this.getSetting();
    this.initMap();
    this.getCity();
    this.getVehiclePricing();
    this.getCreateRide()

    // this.getSetting();
  }
  ngAfterViewInit() {
    // this.initAutocomplete();
  }
  getCreateRide() {
    this.createrideService.getCreateRide().subscribe((res) => {
      this.createridedata = res['createridedata'];
      console.log(this.createridedata);
      
    });
  }
  getVehicleType() {
    this.vehicletypeService.getVehicleType().subscribe((res) => {
      this.vehicles = res['vehicletype'];
      // this.selectedVehicleTypes = this.vehicles.map(vehicle => vehicle.vehicletype);
    });
  }
  getCountry() {
    this.countryService.getCountry(this.searchQuery).subscribe((res) => {
      this.countriesrcvd = res['countrydata'];
      this.countriesrcvd.forEach((country: any) => {
        const countrycode = country.code
        this.callingCodes.push(countrycode);
      });
    });
  }
  getCity() {
    this.cityService.getCity().subscribe((res) => {
      this.citiesrcvd = res['citydata'];
      console.log(this.citiesrcvd);
      //  this.selectedcountry = this.citiesrcvd.map(country => country.city);
    });
  }
  getUser() {
    this.usersservice
      .getUser(this.currentPage, this.pageSize, this.searchQuery, this.sortField, this.sortOrder)
      .subscribe((res) => {
        this.userdatas = res['userdata'];
        this.totalPages = res['totalPages'];
        this.currentPage = res['currentPage'];
        // const userIds = this.userdatas.map(user => user._id);
        // console.log(userIds);
      // console.log(this.userdatas); // Do whatever you want with the userIds array
      });
  }

  getUserDetails(phone: string) {
    return this.userdatas.find((user) => user.phone === phone);
  }

  onGetUserDetails() {
    const phone = this.userphoneForm.value.code + this.userphoneForm.value.phone;
    this.userDetails = this.getUserDetails(phone);
    // const userId = this.userDetails._id
    //  console.log(userId);
    if (this.userDetails) {
      this.isShow =  true;
      this.isbuttonshow = false;
        // this.isShowDirectionBtn =  true;
      this.usersForm.patchValue(this.userDetails);
    } else {
      this.toastr.error('No user found', 'Error');
    }
    // if (this.isShow) {
    //   this.isShow = this.isShow;
    // }
    // else {
    //   this.isShow = !this.isShow;
    // }
  }
  getVehiclePricing() {
    this.vehiclepricingService.getVehiclePricing().subscribe((res) => {
      this.vehiclepricingdata = res['vehiclepricingdata'];
      console.log(this.vehiclepricingdata);


    });
  }

  getSetting() {
    this.settingsService.getSetting().subscribe(
      (res) => {
        this.settingsdata = res['settingsdata'];
        this._id = this.settingsdata[0]._id
        // console.log(this.settingsdata);
      },
      error => {
        console.error('Error fetching settings:', error);
      }
    );
  }
  
  onSubmit() {
    if (this.isShow) {
      this.isShow = !this.isShow;
    }
    else {
      this.isShow = this.isShow;
    }

    if (this.isShowDirection) {
      this.isShowDirection = this.isShowDirection;
    }
    else {
      this.isShowDirection = !this.isShowDirection;
    }
    // this.isShowDirectionBtn = true
  }

  onAddStop() {
    if (this.stops.length < +this.settingsdata[0].maxstops) {
      // console.log(+this.settingsdata[0].maxstops);

      // this.stops.push(this.stops.length);
      this.stops.push({ name: '', coordinates: null });
      //  this.stops.push({ name: ''});
      // this.stopControls.push(new FormControl(''));
    }
  }
  initAutocomplete() {
    setTimeout(() => {
      this.stops.forEach((stop, index) => {
        const autocomplete = new google.maps.places.Autocomplete(
          document.getElementById(`stop${index}`) as HTMLInputElement,
          // {
          //   types: ['geocode'], // Limit the autocomplete results to geographic locations
          // }
        );
        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          stop.name = place.formatted_address;
          // Handle the selected place
        });
      });
    }, 0);
  }

  initMap() {
    const myLatLng = { lat: 22.309157, lng: 70.703702 };//22.309157, 70.703702
    const mapOptions = {
      center: myLatLng,
      zoom: 7,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    const map = new google.maps.Map(document.getElementById('googleMap'), mapOptions);

    const directionsService = new google.maps.DirectionsService();
    const directionsDisplay = new google.maps.DirectionsRenderer();
    directionsDisplay.setMap(map);

    const calcRoute = () => {
      let fromInput = document.getElementById("from") as HTMLInputElement;
      let toInput = document.getElementById("to") as HTMLInputElement;
      this.totalDistanceInput = document.getElementById("totalDistance") as HTMLInputElement;
      this.totalTimeInput = document.getElementById("totalTime") as HTMLInputElement;

      if (fromInput && toInput && this.totalDistanceInput && this.totalTimeInput) {
        const waypoints = this.stops.map(stop => ({ location: stop.name, stopover: true }));
        console.log(waypoints, "waypoints");

        const request = {
          origin: fromInput.value,
          destination: toInput.value,
          waypoints: waypoints,
          travelMode: google.maps.TravelMode.DRIVING,
          unitSystem: google.maps.UnitSystem.METRIC // Use metric unit system for kilometers
        };

        directionsService.route(request, (result: any, status: any) => {
          if (status == google.maps.DirectionsStatus.OK) {
            const route = result.routes[0];
            // console.log(route);

            const legs = route.legs;
            // console.log(legs,"legs");

            let totalDistance = 0;
            let totalTime = 0;

            legs.forEach(leg => {
              totalDistance += leg.distance.value;
              totalTime += leg.duration.value;
            });

            this.totalDistanceInKm = (totalDistance / 1000).toFixed(2); // Convert meters to kilometers
            // this.totalTimeInHr = (totalTime / 3600).toFixed(2); // Convert seconds to hours
            this.totalTimeInHr = Math.floor(totalTime / 3600); // Convert seconds to hours
            this.totalTimeInMin = (Math.round(totalTime % 3600)/60).toFixed(0); 

            this.totalDistanceInput.value = `${this.totalDistanceInKm} km`;
            this.totalTimeInput.value = `${this.totalTimeInHr} hr  ${this.totalTimeInMin} minutes`;
            console.log(this.totalTimeInput.value);
            

            directionsDisplay.setDirections(result);
            const numStops = legs.length - 1;
            // console.log(numStops,"numstops");

            // Add markers for the stops
            legs.forEach((leg, index) => {
              if (index < numStops) {
                const stop = this.stops[index];
                // console.log(index);

                // console.log(stop,"asfghkdgfh");
                const marker = new google.maps.Marker({
                  position: leg.end_location,
                  map: map,
                  title: stop.name
                });
              }
            });
          } else {
            directionsDisplay.setDirections({ routes: [] });
            map.setCenter(myLatLng);
            fromInput.value = "";
            toInput.value = "";
            this.vehicleTypesService =[];
            this.totalDistanceInput.value = "";
            this.totalTimeInput.value = "";
            this.toastr.error('Route is not Available.Please enter route');
          }
        });
      }
    };

    // Bind calcRoute() function to the button click event
    document.getElementById("calcButton")?.addEventListener("click", calcRoute);

    //   let estimatePrice =
    //   ((this.totalDistance - baseDistance)  pDistance) + (baseDistance  basePrice) + (this.totalTime * pTime)
    // if (estimatePrice < minFare) {
    //   estimatePrice = minFare
    // }

    const input1 = document.getElementById("from");
    // const autocomplete1 = new google.maps.places.Autocomplete(input1, options);
    const autocomplete1 = new google.maps.places.Autocomplete(input1);

    autocomplete1.addListener("place_changed", () => {
      const place = autocomplete1.getPlace();

      if (place.geometry && place.geometry.location) {
        // Retrieve the coordinates
        this.fromCoordinates = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        };

        // Use the input1Coordinates as needed
        // console.log(this.fromCoordinates);

        const placeLatitude = this.fromCoordinates.lat;
        const placeLongitude = this.fromCoordinates.lng;

        // Check if the place coordinates fall within any of the polygons
        let isWithinPolygon = false;
        let matchingCoordinateGroup = null;

        for (const polygon of this.citiesrcvd) {
          // console.log(polygon);

          let isInside = false;
          let j = polygon.coordinates.length - 1;

          for (let i = 0; i < polygon.coordinates.length; i++) {
            if (
              ((polygon.coordinates[i].lng < placeLongitude &&
                polygon.coordinates[j].lng >= placeLongitude) ||
                (polygon.coordinates[j].lng < placeLongitude &&
                  polygon.coordinates[i].lng >= placeLongitude)) &&
              polygon.coordinates[i].lat +
              ((placeLongitude - polygon.coordinates[i].lng) /
                (polygon.coordinates[j].lng - polygon.coordinates[i].lng)) *
              (polygon.coordinates[j].lat - polygon.coordinates[i].lat) <
              placeLatitude
            ) {
              isInside = !isInside;
            }
            j = i;
          }

          if (isInside) {
            isWithinPolygon = true;
            matchingCoordinateGroup = polygon;
            this.ridecity = matchingCoordinateGroup;
            console.log(this.ridecity);
            
            
            this.matchedVehicles = this.vehiclepricingdata.filter(vehicle => vehicle.citydata.city=== this.ridecity.city);

            console.log(this.matchedVehicles,"matchedVehicles");
            
            if (this.matchedVehicles.length > 0) {
              this.vehicleTypesService = this.matchedVehicles.map(vehicle => vehicle.vehicletypedata.vehicletype);
              console.log(this.vehicleTypesService, "vehicleTypesService");

              // Calculate estimated price for each vehicle type

            } else {
              // City not found in vehicle pricing data or no vehicles found for the city
            }

            break;


            // if (matchedVehicles.length > 0) {
            //   const vehicleTypes = matchedVehicles.map(vehicle => vehicle.vehicletype);
            //   console.log(vehicleTypes,"saddfhgj");
            //   // Do something with the vehicle types
            // } else {
            //   // City not found in vehicle pricing data or no vehicles found for the city
            // }

            // break;
          }
        }

        if (isWithinPolygon) {
          this.toastr.success('Service is Available');
          console.log('exist');

        } else {
          this.toastr.error('Service is not Available.');
          console.log('not exist');
        }
      }
    });

    const input2 = document.getElementById("to");
    const autocomplete2 = new google.maps.places.Autocomplete(input2);
  }

  ondirectionbtn() {

    this.vehicleTypesService.forEach(vehicleType => {
      this.estimatePrice = this.getEstimatedPrice(vehicleType);
      console.log(`Estimated price for ${vehicleType}: ${this.estimatePrice}`);
    });
    this.showEstimatedPrices = true;

  }

  getEstimatedPrice(vehicleType: string): number {
    const vehicle = this.vehiclepricingdata.find(item => item.vehicletypedata.vehicletype === vehicleType);
// console.log(vehicle);

    if (vehicle) {
      let basePrice = Number(vehicle.baseprice);
      let baseDistance = Number(vehicle.distanceforbaseprice);
      let unitPerDistance = Number(vehicle.priceperunitdistance);
      let unitPerTime = Number(vehicle.priceperunittime);
      let minFare = Number(vehicle.minfare);

      let estimatePrice = basePrice + ((Number(this.totalDistanceInKm) - baseDistance) * unitPerDistance) + (Number(this.totalTimeInHr) * unitPerTime);
      estimatePrice = Math.round(estimatePrice);

      if (estimatePrice < minFare) {
        estimatePrice = minFare;
      }
      return estimatePrice;
    }
    return 0; // Or any default value if vehicle type is not found
  }


  onOptionChange() {
    if (this.bookrideForm.value.bookride === 'now') {
      // const now = new Date().toISOString().slice(0, 16);
      // this.bookrideForm.patchValue({ datetime: now });
      const now = new Date();
      const offset = now.getTimezoneOffset();
      now.setMinutes(now.getMinutes() - offset);
      const formattedDateTime = now.toISOString().slice(0, 16);
      this.bookrideForm.patchValue({ datetime: formattedDateTime });
    }
  }
  onBookRideSubmit() {

    if (
      !this.usersForm.valid ||
      !this.bookrideForm.valid ||
      !this.usersForm.get('name').value ||
      !this.usersForm.get('email').value ||
      !this.usersForm.get('phone').value ||
      !document.getElementById("from") ||
      !document.getElementById("to")
    ) {
      // Display an error message or perform any necessary actions
      this.toastr.error('Please fill in all required fields');
      return;
    }

    const name = this.usersForm.get('name').value;
    const email = this.usersForm.get('email').value;
    const phone = this.usersForm.get('phone').value;
    const fromInput = document.getElementById("from") as HTMLInputElement;
    const toInput = document.getElementById("to") as HTMLInputElement;
    const from = fromInput.value;
    const to = toInput.value;
    
    const stops = this.stops.map(stop => stop.name);
    const datetime = this.datePipe.transform(this.bookrideForm.value.datetime, 'dd-MMM-yyyy hh:mm a');
    const totalDistance = this.totalDistanceInput.value
    const totalTime = this.totalTimeInput.value
    const vehicleType = this.bookrideForm.value.vehicletype;
    
    const estimatePrice = this.getEstimatedPrice(vehicleType);
    const paymentOption = this.bookrideForm.value.paymentoption;
    const bookRide = this.bookrideForm.value.bookride;

    const userId = this.userDetails ? this.userDetails._id : null;
    const selectedCity = this.citiesrcvd.find(city => city.city === this.ridecity.city);
    const cityId = selectedCity ? selectedCity._id : null;
    const selectedVehicle = this.vehicles.find(vehicle => vehicle.vehicletype === vehicleType);
    const vehicleTypeId = selectedVehicle ? selectedVehicle._id : null;

    const rideData = {
      userId :this.userDetails ? this.userDetails._id : null,
      cityId :selectedCity ? selectedCity._id : null,
      vehicleTypeId :selectedVehicle ? selectedVehicle._id : null,
      name: this.usersForm.get('name').value,
      email: this.usersForm.get('email').value,
      phone: this.usersForm.get('phone').value,
      from: (document.getElementById("from") as HTMLInputElement).value,
      to: (document.getElementById("to") as HTMLInputElement).value,
      stops: this.stops.map(stop => stop.name),
      totalDistance: this.totalDistanceInput.value,
      totalTime: this.totalTimeInput.value,
      vehicleType: this.bookrideForm.value.vehicletype,
      estimatePrice: this.getEstimatedPrice(this.bookrideForm.value.vehicletype),
      paymentOption: this.bookrideForm.value.paymentoption,
      datetime: this.datePipe.transform(this.bookrideForm.value.datetime, 'dd-MMM-yyyy hh:mm a'),
      bookRide: this.bookrideForm.value.bookride
    };
    console.log(rideData);


    this.socketService.addDriverRide(rideData ).subscribe(
      response => {
        this.toastr.success("Ride created successfully")
      },
      error => {
        console.log(error);
        this.toastr.error("please fill all fields")
      }
    );
    // this.createrideService.addRide(rideData).subscribe(
    //   (res:any) => {
    //     this.toastr.success(res.message);
    //     console.log(res); // Handle success response
    //   },
    //   (error) => {
    //     console.error(error); // Handle error response
    //   }
    // );
  }
}
