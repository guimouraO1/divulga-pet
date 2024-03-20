import { Component, ViewChild } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import {
  MatPaginator,
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import {
  Observable,
  Subject,
  firstValueFrom,
  lastValueFrom,
  of,
  take,
  takeUntil,
} from 'rxjs';
import { Pet } from '../../models/pet.model';
import { AsyncPipe, CommonModule } from '@angular/common';
import { PetService } from '../../services/pet.service';
import { SkeletonModule } from 'primeng/skeleton';
import { User } from '../../models/user.model';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-find-pet',
  standalone: true,
  imports: [
    FormsModule,
    MatIconModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatDividerModule,
    MatListModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatSelectModule,
    CommonModule,
    AsyncPipe,
    SkeletonModule,
    ConfirmPopupModule,
    ToastModule,
  ],
  templateUrl: './find-pet.component.html',
  styleUrl: './find-pet.component.scss',
  providers: [ConfirmationService, MessageService],
})
export class FindPetComponent {
  protected petList: Pet[] = [];
  protected updatedListPet$: Observable<Pet[]> | undefined;
  private destroy$ = new Subject<void>();
  protected pageSize: number = 3; // Tamanho da página
  protected currentPage: number = 1; // Página atual
  protected totalItems: number = 0;
  protected totalPet: number = 0;
  protected user!: User;
  protected offset = 0;
  protected limit = 9;
  protected pageIndex = 0;
  protected pet: any = {
    species: '',
    status: '',
  };
  pageSizeOptions = [3, 6];
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;

  constructor(
    private authService: AuthService,
    private petService: PetService,
    private route: ActivatedRoute,
    private router: Router,
    public messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  async ngOnInit() {
    this.subscribeToUserChanges();
    this.route.queryParamMap.subscribe(async (params) => {
      this.pet.status = params.get('status');
      this.pet.species = params.get('species');
      await this.getPublications(true);
    });
  }

  private subscribeToUserChanges(): void {
    this.authService
      .User$()
      .pipe(takeUntil(this.destroy$))
      .subscribe((user: any) => {
        this.user = user;
      });
  }

  async getPublications(clearList: boolean = false) {
    try {
      if (clearList) {
        this.petList = [];
        this.offset = 0;
        this.pageIndex = 0;
        this.currentPage = 1;
        this.paginator.firstPage();
      }
      if (this.petList.length > 0 && this.petList.length === this.totalPet) {
        console.log('Final da lista');
        return;
      }

      const res: any = await lastValueFrom(
        this.petService.getPublications(this.pet, this.offset, this.limit)
      );

      const petList: Pet[] = res.publications;
      this.totalPet = res.totalItems;
      console.log(petList);
      this.petList.push(...petList);
      this.totalItems = this.petList.length;
      this.updateupdatedListPet$();
    } catch (error) {}
  }

  async pageChange(event: PageEvent) {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    if (this.currentPage === Math.ceil(this.totalItems / this.pageSize)) {
      this.offset += this.limit;
      await this.getPublications();
    }

    this.updateupdatedListPet$();
  }

  updateupdatedListPet$() {
    let filteredList = this.petList;

    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;

    // Ajuste para garantir que a quantidade de animais por página seja consistente
    const remainingItems = filteredList.length - startIndex;
    this.updatedListPet$ =
      remainingItems >= this.pageSize
        ? of(filteredList.slice(startIndex, endIndex))
        : of(filteredList.slice(startIndex));

    // Atualize o comprimento total da lista para a variável totalItems
    this.totalItems = filteredList.length;

    return this.updatedListPet$;
  }

  filter(event: any, filter: any) {
    if (filter === 'status') {
      this.pet.status = event.value;
    }
    if (filter === 'species') {
      this.pet.species = event.value;
    }

    const queryParams = {
      status: this.pet.status,
      species: this.pet.species,
    };

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParams,
      queryParamsHandling: 'merge',
    });
  }

  async rescuePet(userId: any, postPetId: string) {
    if (this.user.id === userId){
      this.messageService.add({
        severity: 'warn',
        summary: 'Error',
        detail: 'You cannot redeem in your own post',
        life: 3000,
      });
      return;
    } 

    try {
      await firstValueFrom(this.petService.rescuePet(userId, postPetId));
      this.messageService.add({
        severity: 'info',
        summary: 'Confirmed',
        detail: 'You have accepted',
        life: 3000,
      });
      setTimeout(() => {
        this.router.navigate(['/chat',  userId]);
      }, 3000);

    } catch (error: any) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: error.error,
        life: 3000,
      });
      console.log(error);
    }
         
    //   this.chatService.sentNewFriendship(
    //   this.user.id,
    //   user.id,
    //   this.user.name,
    //   idFriendship
    // );

    // user.idFriendship = idFriendship;
    // this.friendListRequestSent.push(user);
    // this.filteredFriendList = this.friendList;
  }

  confirm1(event: Event, userId: any, postPetId: string) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Are you sure you want to rescue this pet?',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        await this.rescuePet(userId, postPetId);
      },
      reject: () => {
        this.messageService.add({
          severity: 'warn',
          summary: 'Cancel',
          detail: 'You canceled the redemption',
          life: 3000,
        });
      }
    });
  }
  
}
