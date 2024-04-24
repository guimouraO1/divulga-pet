import { Component, OnInit } from '@angular/core';
import { MatButtonModule, MatIconButton } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { Pet } from '../../models/pet.model';
import { lastValueFrom } from 'rxjs';
import { PetService } from '../../services/pet.service';
import { SkeletonModule } from 'primeng/skeleton';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    AvatarGroupModule,
    AvatarModule,
    SkeletonModule,
    MatIconButton,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatListModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  constructor(private petService: PetService, private router: Router) {}
  
  protected totalPets: number = 0;
  protected petList: Pet[] = [];
  protected offset = 0;
  protected limit = 9;

  async ngOnInit() {
    await this.getPublications();
  }

  async getPublications() {
    try {
      if (this.petList.length > 0 && this.petList.length === this.totalPets) {
        return;
      }
      const res: any = await lastValueFrom(
        this.petService.getPublications('', this.offset, this.limit, 'happy')
      );
      this.totalPets = res.totalItems;
      this.petList = res.publications;
    } catch (error) {}
  }


  goToPublication(){
    this.router.navigate(['postPet'])
  }

  goToFindPet(){
    this.router.navigate(['findPet'])
  }
}
