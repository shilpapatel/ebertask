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
export class VehicletypeService {
  baseURL = 'http://localhost:5000/api';
  headers = new HttpHeaders().set('Content-Type', 'application/json');
  formData: any[];
  constructor(private http: HttpClient) {}
  // Get Users
  getVehicleType() {
    return this.http.get(`${this.baseURL}/get-vehicletype`);
  }
// Create User
  addVehicleType(vehicletypedata:any) {
    return this.http.post(`${this.baseURL}/create-vehicletype`, vehicletypedata);
  }
  updateVehicleType(vehicletypedata: any) {
    return this.http.put(`${this.baseURL}/update-vehicletype`, vehicletypedata);
  }
  
  // Error handling
  errorMgmt(error: HttpErrorResponse) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // Get client-side error
      errorMessage = error.error.message;
    } else {
      // Get server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.log(errorMessage);
    return throwError(() => {
      return errorMessage;
    });
  }
}