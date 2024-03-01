import { EventEmitter, Injectable, OnInit, Output } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { MessagesInterface } from '../models/messages.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})

export class ChatService implements OnInit {
  
  private socket: Socket;
  protected user: any;
  private urlApi = `${environment.url}`;
  private connected: boolean = false;

  @Output() newMessageEmmiterId = new EventEmitter<string>();
  @Output() recipientId = new EventEmitter<string>();

  constructor(private http: HttpClient) {
     this.socket = io('ws://localhost:3000');
  }
  ngOnInit(): void {
    this.connected = false;
  }

  connect(user: any) {
    // console.log(user);
    // console.log(!this.connected)
    if (!this.connected) {
      this.socket.emit("userJoin", user);
      this.connected = true;
      return;
    }
    // console.log("User already logged in");
  }

  sendMessage(
    message: string,
    authorMessageId: string,
    recipientId: string,
    time: Date
  ) {
    this.socket.emit('message', {
      message,
      authorMessageId,
      recipientId,
      time,
    });
  }

  getMessagesDb(
    recipientId: any,
    offset: number,
    limit: number
  ): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('authorization', `${token}`);

    // Adicione o recipientId, offset e limit como parâmetros na URL
    const url = `${this.urlApi}/messages?recipientId=${recipientId}&offset=${offset}&limit=${limit}`;

    return this.http.get(url, { headers });
  }

  updateMessageAsRead(
    authorMessageId: string,
    recipientId: string
  ): Observable<any> {
    const url = `${this.urlApi}/messages`;
    const data = {
      authorMessageId: authorMessageId,
      recipientId: recipientId,
    };

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

  socketdisconnect(){
    this.connected = false;
    this.socket.disconnect().connect();
  }

}
