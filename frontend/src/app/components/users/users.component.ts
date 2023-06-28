import { Component, Input } from '@angular/core';
import { HttpClient, HttpEvent } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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

  currentPage: number = 1;
  totalPages: number = 0;
  pageSize: number = 3;
  searchQuery: string = '';
  sortOrder: string = 'asc'; 
  sortField: string = 'name';

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

// async onDeleteUser(userId: string) {
//   if (confirm('Are you sure you want to delete this user?')) {
//     try {
//       const res = await this.usersservice.deleteUser(userId).toPromise();
//       console.log(res);
//       this.getUser();
//     } catch (err) {
//       console.log(err);
//     }
//   }
// }

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
onCardClick(){
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
}


