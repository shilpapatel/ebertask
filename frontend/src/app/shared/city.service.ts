import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import {  HttpHeaders,HttpErrorResponse,HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CityService {
  private apiUrl = 'https://restcountries.com/v3.1';
  baseURL = 'http://localhost:5000/api';
  headers = new HttpHeaders().set('Content-Type', 'application/json');
  formData: any[];

  constructor(private http: HttpClient) {}
  
  getCountriesName(countrynm:any) {
    return this.http.get(`${this.apiUrl}/name/${countrynm}`);
    // https://restcountries.com/v3.1/name/{name}
  }
  addCity(citydata: any) {
    console.log(citydata);
    return this.http.post<any>(`${this.baseURL}/city`, citydata);
  }

  getCity() {
    return this.http.get(`${this.baseURL}/city`);
  }

  updateCity(cityId: string, cityData: any): Observable<any> {
    return this.http.put<any>(`${this.baseURL}/city/${cityId}`, cityData);
  }

}
