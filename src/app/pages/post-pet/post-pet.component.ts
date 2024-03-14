import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { lastValueFrom } from 'rxjs';
import { PetService } from '../../services/pet.service';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-post-pet',
  standalone: true,
  imports: [
    FormsModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    ReactiveFormsModule,
    CommonModule,
    MatSelectModule,
    ToastModule
  ],
  templateUrl: './post-pet.component.html',
  styleUrl: './post-pet.component.scss',
  providers: [MessageService]
})
export class PostPetComponent implements OnInit {
  petForm: FormGroup;
  // private urlApi = `${environment.urlApi}`;
  protected disableButton: boolean = false;
  selectedFile: File | null = null;

  constructor(
    public dialog: MatDialog,
    private fb: FormBuilder,
    private petService: PetService,
    private messageService: MessageService
  ) {
    this.petForm = this.fb.group({
      name: ['Unknown', [Validators.required]],
      breed: ['Unknown', [Validators.required]],
      species: ['', [Validators.required]],
      sex: ['', [Validators.required]],
      status: ['', [Validators.required]],
      last_location: ['Unknown', [Validators.required]],
    });
  }

  ngOnInit(): void {}

  handleFileInput(event: any): void {
    const files: FileList = event.target.files;
    if (files && files.length > 0) {
      this.selectedFile = files[0];
    }
  }

  async onSubmit() {
    if (this.selectedFile && this.petForm.valid) {
      try {
        this.disableButton = true;
        const url: any = await lastValueFrom(this.petService.getSignature(this.selectedFile));
        await lastValueFrom(this.petService.uploadImageToCloudFlare(url.signedUrl, this.selectedFile));
        const urlImage: any = await lastValueFrom(this.petService.getImageLink(url.fileKey));
        const petForm = this.petForm.value;
        petForm.filename = urlImage.signedUrl;
        await lastValueFrom(this.petService.postPet(petForm));
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Pet posted!' });
      } catch (error) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'An error occurred when trying to post pet' });
      }finally{

        /// COLOAR ALGO PARA MOSTRAR QUE POSTOU!
        this.disableButton = false;
      }
    } else {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Fill in all the fields, and add an image.' });
    }
  }
}
