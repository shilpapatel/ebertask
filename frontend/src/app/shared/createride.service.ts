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
export class CreaterideService {
  baseURL = 'http://localhost:5000/api';
  headers = new HttpHeaders().set('Content-Type', 'application/json');
  formData: any[];
  constructor(private http: HttpClient) {}
  getCreateRide() {
    return this.http.get(`${this.baseURL}/get-createride`);
  }
  addRide(rideData:any) {
    return this.http.post(`${this.baseURL}/add-ride`, rideData);
  }
}
