import { Injectable } from '@angular/core';
import { User } from '../models/user.model';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})

export class UserService {
  private urlApi = `${environment.url}`;

  constructor(public authService: AuthService, private http: HttpClient) {}

  getUser(): Observable<User[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('authorization', `${token}`);

    return this.http.get<User[]>(`${this.urlApi}/user/auth`, { headers });
  }

  profilePic(filename: any): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('authorization', `${token}`);
    console.log(filename);
    return this.http.post(`${this.urlApi}/upload`, { filename: filename }, { headers });
  }

  updateProfile(userForm: User) {
    console.log(userForm);
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('authorization', `${token}`);

    return this.http.put(`${this.urlApi}/user`, userForm, { headers });
  }

  getUserByID(user: any) {
    return this.http.get(`${this.urlApi}/userH/${ user }`);
  }
}
