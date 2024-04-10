import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterOutlet } from '@angular/router';
import { Subject, firstValueFrom, takeUntil } from 'rxjs';
import { AsyncPipe, CommonModule } from '@angular/common';
import { MessagesComponent } from '../../components/messages/messages.component';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat.service';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MessagesInterface } from '../../models/messages.model';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Friends } from '../../models/friends.model';
import { FriendsService } from '../../services/friends.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { AuthService } from '../../services/auth.service';
import { DialogModule } from 'primeng/dialog';
import { InputTextareaModule } from 'primeng/inputtextarea';
import {MatRadioModule} from '@angular/material/radio';
import { PetService } from '../../services/pet.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    MatMenuModule,
    FormsModule,
    MatInputModule,
    MatIconModule,
    CommonModule,
    MessagesComponent,
    RouterOutlet,
    MatButtonModule,
    MatBadgeModule,
    AsyncPipe,
    MatDialogModule,
    MatTooltipModule,
    ConfirmPopupModule,
    ToastModule,
    DialogModule,
    InputTextareaModule,
    MatRadioModule
   ],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
  providers: [ConfirmationService, MessageService],
})
export class ChatComponent implements OnInit, OnDestroy {
  private recipient: any;
  protected user: any;
  protected newMessages: Map<any, any> = new Map();
  
  protected searchInput: string = '';
  
  protected visibleModal: boolean = false;
  protected hide: boolean = true;

  protected onlineFriends: Friends[] = [];
  protected friendList: Friends[] = [];
  protected filteredFriendList: Friends[] = [];
  protected friendListRescuers: Friends[] = [];

  protected rescuedUser: Friends| undefined;
  private destroy$ = new Subject<void>();
  protected happyText: string = '';

  protected modalRadioButton: boolean = false;

  constructor(
    private authService: AuthService,
    private friendsService: FriendsService,
    private router: Router,
    private chatService: ChatService,
    public dialog: MatDialog,
    public messageService: MessageService,
    private petService: PetService
  ) {
    this.subscribeToUserChanges();
    this.subscribeToRecipientChanges();
  }

  async ngOnInit() {
    // Get your user infos. ex: user.name, user.email, user.id
    await this.connectUser();
    // Get all friends. ex: user.name, user.email, user.id
    await this.getFriends();
    // Listens for new messages from socket.io
    this.fetchMessages();
    // Listens for new messages from newMessageEmmiter and newMessageEmmiterId.
    this.setupMessageListeners();

    this.connectedUsersListener();
    // this.rescueListener();
  }


  protected petRescued(friend: Friends){
    this.rescuedUser = friend;
    this.visibleModal = true;
  }

  async rescueToUser(userRescue: Friends) {
    try {
      if (this.happyText.trim() === '') {
        this.messageService.add({
          severity: 'warn',
          summary: 'Error',
          detail: 'Por favor digite uma mensagem para continuar',
          life: 3000,
        });
        return; 
      }
      this.modalRadioButton = false;
      await firstValueFrom(this.petService.rescueToHappyStories(userRescue, this.happyText));

      this.filteredFriendList = this.friendList.filter((friend) => friend.id !== userRescue.id);
      this.friendListRescuers.push(userRescue);
      this.visibleModal = false;

      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Pet resgatado!',
        life: 3000,
      });
      this.modalRadioButton = true;
    
    } catch (error) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Error',
        detail: 'Ocorreu um erro durante o resgate, tente novamente',
        life: 3000,
      });
      return; 
    }
  }
  
  private subscribeToUserChanges(): void {
    this.authService
      .User$()
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => (this.user = user));
  }

  private subscribeToRecipientChanges(): void {
    this.chatService
      .returnRecipient$()
      .pipe(takeUntil(this.destroy$))
      .subscribe((recipient) => {
        this.recipient = recipient;
      });
  }

  async connectUser() {
    try {
      this.chatService.connect(this.user);
      this.connectedUsersListener();
    } catch (e) {
      //
    }
  }

  connectedUsersListener() {
    this.chatService
      .connectedUsersListener()
      .pipe(takeUntil(this.destroy$))
      .subscribe((onlineFriends: any) => {
        const connectedUsersArray = JSON.parse(onlineFriends);
        this.friendList.map((friend) => {
          if (connectedUsersArray.includes(friend.id)) {
            friend.online = true;
          } else {
            friend.online = false;
          }
        });
        this.friendListRescuers.map((friend) => {
          if (connectedUsersArray.includes(friend.id)) {
            friend.online = true;
          } else {
            friend.online = false;
          }
        });
        });
  }

  async getFriends() {
    try {
      const friends: Friends[] = await firstValueFrom(this.friendsService.getFriends());
      this.friendList = friends.filter((friend) => friend.status === 'Accepted');
      this.friendListRescuers = friends.filter((friend) => friend.status === 'Rescued');

      await Promise.all(this.friendList.map(async (friend) => {
          await this.getMessages(friend, 0, 10);
        })
      );

      this.filteredFriendList = this.friendList;
      const allFriends = [...this.friendList, ...this.friendListRescuers];
      this.friendsService.updateFriendList(allFriends);
    } catch (error) {
      console.error('Error while fetching friends:', error);
    }
  }

  // When logging in, or refreshing the page, it takes the last message, if it has message.read = false means there is a new message that has not been read.
  async getMessages(
    recipient: Friends,
    offset: number,
    limit: number
  ): Promise<void> {
    try {
      const messages = await firstValueFrom(this.chatService.getMessagesDb(recipient, offset, limit));
      messages.forEach((message: MessagesInterface) => {
        if (message.read === 'false') {
          this.newMessages.set(message.authorMessageId,
            (this.newMessages.get(message.authorMessageId) || 0) + 1);
        }
      });
    } catch (error) {
      console.error('Error while fetching messages:', error);
    }
  }

  // Listen to private messages in real time (socket.io). If there are new ones add newMessageId (newMessageId = author Message ) to the array.
  fetchMessages(): void {
    this.chatService
      .privateMessageListener()
      .pipe(takeUntil(this.destroy$))
      .subscribe((message: any) => {
        if (message.authorMessageId !== this.user) {
          this.chatService.newMessageEmmiterId.emit(message.authorMessageId);
          return;
        }
      });
  }

  // Listens for new messages from newMessageEmmiterId. If the array contains the id of a specific friend, it means that there are new messages from that friend.
  setupMessageListeners() {
    this.chatService.newMessageEmmiterId
      .pipe(takeUntil(this.destroy$))
      .subscribe((newMessageId: string) => {
        this.newMessages.set(newMessageId,
          (this.newMessages.get(newMessageId) || 0) + 1
        );
      });
  }

  // After reading a new message read = 'true' on the message that have already been read.
  async updateMessageAsRead(authorMessageId: string, recipientId: string) {
    await firstValueFrom(this.chatService.updateMessageAsRead(authorMessageId, recipientId));
  }

  // When click on a friend card it takes you to chat with that user.
  goToUser(friend: Friends) {
    try {
      this.updateMessageAsRead(friend.id, this.user.id);
    } catch (error) {}
    this.chatService.addNewRecipient(friend.id, friend.name, friend.userFilename, friend.idFriendship);
    // Checks if userId is present in newMessagesId.
    if (this.newMessages.has(friend.id)) {
      // Remove userId to newMessagesId.
      this.newMessages.delete(friend.id);
    }
    // Checks if recipient is your friend.
    this.router.navigate(['chat', friend.idFriendship]);
  }

  searchFriendFunc() {
    if (this.searchInput.trim() == '') {
      this.filteredFriendList = this.friendList;
      return;
    }
    this.filteredFriendList = this.friendList.filter((friend) =>
      friend.name.toLowerCase().includes(this.searchInput.toLowerCase())
    );
  }

  changeHide() {
    this.hide = !this.hide;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
