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
  lastValueFrom,
  of,
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
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DialogModule } from 'primeng/dialog';
import { ImageModule } from 'primeng/image';


@Component({
  selector: 'app-happy-stories',
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
    MatTooltipModule,
    DialogModule,
    ImageModule
  ],
  templateUrl: './happy-stories.component.html',
  styleUrl: './happy-stories.component.scss',
  providers: [ConfirmationService, MessageService],
})
export class HappyStoriesComponent {
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
  visibleModal = false;

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;

  constructor(
    private authService: AuthService,
    private petService: PetService,
    private route: ActivatedRoute,
    private router: Router,
    public messageService: MessageService
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
        this.petService.getPublications(this.pet, this.offset, this.limit, 'happy')
      );

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
}

