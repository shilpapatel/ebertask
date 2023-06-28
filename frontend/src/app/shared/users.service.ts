import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import {
  HttpHeaders,
  HttpErrorResponse,
  HttpClient,
  HttpParams,
} from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class UsersService {
  baseURL = 'http://localhost:5000/api';
  headers = new HttpHeaders().set('Content-Type', 'application/json');
  formData: any[];
  // userdata: Users = {
  //   name: '',
  //   email: '',
  //   phone: '',
  //   profile: ''
  // };
  constructor(private http: HttpClient) {}

  // getUser() {
  //   return this.http.get(`${this.baseURL}/get-users`);
  // }
  getUser(page: number, pageSize: number, searchQuery: string, sortField: string, sortOrder: string): Observable<any> {
    const params = {
      page: page.toString(),
      pageSize: pageSize.toString(),
      searchQuery: searchQuery,
      sortField: sortField,
    sortOrder: sortOrder
    };

    return this.http.get<any>(`${this.baseURL}/get-users`, { params });
  }
  // Create User
  addUsers(userdatas:any) {
    return this.http.post(`${this.baseURL}/add-user`, userdatas);
  }
  updateUser(userdatas:any) {
    return this.http.put(`${this.baseURL}/update-user`, userdatas);
  }
  // addUsers(name: string, email: string, phone: string, profile: File): Observable<any> {
  //   var formData: any = new FormData();
  //   formData.append('name', name);
  //   formData.append('email', email);
  //   formData.append('phone', phone);
  //   formData.append('profile', profile);
    
  //   return this.http.post<any>(`${this.baseURL}/add-users`, formData, {
  //     reportProgress: true,
  //     observe: 'events',
  //   });
  // }
   deleteUser(userId: string): Observable<any> {
    return this.http.delete(`${this.baseURL}/delete-user/${userId}`);
  }
}