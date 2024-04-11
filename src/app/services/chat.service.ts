import { EventEmitter, Injectable, Output } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject, Observable, lastValueFrom, takeLast } from 'rxjs';
import { MessagesInterface } from '../models/messages.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../environments/environment';
import { Friends } from '../models/friends.model';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  @Output() newMessageEmmiterId = new EventEmitter<string>();

  private socket!: Socket;
  private urlApi = `${environment.url}`;
  private recipient$ = new BehaviorSubject({
    id: '',
    name: '',
    profilePic: '',
    idFriendship: ''
  });

  constructor(private http: HttpClient) {}

  getFriendById(id: any): Observable<User[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('authorization', `${token}`);

    return this.http.get<User[]>(`${this.urlApi}/user/${id}`, { headers });
  }

  returnRecipient$() {
    return this.recipient$.asObservable();
  }

  addNewRecipient(recipientId: string, recipientName: string, recipientProfilePic: string, idFriendship: string) {
    this.recipient$.next({
      id: recipientId,
      name: recipientName,
      profilePic: recipientProfilePic,
      idFriendship: idFriendship
    });
  }

  connect(user: any) {
    try {
      this.socket = io('ws://localhost:3000', {
        query: { user: JSON.stringify(user) },
      });
    } catch (error) {
      // console.log('Cannot connect to websocket');
    }
  }

  sendMessage(
    message: string,
    authorMessageId: string,
    recipientId: string,
    time: Date,
    type: string,
    friendshipId: string
  ) {
    this.socket.emit('message', {
      message,
      authorMessageId,
      recipientId,
      time,
      type,
      friendshipId
    });
  }

  getMessagesDb(
    recipient: Friends,
    offset: number,
    limit: number
  ): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('authorization', `${token}`);

    // Adicione o recipientId, offset e limit como parâmetros na URL
    const url = `${this.urlApi}/messages?recipientId=${recipient.id}&friendshipId=${recipient.idFriendship}&offset=${offset}&limit=${limit}`;

    return this.http.get(url, { headers });
  }

  updateMessageAsRead(
    authorMessageId: string,
    recipientId: string
  ): Observable<any> {
    const url = `${this.urlApi}/messages`;
    const data = { authorMessageId: authorMessageId, recipientId: recipientId };

    return this.http.put(url, data);
  }

  privateMessageListener(): Observable<MessagesInterface> {
    return new Observable((observer) => {
      // Escute as mensagens recebidas do servidor
      this.socket.on('private-message', (message: any) => {
        observer.next(message);
      });

      // Limpe os recursos quando o observador é cancelado
      return () => {
        this.socket.disconnect();
      };
    });
  }

  newFriendsRequestsListener(): Observable<any> {
    return new Observable((observer) => {
      // Escute as mensagens recebidas do servidor
      this.socket.on('friendship', (message: any) => {
        observer.next(message);
      });

      // Limpe os recursos quando o observador é cancelado
      return () => {
        this.socket.disconnect();
      };
    });
  }

  rescueListener(): Observable<any> {
    return new Observable((observer) => {
      // Escute as mensagens recebidas do servidor
      this.socket.on('newRescue', (message: any) => {
        observer.next(message);
      });

      // Limpe os recursos quando o observador é cancelado
      return () => {
        this.socket.disconnect();
      };
    });
  }

  connectedUsersListener(): Observable<MessagesInterface> {
    return new Observable((observer) => {
      // Escute as mensagens recebidas do servidor
      this.socket.on('connectedUsers', (message: any) => {
        observer.next(message);
      });

      // Limpe os recursos quando o observador é cancelado
      return () => {
        this.socket.disconnect();
      };
    });
  }

  socketdisconnect() {
    this.socket.disconnect();
  }
}
