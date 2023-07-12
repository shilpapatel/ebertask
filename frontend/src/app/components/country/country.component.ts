import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CountryService } from 'src/app/shared/country.service';
import { Country } from 'src/app/shared/country.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-country',
  templateUrl: './country.component.html',
  styleUrls: ['./country.component.css']
})
export class CountryComponent implements OnInit {
  countryForm: FormGroup;
  countries: any;
  currencyCodes:any
  callingCodes: string[] = [];
  countrydata: Country = {
        country: '',
        timezone: '',
        currency: '',
        code: '',
        flag: ''
      };

  countriesrcvd: any[] = [];
  isShow = false;

  searchQuery: string = '';
  // isModalShow = true;
  constructor(private fb: FormBuilder, private countryService: CountryService,private toastr: ToastrService) { }

  ngOnInit() {
    this.countryForm = this.fb.group({
      country: ['', Validators.required],
      timezone: ['', Validators.required],
      currency: ['', Validators.required],
      code: ['', Validators.required],
      flag: ['', Validators.required]
    });

    this.countryService.getCountries().subscribe((countries) => {
      this.countries = countries;
      // console.log(this.countries);
      
      // this.callingCodes = this.countries.map((country) => country.callingCodes).flat();
      // this.callingCodes = this.countries.idd.root + this.countries.idd.suffixes[0]
      // console.log(this.callingCodes);
      
    });

    this.getCountry();
  }

  getCountry() {
    this.countryService.getCountry(this.searchQuery).subscribe((res) => {
      this.countriesrcvd = res['countrydata'];
    });
  }

  onSearch() {
    console.log('Search query:', this.searchQuery);
    this.getCountry();
  }
  clearSearch(): void {
    this.searchQuery = '';
    this.onSearch();
  }
  onAddBtnCountry() {
    this.countryForm.reset();
    this.isShow = !this.isShow;
  }
  onSubmitCountryForm() {
   
    //  if (this.countryForm.valid) {
      if(this.countryForm.invalid){
        this.countryForm.markAllAsTouched();
        return;
      }
      else{
      const formValue = this.countryForm.value;
      const countryData: Country = {
        country: formValue.country,
        timezone: formValue.timezone,
        currency: formValue.currency,
        code: formValue.code,
        flag: formValue.flag
      };

    //   var formData: any = new FormData();

    // formData.append('country', this.countryForm.value.country);
    // formData.append('timezone', this.countryForm.value.timezone);
    // formData.append('currency', this.countryForm.value.currency);
    // formData.append('code', this.countryForm.value.code);
    // formData.append('flag', this.countryForm.value.flag);
      this.countryService.addCountry(countryData).subscribe(
        (res:any) => {
        console.log('formdata',countryData);
        
        this.countriesrcvd.push(res['countryAdded']);
        this.toastr.success(res.message)
      },
      (error) => {
        this.toastr.warning(error.error.message);
      });

      this.isShow = !this.isShow;
      // this.isModalShow = false;
      // const modal = document.getElementById('exampleModal')
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
      this.countryForm.reset();     
      
    }
  }

  onCountrySelected() {
    const selectedCountryData = this.countries.find(country => country.name.common === this.countryForm.value.country);

    if (selectedCountryData) {
      this.countryForm.patchValue({
        timezone: selectedCountryData.timezones[0],
        code: selectedCountryData.idd.root + selectedCountryData.idd.suffixes[0],
        flag: selectedCountryData.flags.png
      });

      const currencies = selectedCountryData.currencies;
      console.log(currencies);
      

      if (currencies) {
        this.currencyCodes = Object.values(currencies)[0];
        this.countryForm.patchValue({
          currency: this.currencyCodes.symbol
        });
      } else {
        this.countryForm.patchValue({
          currency: ''
        });
      }
    } 

  }

  onCancelBtn() {
    // this.countryForm.reset(); // Reset the form fields
    this.isShow = false; // Hide the form container
  }
}



// import { Component, OnInit } from '@angular/core';
// import { FormGroup, FormBuilder, Validators } from '@angular/forms';
// import { CountryService } from 'src/app/shared/country.service';
// import { NgForm } from '@angular/forms';
// import { Country } from 'src/app/shared/country.model';
// // declare const bootstrap: any;


// @Component({
//   selector: 'app-country',
//   templateUrl: './country.component.html',
//   styleUrls: ['./country.component.css']
// })
// export class CountryComponent implements OnInit{

//   // countryForm: FormGroup;
//   countries;
//   countriesrcvd: any[] = [];
//   isShow = false;
//   selectedCountry: string;
//   timezone: string;
//   currency:string;
//   currencyCode:string;
//   code:string;
//   flag:string;
//   countrydata: Country = {
//     country: '',
//     timezone: '',
//     currency: '',
//     code: '',
//     flag: ''
//   };
  
//   constructor(private fb: FormBuilder, private countryService: CountryService) { 
    
//   }
//   getCountry() {
//     this.countryService.getCountry().subscribe((res) => {
//       this.countriesrcvd = res['countrydata'];
//     });
//   }
//   ngOnInit() {
//     this.countryService.getCountries().subscribe((countries) => {
//       this.countries = countries; 
//     });
//     this.getCountry();
//   }
//   onAddBtnCountry() {
//     this.isShow = !this.isShow;
//   }
//   onsubmitCountryForm(form:NgForm){
//     this.countrydata.country = this.selectedCountry;
//   this.countrydata.timezone = this.timezone;
//   this.countrydata.currency = this.currency;
//   this.countrydata.code = this.code;
//   this.countrydata.flag = this.flag;

//   this.countryService.addCountry(this.countrydata).subscribe(() => {
//     // Handle success or other actions if needed
//   });
//     // this.countryService.addCountry(form.value).subscribe( {
//     //   // this.countries = countries; 
//     // });
//     this.isShow = !this.isShow;
//   }
//   onCountrySelected() {
//     const selectedCountryData = this.countries.find(country => country.name.common === this.selectedCountry);
//     this.timezone = selectedCountryData ? selectedCountryData.timezones[0]   : '';
//     this.code = selectedCountryData ? selectedCountryData.idd.root + selectedCountryData.idd.suffixes[0]  : '';
//     this.flag = selectedCountryData ? selectedCountryData.flags.png : '';

//     //  const currencies = selectedCountryData.currencies;
//     //  const currencyCodes = Object.keys(currencies);
//     // this.currency =selectedCountryData ? selectedCountryData.currencyCodes.symbol:'';
       
//     if (selectedCountryData) {
//       const currencies = selectedCountryData.currencies;
//       if (currencies) {
//         const currencyCodes:any = Object.values(currencies)[0];
//         this.currency = currencyCodes.symbol;
//       } else {
//         this.currency = '';
//       }
//     } else {
//       this.currency = '';
//     }
//   }
//   // getFlagImagePath(country: string): string {
//   //   const selectedCountryData = this.countries.find(item => item.name.common === country);
//   //   return selectedCountryData ? selectedCountryData.flags.png : '';
//   // }
  
// }


