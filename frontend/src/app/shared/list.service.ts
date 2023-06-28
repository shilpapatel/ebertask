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
export class ListService {
  baseURL = 'http://localhost:5000/api';
  headers = new HttpHeaders().set('Content-Type', 'application/json');
  formData: any[];

  constructor(private http: HttpClient) {}

  getDriverwithoutpage() {
    return this.http.get(`${this.baseURL}/get-driverswithoutpage`);
  }

  getDriver(page: number, pageSize: number, searchQuery: string, sortField: string, sortOrder: string): Observable<any> {
    const params = {
      page: page.toString(),
      pageSize: pageSize.toString(),
      searchQuery: searchQuery,
      sortField: sortField,
    sortOrder: sortOrder
    };

    return this.http.get<any>(`${this.baseURL}/get-drivers`, { params });
  }

  // getDriverByCityAndVehicleType(cityId: string, vehicleTypeId: string) {
  //   const url = `${this.baseURL}/drivers/${cityId}/${vehicleTypeId}`;
  //   return this.http.get(url);
  // }
  // Create User
  addDrivers(driverdata:any) {
    return this.http.post(`${this.baseURL}/add-driver`, driverdata);
  }

  updateDriver(driverdata:any) {
    return this.http.put(`${this.baseURL}/update-driver`, driverdata);
  }
  updateStatus(driverId: string,driverstatus:any) {
    return this.http.put(`${this.baseURL}/update-status/${driverId}`, {driverstatus});
  }
  
  updateType(driverId: string,type:any) {
    return this.http.put(`${this.baseURL}/update-type/${driverId}`, type);
  }
  // updateType(type:any) {
  //   return this.http.put(`${this.baseURL}/update-type`, type);
  // }
  
   deleteDriver(driverId: string): Observable<any> {
    return this.http.delete(`${this.baseURL}/delete-driver/${driverId}`);
  }
}