import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterOutlet } from '@angular/router';
import { UserService } from '../../services/user.service';
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
  
  protected hide: boolean = true;

  protected onlineFriends: Friends[] = [];
  protected friendList: Friends[] = [];
  protected filteredFriendList: Friends[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private friendsService: FriendsService,
    private router: Router,
    private chatService: ChatService,
    public dialog: MatDialog,
    public messageService: MessageService
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

    // this.messageService.add({
    //   severity: 'success',
    //   summary: 'Login Success',
    //   detail: `Welcome back ${this.user.name}`,
    //   life: 3000,
    // });
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
        this.onlineFriends = connectedUsersArray;
      });
  }

  async getFriends() {
    try {
      const friends: Friends[] = await firstValueFrom(
        this.friendsService.getFriends()
      );
      this.friendList = friends.filter(
        (friend) => friend.status === 'Accepted'
      );

      await Promise.all(this.friendList.map(async (friend) => {
          await this.getMessages(friend, 0, 10);
        })
      );
      console.log(this.friendList)
      this.filteredFriendList = this.friendList;
      this.friendsService.updateFriendList(this.friendList);
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

  /// MELHORAR URGENTEMENTE
  isFrindConnected(friend: Friends): boolean {
    console.log('s')
    if (!this.onlineFriends) {
      return false;
    }
    return this.onlineFriends.some((userConnected: any) => {
      return userConnected === friend.id;
    });
  }

  // After reading a new message read = 'true' on the message that have already been read.
  async updateMessageAsRead(authorMessageId: string, recipientId: string) {
    await firstValueFrom(this.chatService.updateMessageAsRead(authorMessageId, recipientId));
  }

  // When click on a friend card it takes you to chat with that user.
  goToUser(recipient: Friends) {
    try {
      this.updateMessageAsRead(recipient.id, this.user.id);
    } catch (error) {}
    this.chatService.addNewRecipient(recipient.id, recipient.name);
    // Checks if userId is present in newMessagesId.
    if (this.newMessages.has(recipient.id)) {
      // Remove userId to newMessagesId.
      this.newMessages.delete(recipient.id);
    }
    // Checks if recipient is your friend.
    this.router.navigate(['chat', recipient.id]);
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

  // acceptNgFriendship(event: Event, friend: Friends) {
  //   this.confirmationService.confirm({
  //     target: event.target as EventTarget,
  //     message: 'Are you sure you want to accept this friend request?',
  //     icon: 'pi pi-exclamation-triangle',
  //     accept: async () => {
  //       this.messageService.add({
  //         severity: 'success',
  //         summary: 'Confirmed',
  //         detail: `You have accepted ${friend.name}`,
  //         life: 4000,
  //       });
  //       await this.acceptFriendship(friend);
  //     },
  //     reject: () => {
  //       this.messageService.add({
  //         severity: 'error',
  //         summary: 'Canceled',
  //         detail: `You have canceled the action`,
  //         life: 4000,
  //       });
  //     },
  //   });
  // }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
