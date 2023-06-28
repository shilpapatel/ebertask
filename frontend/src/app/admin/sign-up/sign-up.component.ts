import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService } from 'src/app/shared/admin.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';


@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent implements OnInit {
  // emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  adminSignUpForm!: FormGroup; // Add the "!" operator to indicate it will be initialized


  constructor(private formBuilder: FormBuilder,public adminService: AdminService,private toastr: ToastrService,private router : Router) {}

  ngOnInit() {
    this.adminSignUpForm = this.formBuilder.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(4)]]
    });
  }

  onSubmit() {

    this.adminService.addAdmin(this.adminSignUpForm.value).subscribe(
      res => {
        this.toastr.success('Admin Added Successfully')
        this.router.navigateByUrl('/signin');
        this.resetForm();
        
      },
      err => {
        if (err.status === 422) {
          this.toastr.error(err.error.join('<br/>'));
        }
        else
        this.toastr.error('Something went wrong.Please contact admin.');
      }
    );
  }

  resetForm() {
    this.adminService.selectedAdmin = {
      name: '',
      email: '',
      password: ''
    };
    this.adminSignUpForm.reset();
}
}