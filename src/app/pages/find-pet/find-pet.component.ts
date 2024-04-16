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
import { ChatService } from '../../services/chat.service';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {ClipboardModule} from '@angular/cdk/clipboard';
import {MatTooltipModule} from '@angular/material/tooltip';

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
    MatInputModule,
    MatFormFieldModule,
    ClipboardModule,
    MatTooltipModule
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
  protected searchId = '';
  protected pet: any = {
    species: '',
    status: '',
    id: ''
  };
  pageSizeOptions = [3, 6];
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;

  constructor(
    private authService: AuthService,
    private petService: PetService,
    private route: ActivatedRoute,
    private router: Router,
    public messageService: MessageService,
    private confirmationService: ConfirmationService,
    private chatService: ChatService
  ) {}

  async ngOnInit() {
    this.paginator._intl.itemsPerPageLabel="Publicações por página";
    this.subscribeToUserChanges();
    this.route.queryParamMap.subscribe(async (params) => {
      this.pet.status = params.get('status');
      this.pet.species = params.get('species');
      this.pet.id = params.get('id');
      await this.getPublications(true);
    });
  }

  private subscribeToUserChanges(): void {
    this.authService
      .User$()
      .pipe(takeUntil(this.destroy$))
      .subscribe( async (user: any) => {
        this.user = user;
        await this.connectUser();
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
        return;
      }

      const res: any = await lastValueFrom(
        this.petService.getPublications(this.pet, this.offset, this.limit, 'find')
      );
      console.log(res)
      
      const petList: Pet[] = res.publications;
      this.totalPet = res.totalItems;

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
    if (filter === 'id') {
      this.pet.id = event;
    }

    const queryParams = {
      status: this.pet.status,
      species: this.pet.species,
      id: this.pet.id
    };
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParams,
      queryParamsHandling: 'merge',
    });
  }

  async connectUser() {
    try {
      this.chatService.connect(this.user);
    } catch (e) {
      //
    }
  }
  
  async rescuePet(pet: Pet) {
    if (this.user.id === pet.user_id){
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Você não pode resgatar em sua própria postagem',
        life: 3000,
      });
      return;
    } 

    try {
      const friendshipId: any = await firstValueFrom(this.petService.rescuePet(pet));
      this.sendFirstMessage(pet, friendshipId);
      this.messageService.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Primeiros passos para resgatar',
        life: 3000,
      });
      
      this.router.navigate(['/chat',  friendshipId])

    } catch (error: any) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: error.error,
        life: 3000,
      });
    }
  }

  // Send message to private recipient in real time, and backend save on db.
  sendFirstMessage(pet: Pet, friendshipId: string) {
    this.chatService.sendMessage(
      pet.filename, // message
      this.user.id, // authorMessageId
      pet.user_id, // recipientId
      new Date(),
      "img",
      friendshipId // Id post pet
    );

    this.chatService.sendMessage(
      `Olá eu me chamo ${ this.user.name } e desejo resgatar o ${ pet.name } com ID: ${ pet.id }`, // message
      this.user.id, // authorMessageId
      pet.user_id, // recipientId
      new Date(), // time
      "message", // type
      friendshipId // Id post pet
    );
  }

  confirm1(event: Event, pet: Pet) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Tem certeza que deseja resgatar este pet?',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim',
      rejectLabel: 'Não',
      accept: async () => {
        if(!this.user){
          this.messageService.add({
            severity: 'error',
            summary: 'Não autorizado',
            detail: 'Você deve estar logado para resgatar este pet',
            life: 3000,
          });
          return;
        }
        await this.rescuePet(pet);

      },
      reject: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Cancelado',
          detail: 'Você cancelou a ação',
          life: 3000,
        });
      }
    });
  }
}
