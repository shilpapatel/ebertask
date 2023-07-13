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
      maxstops: ['1'],
      twilioacoountsid : ['ACb44d005c170946735f2e9a3280b96aab'],
      twilioauthtoken:['db965c28b6ab4012ad67085ed3571f03'],
      nodemaileremail:['ari.hartmann@ethereal.email'],
      nodemailerpassword:['mEgbgUtBfUpZkZVbmd'],
      stripepublickey:['pk_test_51NObn2BQlJgbeIPVDnE96vIkSEi49vOF3vQEBazaLYwOs6L1LdAfIsC8w8uZTsBjBOmWcmJYsr9VazeXdSZuTti500MZxo1uou'],
      stripesecretkey:['sk_test_51NObn2BQlJgbeIPVzCyHaca669BS3YrGmlGoSQNFIahLk6xyFc1pH5utU9GO9a78duDiyPxiCD95SneKT1Utj5oD006hxweLrL']



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
      twilioacoountsid: this.rideForm.value.twilioacoountsid,
      twilioauthtoken: this.rideForm.value.twilioauthtoken,
      nodemaileremail: this.rideForm.value.nodemaileremail,
      nodemailerpassword: this.rideForm.value.nodemailerpassword,
      stripepublickey: this.rideForm.value.stripepublickey,
      stripesecretkey: this.rideForm.value.stripesecretkey
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
