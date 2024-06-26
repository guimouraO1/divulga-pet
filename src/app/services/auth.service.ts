import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../environments/environment';
import { BehaviorSubject, Subject, firstValueFrom, lastValueFrom, take } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  _isAuthenticated: boolean = false;
  private urlApi = `${environment.url}`;
  private disableButton = new Subject<boolean>();
  private user!: any;
  private userSubject: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);

  constructor(private http: HttpClient, private router: Router) {}


  User$() {
    return this.userSubject.asObservable();
  }

  changeUser(user: any) {
    this.userSubject.next(user);
  }

  async login(loginForm: {}) {
    this.disableButton.next(true);
    try {
      const res: any = await firstValueFrom(this.http.post(`${this.urlApi}/login`, loginForm).pipe(take(1)));
      this._isAuthenticated = true;
      localStorage.setItem('token', res.authToken);
      this.router.navigate(['findPet']);
      this.changeUser(res.user);
      return res;
    } catch (error: any) {
      return error;
    } finally {
      this.disableButton.next(false);
    }
  }

  async register(registerForm: {}) {
    this.disableButton.next(true);
    try {
      const res: any = await firstValueFrom(this.http.post(`${this.urlApi}/register`, registerForm).pipe(take(1)));
	  return res;
    } catch (error: any) {
		return error;
    } finally {
      this.disableButton.next(false);
    }
  }

  async asycUserAuthentication() {
    const authToken = localStorage.getItem('token');
    const headers = new HttpHeaders().set('authorization', `${authToken}`);
    try {
      const user = await firstValueFrom(this.http.get(`${this.urlApi}/user/auth`, { headers }).pipe(take(1)));
      this.user = user;
      this.changeUser(this.user);
      this._isAuthenticated = true;
      return true;
    } catch (e) {
      this._isAuthenticated = false;
      return false;
    }
  }

  async _isAuthUser(): Promise<boolean> {
    await this.asycUserAuthentication();
    return this._isAuthenticated;
  }

  getUser() {
    return this.user;
  }

  getEventEmitter() {
    return this.disableButton.asObservable();
  }
}
