import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import {
  HttpHeaders,
  HttpErrorResponse,
  HttpClient,
} from '@angular/common/http';
import { VehiclePricing } from './vehiclepricing.model';

@Injectable({
  providedIn: 'root'
})
export class VehiclepricingService {
  baseURL = 'http://localhost:5000/api';
  headers = new HttpHeaders().set('Content-Type', 'application/json');
  formData: any[];
  
  constructor(private http: HttpClient) {}

  getVehiclePricing() {
    return this.http.get(`${this.baseURL}/get-vehicleprice`);
  }
  // Create User
  addVehiclePricing(vehiclepricingdata:VehiclePricing) {
    return this.http.post<VehiclePricing>(`${this.baseURL}/add-vehicleprice`, vehiclepricingdata);
  }
  updateVehiclePricing(vehiclepricingId: string, vehiclepricingdata: VehiclePricing): Observable<VehiclePricing> {
    return this.http.put<VehiclePricing>(`${this.baseURL}/update-vehicleprice/${vehiclepricingId}`, vehiclepricingdata);
  }
  // updateVehiclePricing(vehiclepricingdata:VehiclePricing) {
  //   return this.http.put<VehiclePricing>(`${this.baseURL}/update-vehicleprice`, vehiclepricingdata);
  // }
  
   deleteVehiclePricing(vehiclepricingId: string): Observable<any> {
    return this.http.delete(`${this.baseURL}/delete-vehicleprice/${vehiclepricingId}`);
  }
}