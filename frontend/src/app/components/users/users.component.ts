import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { HttpClient, HttpEvent } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { Stripe } from '@stripe/stripe-js';
import { loadStripe } from '@stripe/stripe-js';

// import { HttpEvent, HttpEventType } from '@angular/common/http';
import { Router } from '@angular/router';
import { UsersService } from 'src/app/shared/users.service';
// import { Users } from 'src/app/shared/users.model';
import { ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CountryService } from 'src/app/shared/country.service';
// import { Country } from 'src/app/shared/country.model';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent {
  isShow = false;
  countries: any;
  isShowAddBtn = false;
  isShowEditBtn= false
  usersForm: FormGroup;
  userdatas: any[] = [];
  editingUser: any;
  callingCodes: string[] = [];
  countriesrcvd: any[] = [];

  currentPage: number = 1;
  totalPages: number = 0;
  pageSize: number = 3;
  searchQuery: string = '';
  sortOrder: string = 'asc'; 
  sortField: string = 'name';


  stripe: any;
  data:any
  @Output() dialogClosed = new EventEmitter<string>();
  form: any;
  messageContainer: any;
  elements: any;
  paymentElement: any;
  handleError: any;
  AddCardUser: any = false;
  addcard: any = false;
  cardList: any;
  id: any;
  cardlist: any = true;
  result: any;
  defaultcardid: any;
  customersdata: any;

  @ViewChild('cardModal') cardModal!: ElementRef;

  // userdata: Users = {
  //   name: '',
  //   email: '',
  //   phone: '',
  //   profile: ''
  // };
  constructor(private http: HttpClient,private formBuilder: FormBuilder, private countryService: CountryService, public router: Router, public usersservice: UsersService,private toastr: ToastrService) {
    this.usersForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      code:['',[Validators.required]],
      phone: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
      profile: [null, [Validators.required]]
    })
  }
  // getUser() {
  //   this.usersservice.getUser().subscribe((res) => {
  //     this.userdatas = res['userdata'];
  //     console.log(this.userdatas);
      
  //   });
  // }
  getUser() {
    this.usersservice
      .getUser(this.currentPage, this.pageSize, this.searchQuery,this.sortField,this.sortOrder)
      .subscribe((res) => {
        this.userdatas = res['userdata'];
        this.totalPages = res['totalPages'];
        this.currentPage = res['currentPage'];
      });
  }

  generatePageArray(): number[] {
    return Array(this.totalPages).fill(0).map((_, index) => index + 1);
  }

  onSearch() {
    console.log('Search query:', this.searchQuery);
    this.currentPage = 1; // Reset to the first page when searching
    this.getUser();
  }
  clearSearch(): void {
    this.searchQuery = '';
    this.onSearch();
  }
  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
    this.getUser();
  }
  
  goToPage(page: number): void {
    this.currentPage = page;
    this.getUser();
  }
  // Function to go to the next page
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
    this.getUser();
  }

  onSort() {
    this.currentPage = 1; // Reset to the first page when sorting
    this.getUser();
  }
  
  ngOnInit(): void {
    // this.countryService.getCountries().subscribe((countries) => {
    //   this.countries = countries;
    //   // console.log(this.countries);
    //   this.countries.forEach((country:any) => { 
    //     if (country.idd.suffixes) {
    //       const countrycode = country.idd.root + country.idd.suffixes[0]
    //       // console.log( country.idd.suffixes[0]);
    //       this.callingCodes.push(countrycode);
          
    //     }
    //   });
    // });
    this.countryService.getCountry(this.searchQuery).subscribe((res) => {
      this.countriesrcvd = res['countrydata'];
      this.countriesrcvd.forEach((country:any) => { 
        // if (country.idd.suffixes) {
          const countrycode = country.code
          // console.log( country.idd.suffixes[0]);
          this.callingCodes.push(countrycode);
          
        // }
      });


    });
    this.getUser();
  }

  onAddBtnUser() {
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
    const maxSize = 5 * 1024 * 1024; // 5MB
     if (file.size > maxSize) {
       this.usersForm.get('profile').setErrors({ maxSize: true });
       this.toastr.error("please select size less than 5 mb")
       return;
     }

     const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
     if (!allowedTypes.includes(file.type)) {
       this.usersForm.get('profile').setErrors({ invalidType: true });
       this.toastr.error("please select jpg png jpeg format")
       return;
     }
    this.usersForm.patchValue({
      profile: file
    });
    // this.userForm.get('profile').updateValueAndValidity();
  }

  onSubmit() {
    var formData: any = new FormData();
    formData.append('name', this.usersForm.value.name);
    formData.append('email', this.usersForm.value.email);
    formData.append('phone', this.usersForm.value.phone);
    formData.append('code', this.usersForm.value.code);
    formData.append('profile', this.usersForm.value.profile);
    if (this.editingUser) {
      // Updating an existing vehicle
      formData.append('id', this.editingUser._id);

      this.usersservice.updateUser(formData).subscribe(res => {
        // Update the edited vehicle in the vehicles array
        const index = this.userdatas.findIndex(v => v._id === this.editingUser._id);
        this.userdatas[index] = res['UserUpdated'];
        this.toastr.success('User Updated ')
        // this.router.navigate([], { skipLocationChange: true });
        this.editingUser = null;
        this.usersForm.reset();
        //  this.getUser();
      });
    } else {
      // Adding a new vehicle
      this.usersservice.addUsers(formData).subscribe(res=> {
        this.userdatas.push(res['userCreated']);
        this.toastr.success('User Added ')
         this.getUser();

         
        // this.router.navigate(['users']);
      })
    }
    this.isShow = !this.isShow;
  }


onEditUser(user: any, event: Event) {
  event.preventDefault();
  // this.isShow = !this.isShow;
  this.editingUser = user;
  const slicephone = user.phone.slice(-10)
  const slicecode = user.phone.slice(0,-10)
  this.usersForm.patchValue({
    name: user.name,
    email: user.email,
    phone: slicephone,
    code:slicecode,
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


onDeleteUser(userId: string, event: Event) {
  event.preventDefault();
  if (confirm('Are you sure you want to delete this user?')) {
    this.usersservice.deleteUser(userId).subscribe(
      (res) => {
        console.log(res);
        this.getUser();
      },
      (err) => {
        console.log(err);
      }
    );
  }
}


// handleError(error: any) {
//   // Handle the error according to your application's needs
//   console.error('An error occurred:', error);
//   // Perform any additional error handling actions
// }

  onCardClick(userId: string){
    this.id = userId
    // this.AddCardDetails(this.id) 
    // this.AddCard(this.id)
     this.getCard(this.id)
   }

  async AddCard( id:any) {
    console.log(id);
    
    this.cardlist = false;
    this.stripe = await loadStripe("pk_test_51NObn2BQlJgbeIPVDnE96vIkSEi49vOF3vQEBazaLYwOs6L1LdAfIsC8w8uZTsBjBOmWcmJYsr9VazeXdSZuTti500MZxo1uou");
    // setTimeout(() => {  
    this.elements = this.stripe.elements();
      console.log(this.elements);
      
      this.paymentElement = this.elements.create("card")
      await this.paymentElement.mount("#card-element");
    // },1000)
    this.AddCardUser = true;
    this.addcard = true;
  }

   async AddCardDetails(userId: any) {

    console.log(userId);

    try {
      setTimeout(() => { 
      if (!this.elements || !this.paymentElement) {
        throw new Error("Elements object is not initialized.");
      }
  
      const submitResult = this.elements.submit();
      const { error: submitError } = submitResult;
  
      if (submitError) {
        console.log(submitError);
        // this.handleError(submitError);
        return;
      }
    },1000)
    // Create the SetupIntent and obtain clientSecret
    const response = await fetch(`http://localhost:5000/api/create-intent/${this.id}`, {
        method: 'POST',
      });
      const { client_secret: clientSecret } = await response.json();

      const { paymentMethod, error } = await this.stripe.createPaymentMethod({
        type: 'card',
        card: this.paymentElement,
      });
  
      if (error) {
        console.log(error);
        return;
      }
  
      const { error: confirmError } = await this.stripe.confirmCardSetup(clientSecret, {
        payment_method: paymentMethod.id,
      });
  
      if (confirmError) {
        console.log(confirmError);
      } else {
         this.getCard(this.id);
        console.log("Successfully confirmed setup.");
        this.toastr.success("Card added successfully!");
        this.AddCardUser = false;
        this.cardlist = true;
      }
    } catch (error) {
      console.log(error);
    }

  }

  getCard(userId: string) {
    this.http.get(`http://localhost:5000/api/get-card/${this.id}`)
      .subscribe(
        (response) => {
          console.log(response);
          // Handle the retrieved data
           this.cardList = response;
          // Process the paymentMethods array as needed
        },
        (error) => {
          console.error('Error:', error);
          // Handle the error
        }
      );
  }

  async deleteCard(cardId: any) {
    const confirmDelete = confirm("Are you sure you want to delete this card?");
    if (confirmDelete) {
      try {
        const response = await this.http.delete(`http://localhost:5000/api/delete-card/${cardId}`).toPromise();
  
        if (response && response['message'] === 'Card deleted successfully') {
          this.getCard(this.id);
          this.toastr.success("Card deleted successfully!");
        } else {
          throw new Error("Failed to delete card");
        }
      } catch (error) {
        console.error(error);
        this.toastr.error("Failed to delete card", "");
      }
    }
  }
  // async deleteCard(cardId: any) {
  //   const deletecard = confirm("Are You Want To Delete Card????");
  //   if (deletecard) {
  //     this.http
  //       .get(`http://localhost:5000/userslist/delete-card/${cardId}`)
  //       .subscribe(
  //         (data) => {
  //           // Handle the retrieved data
  //           this.getCard(this.id)
  //           this.toastr.error("Deleted Succesfully!!", "");
  //         },
  //         (error) => {
  //           console.error("Error:", error);
  //           // Handle the error
  //         }
  //       );
  //   }
  // }
  // async SetDefault(val: any, cardid: any) {
  //   console.log(val);
  //   console.log(cardid);
  //   this.http
  //     .patch(`http://localhost:5000/userslist/default-card/${val}`, { cardid })
  //     .subscribe(
  //       (data) => {
  //         console.log(data);
  //         // Handle the retrieved data
  //         this.getcard();
  //       },
  //       (error) => {
  //         console.error("Error:", error);
  //         // Handle the error
  //       }
  //     );
  // }
}


// prevPage() {
//   if (this.currentPage > 1) {
//     this.currentPage--;
//     this.filterUsers();
//   }
// }

// nextPage() {
//   if (this.currentPage < this.totalPages) {
//     this.currentPage++;
//     this.filterUsers();
//   }
// }

// filterUsers() {
//   let filteredUsers = this.userdatas;

//   if (this.searchText.trim() !== '') {
//     filteredUsers = filteredUsers.filter(user => {
//       return user.name.toLowerCase().includes(this.searchText.toLowerCase());
//     });
//   }

//   this.totalPages = Math.ceil(filteredUsers.length / this.pageSize);
//   const startIndex = (this.currentPage - 1) * this.pageSize;
//   const endIndex = startIndex + this.pageSize;
//   this.paginatedUsers = filteredUsers.slice(startIndex, endIndex);
// }



//stripe integration

// import { data } from "jquery";
// import { HttpClient } from "@angular/common/http";
// import { Component, EventEmitter, Inject, OnInit, Output } from "@angular/core";
// import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
// import { loadStripe } from "@stripe/stripe-js";
// import { ToastrService } from "ngx-toastr";

// @Component({
//   selector: "app-cards",
//   template: `
//     <div class="card m-3">
//       <div *ngIf="cardlist">
//         <!-- <div ngIf="cardlist"> -->
//         <div class="row m-2 p-2" *ngFor="let card of cardList">
//           <div class="card p-1 globebox">
//             <span
//               class="badge badge-pill badge-success position-absolute px-2"
//               *ngIf="card.id == defaultcardid"
//               >Default</span
//             >
//             <!-- <button
//               mat-button
//               (click)="DeleteCard(card.id)"
//               style="position: absolute;right:0 "
//             >
//               <mat-icon class="mat-18">delete</mat-icon>
//             </button> -->
//             <div class="example-button-container">
//               <button
//                 mat-fab
//                 color="warn"
//                 aria-label="Example icon button with a delete icon"
//                 (click)="DeleteCard(card.id)"
//                 style="position:absolute;right:0px;height:30px;width:30px;font-size: 10px;margin:5px;top:8px;"
//               >
//                 <mat-icon>delete</mat-icon>
//               </button>
//             </div>
//             <div class="d-flex justify-content-center align-center">
//               <div
//                 class="align-center w-50 d-flex justify-content-center align-center"
//               >
//                 <img
//                   src="../assets/logo/visa.svg"
//                   alt=""
//                   class="img-thumbnail card border border-success p-1"
//                   style="height: 60px;width:120px;margin:auto 0;"
//                 />
//               </div>
//               <div class="text-center w-50">
//                 <p>xxxx xxxx xxxx {{ card.card.last4 }}</p>
//                 <p>Expiration Month: {{ card.card.exp_month }}</p>
//                 <p>Expiration Year: {{ card.card.exp_year }}</p>
//                 <!-- Add more card details as needed -->
//               </div>
//             </div>
//             <div class="text-center" *ngIf="card.id != defaultcardid">
//               <!-- <button
//                 class="btn btn-success btn-rounded m-2"
//                 (click)="SetDefault(card.customer, card.id)"
//               >
//                 Set Default
//               </button> -->
//               <div class="example-button-container">
//                 <button
//                   mat-fab
//                   color="basic"
//                   aria-label="Example icon button with a bookmark icon"
//                   style="position:absolute;right:0px;height:30px;width:30px;font-size: 10px;margin:5px;top:55px;background-color:lightgreen"
//                   (click)="SetDefault(card.customer, card.id)"
//                 >
//                   <mat-icon>account_balance</mat-icon>
//                 </button>
//               </div>
//             </div>

//             <!-- <button
//               class="btn btn-danger btn-rounded m-2"
//               (click)="DeleteCard(card.id)"
//             >
//               Delete
//             </button> -->
//           </div>
//         </div>
//         <!-- </div> -->
//         <input type="text" value="{{ data.id }}" #id hidden />
//       </div>
//       <form id="payment-form">
//         <div id="card-element">
//           <!-- Elements will create form elements here -->
//         </div>

//         <div class="text-center">
//           <button
//             id="submit"
//             class="btn btn-success btn-rounded m-2"
//             (click)="AddCardDetails(id)
// "
//             *ngIf="addcard"
//           >
//             Add
//           </button>
//         </div>
//         <div class="text-center">
//           <button
//             id="submit"
//             class="btn btn-info btn-rounded m-2"
//             (click)="AddCard(id.value)"
//           >
//             Add Card
//           </button>
//           <button
//             mat-button
//             mat-dialog-close
//             class="btn btn-info btn-rounded m-2"
//           >
//             Close
//           </button>
//         </div>
//         <div id="error-message">
//           <!-- Display error message to your customers here -->
//         </div>
//       </form>
//       <div></div>
//     </div>
//   `,
//   styleUrls: ["./cards.component.scss"],
// })
// export class CardsComponent implements OnInit {
//   stripe: any;
//   @Output() dialogClosed = new EventEmitter<string>();
//   form: any;
//   messageContainer: any;
//   elements: any;
//   paymentElement: any;
//   handleError: any;
//   AddCardUser: any = false;
//   addcard: any = false;
//   cardList: any;
//   Userdata!: DialogData;
//   id: any;
//   cardlist: any = true;
//   result: any;
//   defaultcardid: any;
//   customersdata: any;
//   async ngOnInit() {
//     console.log(this.data);
//     this.id = this.data.id;
//     this.getcard();
//   }
//   constructor(
//     public dialogRef: MatDialogRef<CardsComponent>,
//     private toaster: ToastrService,
//     private http: HttpClient,
//     @Inject(MAT_DIALOG_DATA) public data: DialogData
//   ) {}
//   async AddCard(val: any) {
//     this.cardlist = false;
//     this.stripe = await loadStripe(
//       "pk_test_51NBaQISBFTafl90RGOHxPwdTrMqYMydbzDsDcJG7BXYYNOhAnnKFQUd0ZnIeSRO7ZpeGeh1TOXgxi4UEIWAKQuxz00Q9fgpwt1"
//     );
//     setTimeout(() => {
//       // this.vehiclelist()-
//       const options = {
//         mode: "setup",
//         currency: "usd",
//         appearance: {},
//       };
//       // Set up Stripe.js and Elements to use in checkout form, passing the client secret obtained in step 3
//       this.elements = this.stripe.elements(options);
//       this.paymentElement = this.elements.create("payment", {
//         layout: {
//           type: "accordion",
//           defaultCollapsed: false,
//           radios: true,
//           spacedAccordionItems: false,
//         },
//       });
//       // Create and mount the Payment Element
//       this.paymentElement.mount("#card-element");
//     }, 1000);
//     this.AddCardUser = true;
//     this.addcard = true;
//   }
//   async getcard() {
//     if (this.data.customerid.customerid != null) {
//       if (this.cardlist) {
//         this.http
//           .get(`http://localhost:5000/userslist/get-customer/${this.data.id}`)
//           .subscribe(
//             (data) => {
//               console.log(data);
//               this.customersdata = data;
//               this.defaultcardid = this.customersdata.invoice_settings.default_payment_method;
//             },
//             (error) => {
//               console.error("Error:", error);
//               // Handle the error
//             }
//           );
//         this.http
//           .get(`http://localhost:5000/userslist/get-card/${this.id}`)
//           .subscribe(
//             (data) => {
//               console.log(data);
//               // Handle the retrieved data
//               this.result = data;
//               this.cardList = this.result.data;
//               console.log(this.cardList);
//             },
//             (error) => {
//               console.error("Error:", error);
//               // Handle the error
//             }
//           );
//       }
//     }
//   }
//   async AddCardDetails(val: any) {
//     const { error: submitError } = await this.elements.submit();
//     if (submitError) {
//       console.log(submitError);
//       this.handleError(submitError);
//       return;
//     }

//     // Create the SetupIntent and obtain clientSecret
//     const res = await fetch(
//       `http://localhost:5000/userslist/create-intent/${val}`,
//       {
//         method: "POST",
//       }
//     );

//     const { client_secret: clientSecret } = await res.json();

//     // Confirm the SetupIntent using the details collected by the Payment Element
//     const { error } = await this.stripe.confirmSetup({
//       elements: this.elements,
//       clientSecret,
//       confirmParams: {
//         return_url: "http://localhost:4200/dashboard/users",
//       },
//     });

//     if (error) {
//       this.handleError(error);
//     } else {
//       console.log("elsee from comfornmmm setup");

//       // this.isAddCard = false
//       this.toaster.success("Card added successfully!");
//       this.AddCardUser = false;
//       this.cardlist = true;
//       // this.router.navigate(['/users'])
//       // Your customer is redirected to your `return_url`. For some payment
//       // methods like iDEAL, your customer is redirected to an intermediate
//       // site first to authorize the payment, then redirected to the `return_url`.
//     }
//   }
//   async DeleteCard(val: any) {
//     const deletecard = confirm("Are You Want To Delete Card????");
//     if (deletecard) {
//       this.http
//         .get(`http://localhost:5000/userslist/delete-card/${val}`)
//         .subscribe(
//           (data) => {
//             // Handle the retrieved data
//             this.getcard();
//             this.toaster.error("Deleted Succesfully!!", "");
//           },
//           (error) => {
//             console.error("Error:", error);
//             // Handle the error
//           }
//         );
//     }
//   }
//   async SetDefault(val: any, cardid: any) {
//     console.log(val);
//     console.log(cardid);
//     this.http
//       .patch(`http://localhost:5000/userslist/default-card/${val}`, { cardid })
//       .subscribe(
//         (data) => {
//           console.log(data);
//           // Handle the retrieved data
//           this.getcard();
//         },
//         (error) => {
//           console.error("Error:", error);
//           // Handle the error
//         }
//       );
//   }
// }

// export interface DialogData {
//   title: string;
//   id: String;
//   customerid: any;
// }