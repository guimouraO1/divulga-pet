import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { Observable, Subject, lastValueFrom, of, take, takeUntil } from 'rxjs';
import { Pet } from '../../models/pet.model';
import { AsyncPipe, CommonModule } from '@angular/common';
import { PetService } from '../../services/pet.service';
import { SkeletonModule } from 'primeng/skeleton';
import { User } from '../../models/user.model';

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
    SkeletonModule
  ],
  templateUrl: './find-pet.component.html',
  styleUrl: './find-pet.component.scss',
})
export class FindPetComponent {

  protected petList: Pet[] = [];
  protected updatedListPet$: Observable<Pet[]> | undefined;
  private destroy$ = new Subject<void>();
  protected pageSize: number = 3; // Tamanho da página
  protected currentPage: number = 1; // Página atual
  protected totalItems: number = 0;
  protected user!: User;
  protected offset =  0;
  protected limit = 9;

  protected pet: any = {
    species: 'all',
    status: 'all',
  };

  constructor(
  private authService: AuthService,
  private petService: PetService    
  ) {
  }

  async ngOnInit() {
    this.subscribeToUserChanges();
    await this.getPublications();
  }

  private subscribeToUserChanges(): void {
    this.authService
      .User$()
      .pipe(takeUntil(this.destroy$))
      .subscribe((user: any) => {
        this.user =  user;
      });
    }
  
  async getPublications() {
    try {
      const petList: Pet[] = await lastValueFrom(this.petService.getPublications(this.offset, this.limit));
      this.petList.push(...petList);
      this.totalItems = this.petList.length;
      this.updateupdatedListPet$();
    } catch (error) {

    }
  }

  async getMorePets() {
    this.offset += this.limit;
    await this.getPublications();
  }
  
  pageChange(event: PageEvent) {
    this.currentPage = event.pageIndex + 1;
    this.updateupdatedListPet$();
  }

  updateupdatedListPet$() {
    let filteredList = this.petList;
  
    if (this.pet.status !== 'all' || this.pet.species !== 'all') {
      if (this.pet.status !== 'all' && this.pet.species !== 'all') {
        filteredList = this.petList
          .filter((pet: any) =>
            this.pet.status.includes(pet.status?.toLowerCase())
          )
          .filter((pet: any) =>
            this.pet.species.includes(pet.species?.toLowerCase())
          );
      } else if (this.pet.status === 'all') {
        filteredList = this.petList.filter((pet: any) =>
          this.pet.species.includes(pet.species?.toLowerCase())
        );
      } else if (this.pet.species === 'all') {
        filteredList = this.petList.filter((pet: any) =>
          this.pet.status.includes(pet.status?.toLowerCase())
        );
      }
    }

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
    console.log(event.value)
    if (filter === 'status') {
      this.pet.status = event.value;
    }

    if (filter === 'species') {
      this.pet.species = event.value;
    }
    console.log(this.pet);
    this.updateupdatedListPet$();
  }

  rescue() {
    try {
      console.log('fazer algo!')
    } catch (error) {}
  }
}
