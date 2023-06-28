import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import {  HttpHeaders,HttpErrorResponse,HttpClient } from '@angular/common/http';
import { Country } from './country.model';

@Injectable({
  providedIn: 'root'
})
export class CountryService {

  private apiUrl = 'https://restcountries.com/v3.1';
// private apiUrl = '/api';
  baseURL = 'http://localhost:5000/api';
  headers = new HttpHeaders().set('Content-Type', 'application/json');
  formData: any[];

  constructor(private http: HttpClient) {}
  
  getCountries() {
    return this.http.get(`${this.apiUrl}/all`);
  }

  
  // Create country
  addCountry(countrydata: Country) {
    console.log('abcdsvfd',countrydata);
    return this.http.post<Country>(`${this.baseURL}/country`, countrydata);
  }

  getCountry(searchQuery: string): Observable<any> {
    const params = {
      searchQuery: searchQuery,
    };
    return this.http.get(`${this.baseURL}/country`, { params });
  }
  searchCountry(name: string) {
    return this.http.get(`${this.apiUrl}/${name}`);
  }
}
 