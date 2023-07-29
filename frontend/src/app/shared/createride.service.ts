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
  getRideHistoryWithoutPagination() {
    return this.http.get(`${this.baseURL}/get-ridehistorywithoutpaginaton`);
  }
  getRideHistory(page: number, pageSize: number, searchQuery: string, sortField: string, sortOrder: string,paymentFilter: string,statusFilter: string,vehicleTypeFilter: string,fromFilter: string,toFilter: string,startDateFilter:string,endDateFilter:string): Observable<any> {
      const params = {
        page: page.toString(),
        pageSize: pageSize.toString(),
        searchQuery: searchQuery,
        sortField: sortField,
        sortOrder: sortOrder,
        paymentFilter:paymentFilter,
        statusFilter:statusFilter,
        vehicleTypeFilter:vehicleTypeFilter,
        fromFilter:fromFilter,
        toFilter:toFilter,
        startDateFilter:startDateFilter,
        endDateFilter:endDateFilter
      };
    return this.http.get(`${this.baseURL}/get-ridehistory`, {params});
  }
  addRide(rideData:any) {
    return this.http.post(`${this.baseURL}/add-ride`, rideData);
  }
  updateRideFeedbackData(feedbackData:any){
    return this.http.put(`${this.baseURL}/update-ridefeedback`, feedbackData);
  }
  getUserDetails(phone:string){
    return this.http.get(`${this.baseURL}/get-userdetails`, { params: { phone: phone } });
  }
}
