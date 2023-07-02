import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormBuilder, NgForm } from '@angular/forms';
import { CityService } from 'src/app/shared/city.service';
import { CountryService } from 'src/app/shared/country.service';
declare var google: any;
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';


@Component({
  selector: 'app-city',
  templateUrl: './city.component.html',
  styleUrls: ['./city.component.css']
})
export class CityComponent implements OnInit, AfterViewInit {
  isShow: boolean = false;
  isShowAddBtn = false;
  isShowEditBtn = false
  editingCityId: string;
  countries;
  countryName: any;
  selectedCountry: string;
  selectedCountryNm: string;
  selectedCity: string;
  selectedCountryCities: any[] = [];
  countriesrcvd: any[] = [];
  citiesrcvd: any[] = [];
  citydata: any = {
    country_id: '',
    city: '',
    coordinates: '',

  };
  isupdated: any;
  countryname;
  countriesNm: any;
  countrycode: any;
  marker: any;
  markerselectedlocation: any;
  mapPolygon: any;
  isDrawingMode: boolean = false;
  citydatabasedata: any;
  page: number = 1;
  count: number = 0;
  tableSize: number = 3;
  tableSizes: any = [3, 6, 9, 12];
  p: number = 1;
  pageSize: any;
  isbuttonshow: boolean = true;


  // @ViewChild('mapContainer', { static: true }) mapContainer: ElementRef;
  // @ViewChild('locationInput', { static: false }) locationInput!: ElementRef<HTMLInputElement>;

  enteredLocation: string;
  map: any;
  drawingManager: any;
  polygon: any;
  isLocationInsidePolygon: boolean;
  message: string;
  autocompleteService: any;
  isPolygonDrawn: boolean = false;
  cityForm: any;
  searchQuery: string = '';
  constructor(private spinner: NgxSpinnerService, private fb: FormBuilder, private cityService: CityService, private countryService: CountryService, private toastr: ToastrService) {

  }
  getCountry() {
    this.countryService.getCountry(this.searchQuery).subscribe((res) => {
      this.countriesrcvd = res['countrydata'];
      console.log(this.countriesrcvd);

    });
  }

  ngOnInit() {
    this.spinner.show();
    setTimeout(() => {
      this.spinner.hide();
    }, 2000);
    this.getCountry();
    this.getCity();
    this.initMap();

  }
  getCity() {
    this.cityService.getCity().subscribe((res) => {
      this.citiesrcvd = res['citydata'];
    });
  }
  ngAfterViewInit() {
    // this.initAutocomplete();
  }
  onsubmitCityForm(form: NgForm) {
    if (this.isupdated) {
      console.log("edited");

      if (this.isPolygonDrawn) {
        const coordinates = this.polygon.getPath().getArray().map((point: any) => ({
          lat: point.lat(),
          lng: point.lng()
        }));
        // console.log("sdtfjgkyrtb");
        const updatedCity = {
          country_id: this.selectedCountry,
          city: this.enteredLocation,
          coordinates: coordinates
        };
        console.log(updatedCity, "updated city");


        this.cityService.updateCity(this.editingCityId, updatedCity).subscribe(
          (res) => {
            console.log(res);

            const index = this.citiesrcvd.findIndex(city => city._id === this.editingCityId);
            if (index !== -1) {
              this.citiesrcvd[index] = res.citydata;
            }
            this.getCity();
            this.toastr.success(res.message);
            this.polygon.setMap(null);
            this.marker.setMap(null);
            this.markerselectedlocation.setMap(null);
            this.isShow = !this.isShow;
          },
          (error) => {
            this.toastr.warning(error.error.message);
            // form.reset();
          });
      }
    }
    else {
      console.log("addedddd");

      if (this.isPolygonDrawn) {
        const coordinates = this.polygon.getPath().getArray().map((point: any) => ({
          lat: point.lat(),
          lng: point.lng()
        }));


        this.citydata.country_id = this.selectedCountry;
        this.citydata.city = this.enteredLocation;
        this.citydata.coordinates = coordinates
        console.log(this.citydata.country_id);
        console.log(this.citydata.city);
        console.log(this.citydata.coordinates);
        this.cityService.addCity(this.citydata).subscribe(
          (res) => {
            this.citiesrcvd.push(res['citydata']);
            this.toastr.success(res.message);
            this.isShow = !this.isShow;
            this.polygon.setMap(null);
            this.marker.setMap(null);
            this.markerselectedlocation.setMap(null);
          },
          (error) => {
            this.toastr.warning(error.error.message);
            console.log("addddddddddddddddddd");

            form.reset();
          });

      } else {
        this.toastr.warning('Please draw a polygon on the map before submitting the form.', 'Warning');
      }
    }
  }

  onCountrySelected() {
    console.log(this.selectedCountry, "idddd");
    this.isbuttonshow = false;

    const citiesInCountry = this.citiesrcvd.filter(city => city.country_id === this.selectedCountry);
    console.log(citiesInCountry);

    this.countriesrcvd.map((country: any) => {
      if (country._id === this.selectedCountry) {
        this.countryName = country.country
        // console.log(this.countryName);

      }
    })

    const selectedCountryData = this.countriesrcvd.find(country => country.country === this.countryName);
      console.log(selectedCountryData);

      this.countryname = selectedCountryData ? selectedCountryData.country : '';
      this.enteredLocation = '';
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address: this.countryName }, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK && results.length > 0) {
          const latitude = results[0].geometry.this.countryName.lat();
          const longitude = results[0].geometry.this.countryName.lng();
      
          // Do something with the coordinates
          console.log('Latitude:', latitude);
          console.log('Longitude:', longitude);
        } else {
          console.error('Geocode was not successful for the following reason:', status);
        }
      });
    // if (this.countryName) {
    //   const countryCoordinates = this.countryName.coordinates;
    //   console.log(countryCoordinates);
      
    //   const countryCenter = countryCoordinates[Math.floor(countryCoordinates.length / 2)]; // Assuming the center coordinate is at index Math.floor(countryCoordinates.length / 2)
    //   console.log(countryCenter);
    //   // Set the map center to the selected country's location
    //   if (countryCenter) {
    //     const centerLocation = {
    //       lat: countryCenter.lat,
    //       lng: countryCenter.lng
    //     };
    //     this.map.setCenter(centerLocation);
    //   }
    // }

    

    if (this.marker) {
      this.marker.setMap(null);
      this.marker = null;
    }

    if (this.markerselectedlocation) {
      this.markerselectedlocation.setMap(null);
      this.markerselectedlocation = null;
    }

    if (this.polygon) {
      this.polygon.setMap(null);
      this.polygon = null;
    }
    // this.initMap();
    this.displayCitiesOnMap(citiesInCountry);
    this.initAutocomplete();

  }

  displayCitiesOnMap(cities: any[]) {
    // Remove existing markers and polygons from the map
    if (this.polygon) {
      this.polygon.setMap(null);
      this.polygon = null;
    }
    if (this.marker) {
      this.marker.setMap(null);
      this.marker = null;
    }

    // Iterate over the cities and display their polygons
    for (const city of cities) {
      if (city.coordinates && city.coordinates.length > 0) {
        // Create a polygon for the city
        const cityPolygon = new google.maps.Polygon({
          paths: city.coordinates,
          editable: false,
          draggable: false,
          map: this.map,
        });

        // Add event listeners or customizations for the polygon if needed

        // Add the polygon to the map
        cityPolygon.setMap(this.map);
      }
    }
  }
  onAddBtnCity() {
    this.isShowAddBtn = true;
    this.isShowEditBtn = false;
    if (this.isShow) {
      this.isShow = this.isShow;
    }
    else {
      this.isShow = !this.isShow;
    }
  }

  initMap(): void {
    const mapOptions = {
      center: { lat: 22.309157, lng: 70.703702 },
      zoom: 12
    };
    const mapid = document.getElementById('map') as HTMLInputElement
    // this.map = new google.maps.Map(this.mapContainer.nativeElement, mapOptions);
    this.map = new google.maps.Map(mapid, mapOptions);


    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const currentLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        this.marker = new google.maps.Marker({
          position: currentLocation,
          map: this.map,
          title: 'Current Location'
        });
        this.map.setCenter(currentLocation);
      });
    }

    this.drawingManager = new google.maps.drawing.DrawingManager({
      drawingMode: google.maps.drawing.OverlayType.POLYGON,
      drawingControl: true,
      drawingControlOptions: {
        position: google.maps.ControlPosition.TOP_CENTER,
        drawingModes: [google.maps.drawing.OverlayType.POLYGON]
      },
      polygonOptions: {
        editable: true
      }
    });
    this.drawingManager.setMap(this.map);
    google.maps.event.addListener(this.drawingManager, 'overlaycomplete', (event) => {
      if (event.type === google.maps.drawing.OverlayType.POLYGON) {
        if (this.polygon) {
          this.polygon.setMap(null);
        }
        if (this.marker) {
          this.marker.setMap(null);
          this.marker = null;
        }
        if (this.markerselectedlocation) {
          this.markerselectedlocation.setMap(null);
          this.markerselectedlocation = null;
        }
        // this.markerselectedlocation.setMap(null);
        this.polygon = event.overlay;
        this.isPolygonDrawn = true;

        // google.maps.event.addListener(this.polygon.getPath(), 'set_at', () => {
        //   this.checkIfLocationInsidePolygon();
        // });

        // google.maps.event.addListener(this.polygon.getPath(), 'insert_at', () => {
        //   this.checkIfLocationInsidePolygon();
        // });

        // this.checkIfLocationInsidePolygon();
      }
    });
  }

  initAutocomplete(): void {
    // const autocompleteOptions = {
    //   types: ['(cities)'],
    //   componentRestrictions: { country:this.countrycode}
    // };
    const citylocation = document.getElementById("citylocation") as HTMLInputElement;
    const autocomplete = new google.maps.places.Autocomplete(citylocation);
    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (place && place.geometry && place.geometry.location) {
        this.enteredLocation = place.formatted_address;
        if (this.polygon) {
          this.polygon.setMap(null);
        }
        if (this.marker) {
          this.marker.setMap(null);
          // this.markerselectedlocation.setMap(null);
          this.marker = null;
        }
        if (this.markerselectedlocation) {
          this.markerselectedlocation.setMap(null);
          this.markerselectedlocation = null;
        }

        if (this.markerselectedlocation) {
          this.markerselectedlocation.setPosition(place.geometry.location);
          this.map.setCenter(place.geometry.location);
        }

        this.markerselectedlocation = new google.maps.Marker({
          position: place.geometry.location,
          map: this.map,
          title: 'Selected Location'
        });

        // if (this.marker) {
        //   this.marker.setPosition(place.geometry.location);
        this.map.setCenter(place.geometry.location);
        // }
      }
    });

    this.cityService.getCountriesName(this.countryname).subscribe((res) => {
      this.countriesNm = res;
      console.log(this.countriesNm);

      const selectedCountryName = this.countriesNm.find(country => country.country === this.selectedCountryNm);
      console.log(selectedCountryName);
      const countrycode = selectedCountryName ? selectedCountryName.cca2 : '';
      //  this.countrycode = this.countriesNm[0].cca2
      if (countrycode) {
        autocomplete.setTypes(['(cities)']);
        autocomplete.setComponentRestrictions({ country: countrycode });
      }
      console.log(countrycode);
    });
  }

  checkLocation(): void {
    if (this.polygon) {
      this.getLocationFromString(this.enteredLocation)
        .then((location: any) => {
          if (location) {
            const isInsidePolygon = google.maps.geometry.poly.containsLocation(location, this.polygon);
            if (isInsidePolygon) {
              this.toastr.success('Yes, your entered location belongs to the drawn zone.', 'Success');
            } else {
              this.toastr.error('Sorry! Entered location doesn\'t belong to the drawn zone.', 'Error');
            }
          } else {
            this.toastr.error('Invalid location entered.', 'Error');
          }
        })
        .catch((error: any) => {
          console.error(error);
          this.toastr.error('Error occurred while geocoding the location.', 'Error');
        });
    } else {
      this.toastr.warning('Please draw a polygon on the map first.', 'Warning');
    }
  }

  getLocationFromString(locationString: string): Promise<any> {
    const geocoder = new google.maps.Geocoder();
    return new Promise((resolve, reject) => {
      geocoder.geocode({ address: locationString }, (results, status) => {
        if (status === 'OK') {
          resolve(results[0].geometry.location);
        } else if (status === 'ZERO_RESULTS') {
          resolve(null);
        } else {
          reject(new Error('Geocode was not successful for the following reason: ' + status));
        }
      });
    });
  }


  onEditCity(cities: any) {

    this.isupdated = true;
    this.isPolygonDrawn = true
    this.isShowEditBtn = true;
    this.isShowAddBtn = false;
    if (this.isShow) {
      this.isShow = this.isShow;
    } else {
      this.isShow = !this.isShow;
    }

    this.selectedCountry = cities.country_id;
    this.enteredLocation = cities.city;
    console.log(this.selectedCountry, "sdfgjhknbfv");
    console.log(this.enteredLocation);

    this.editingCityId = cities._id;

    if (this.polygon) {
      this.polygon.setMap(null);
    }
    if (this.marker) {
      this.marker.setMap(null);
      // this.markerselectedlocation.setMap(null);
      this.marker = null;
    }
    if (this.markerselectedlocation) {
      this.markerselectedlocation.setMap(null);
      this.markerselectedlocation = null;
    }
    // this.markerselectedlocation.setMap(null);

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: this.enteredLocation }, (results, status) => {
      if (status === google.maps.GeocoderStatus.OK && results.length > 0) {
        const location = results[0].geometry.location;
        // Set the polygon coordinates on the map
        const coordinates = cities.coordinates.map((coordinate: any) => ({
          lat: coordinate.lat,
          lng: coordinate.lng
        }));
        //   console.log('Cities:', cities);
        console.log('Coordinates:', coordinates);
        this.polygon = new google.maps.Polygon({
          paths: coordinates,
          strokeColor: '#000000',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#000000',
          fillOpacity: 0.35,
          editable: true,
          draggable: true

        });
        this.polygon.setMap(this.map);

        this.markerselectedlocation = new google.maps.Marker({
          position: location,
          map: this.map,
          title: 'City Location'
        });

        //  this.markerselectedlocation.setMap(null);
        this.map.setCenter(location);
      }
    });
  }

  // updateMap(coordinates: any[]): void {
  //   const polygonPath = coordinates.map((coordinate: any) => ({
  //     lat: coordinate.lat,
  //     lng: coordinate.lng
  //   }));

  //   // Assuming you have a Google Maps instance available as 'map'
  //   const polygon = new google.maps.Polygon({
  //     paths: polygonPath,
  //     strokeColor: '#000000',
  //     strokeOpacity: 0.8,
  //     strokeWeight: 2,
  //     fillColor: '#000000',
  //     fillOpacity: 0.35,
  //     editable: true,
  //     draggable: true

  //   });
  //   polygon.setMap(this.map);

  //   const marker = new google.maps.Marker({
  //     position: polygonPath[0],
  //     map: this.map,
  //     title: 'City Location'
  //   });

  //   this.map.setCenter(polygonPath[0]);
  //   this.drawingManager.setMap(this.map);
  // }


  onPageChange(event: any): void {
    this.page = event;
    this.getCity();
  }

  onPageSizeChange(event: any): void {
    this.tableSize = event.target.value;
    this.page = 1;
    this.getCity();
  }
  onCancelBtn(form: NgForm) {
    this.isShow = !this.isShow;
    form.reset();
    this.polygon.setMap(null);
    // this.editingVehiclePricing = null;
    this.isShowAddBtn = false;
    this.isShowEditBtn = false;
  }

}
