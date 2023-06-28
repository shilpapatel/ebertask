import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import {
  HttpHeaders,
  HttpErrorResponse,
  HttpClient,
} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  baseURL = 'http://localhost:5000/api';
  headers = new HttpHeaders().set('Content-Type', 'application/json');
  formData: any[];

  constructor(private http: HttpClient) {}

  getSetting() {
    return this.http.get(`${this.baseURL}/get-settings`);
  }
  // Create User
  // addSetting(settingsdata:any) {
  //   return this.http.post(`${this.baseURL}/add-settings`, settingsdata);
  // }
  
  updateSetting(settingsId: string, settingsdata: any) {
    return this.http.put(`${this.baseURL}/update-settings/${settingsId}`, settingsdata);
  }
  
  //  deleteSetting(settingsId: string): Observable<any> {
  //   return this.http.delete(`${this.baseURL}/delete-settings/${settingsId}`);
  // }
}