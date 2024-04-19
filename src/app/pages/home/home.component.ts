import { Component, OnInit } from '@angular/core';
import { MatButtonModule, MatIconButton } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { Pet } from '../../models/pet.model';
import { lastValueFrom } from 'rxjs';
import { PetService } from '../../services/pet.service';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, AvatarGroupModule, AvatarModule, SkeletonModule, MatIconButton, MatIconModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit{

  constructor(private petService: PetService){

  }
  protected totalPets: number = 0;
  protected petList: Pet[] = [];
  protected offset = 0;
  protected limit = 9;

  async ngOnInit() {
    await this.getPublications()
  }

  async getPublications() {
    try {
      if (this.petList.length > 0 && this.petList.length === this.totalPets) {
        return;
      }
      const res: any = await lastValueFrom(this.petService.getPublications('', this.offset, this.limit, 'happy'));
      this.totalPets = res.totalItems;
      this.petList = res.publications;
    } catch (error) {


    }
  }

}
