import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../environments/environment';
import { Friends } from '../models/friends.model';

@Injectable({
  providedIn: 'root',
})
export class FriendsService {
  private urlApi = `${environment.url}`;
  private friendListSubject: BehaviorSubject<Friends[]> = new BehaviorSubject<Friends[]>([]);

  constructor(public authService: AuthService, private http: HttpClient) {}

  getFriends(): Observable<Friends[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('authorization', `${token}`);

    return this.http.get<Friends[]>(`${this.urlApi}/friends`, { headers });
  }

  returnFriendList() {
    return this.friendListSubject.asObservable();
  }

  updateFriendList(friendList: Friends[]) {
    this.friendListSubject.next(friendList);
  }

  sendFriendRequest(friendUserId: string, postPetId: string): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('authorization', `${token}`);

    return this.http.post(`${this.urlApi}/friends`, {friendUserId, postPetId}, { headers });
  }
}
