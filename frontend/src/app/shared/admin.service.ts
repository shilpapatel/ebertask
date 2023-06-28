import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Admin } from './admin.model';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  apiBaseUrl= 'http://localhost:5000/api'
  selectedAdmin: Admin = {
    name: '',
    email: '',
    password: ''
  };

  noAuthHeader = { headers: new HttpHeaders({ 'NoAuth': 'True' }) };
  constructor(private http: HttpClient) { }

 //HttpMethods

 addAdmin(admin: Admin){
  return this.http.post(this.apiBaseUrl+'/signup',admin,this.noAuthHeader);
}

login(admin: Admin) {
  return this.http.post(this.apiBaseUrl+'/signin', admin,this.noAuthHeader);
}

getAdminPanel() {
  return this.http.get(this.apiBaseUrl + '/adminpanel');
}


//Helper Methods

setToken(token: string) {
  localStorage.setItem('token', token);
}

getToken() {
  return localStorage.getItem('token');
}

deleteToken() {
  localStorage.removeItem('token');
}

// getUserPayload() {
//   var token = this.getToken();
//   if (token) {
//     var userPayload = atob(token.split('.')[1]);
//     return JSON.parse(userPayload);
//   }
//   else
//     return null;
// }

// isLoggedIn() {
//   var userPayload = this.getUserPayload();
//   if (userPayload)
//     return userPayload.exp > Date.now() / 1000;
//   else
//     return false;
// }
isLoggedIn() {
  // var userPayload = this.getUserPayload();
  if (localStorage.getItem('token'))
    return true;
  else
    return false;
}

}
