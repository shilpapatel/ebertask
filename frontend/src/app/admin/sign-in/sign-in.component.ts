import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AdminService } from 'src/app/shared/admin.service';
@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css']
})
export class SignInComponent implements OnInit {
  // emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  adminSignInForm!: FormGroup; // Add the "!" operator to indicate it will be initialized

  constructor(private formBuilder: FormBuilder,private adminService: AdminService,private router : Router,private toastr: ToastrService) {}

  ngOnInit() {
    this.adminSignInForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(4)]]
    });

    if(this.adminService.isLoggedIn())
    this.router.navigateByUrl('/adminpanel');
  }
  

  onSubmit()
  {
    if(this.adminSignInForm.invalid){
      this.adminSignInForm.markAllAsTouched();
      return;
    }
    else{
      this.adminService.login(this.adminSignInForm.value).subscribe( 
        res =>{
         console.log(res,"afdgfgh");
         
         this.adminService.setToken(res['token']);
         this.toastr.success('Login Successfully');
         this.router.navigateByUrl('/adminpanel/dashboard');
         // this.toastr.error(res.error.message);
   
      },
      err =>{
        console.log("err: ", err.error)
        this.toastr.error(err.error);
   
      });
    }
   
  }

}