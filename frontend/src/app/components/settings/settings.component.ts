import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CountryService } from 'src/app/shared/country.service';
import { SettingsService } from 'src/app/shared/settings.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  requesttime: string;
  maxstops: string;
  _id: string;
  settingsdata: any[] = [];
  editingSettings: any;
  rideForm: FormGroup;


  constructor(private fb: FormBuilder, public router: Router, private settingsService: SettingsService,
    private toastr: ToastrService, private http: HttpClient) {
    this.rideForm = this.fb.group({
      requesttime: ['10'],
      maxstops: ['1']
    });
  }

  ngOnInit() {
    this.getSetting();
    // this.updateSettings()
  }
  getSetting() {
    this.settingsService.getSetting().subscribe(
      (res) => {

        this.settingsdata = res['settingsdata'];
        this._id =  this.settingsdata[0]._id
        console.log(this._id);
      },
      error => {
        console.error('Error fetching settings:', error);
      }
    );
  }
  submitForm() {
    const updatedSettings = {
      requesttime: this.rideForm.value.requesttime,
      maxstops: this.rideForm.value.maxstops,
    };
  
    if (this._id) {
      this.settingsService.updateSetting(this._id, updatedSettings).subscribe(
        (response: any) => {
          this.toastr.success(response.message);
        },
        (error: any) => {
          console.error('Error:', error);
          this.toastr.error('Failed to update settings');
        }
      );
    }
      // else {
        // Create new record
        // this.settingsService.addSetting(updatedSettings).subscribe(
        //   (response: any) => {
        //     this.toastr.success('Settings added successfully');
        //     this._id = response._id;
        //     // Additional logic after successful creation
        //   },
        //   (error: any) => {
        //     console.error('Error:', error);
        //     this.toastr.error('Failed to add settings');
        //   }
        // );
      // }
    }
  }
