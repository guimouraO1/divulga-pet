import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { lastValueFrom } from 'rxjs';
import { PetService } from '../../services/pet.service';

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
  ],
  templateUrl: './post-pet.component.html',
  styleUrl: './post-pet.component.scss',
})
export class PostPetComponent implements OnInit {
  petForm: FormGroup;
  // private urlApi = `${environment.urlApi}`;
  protected disableButton: boolean = false;
  
  constructor(
    private http: HttpClient,
    private authService: AuthService,
    public dialog: MatDialog,
    private fb: FormBuilder,
    private petService: PetService
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
  selectedFile: File | null = null;

  ngOnInit(): void {}

  handleFileInput(event: any): void {
    const files: FileList = event.target.files;
    if (files && files.length > 0) {
      this.selectedFile = files[0];
    }
  }

  // uploadImage(): void {
  //   if (this.selectedFile) {
  //     const formData: FormData = new FormData();
  //     const token = localStorage.getItem('token');
  //     const headers = new HttpHeaders().set('authorization', `${token}`);
  //     formData.append('file', this.selectedFile);
  //     this.http
  //       .post(`${this.urlApi}/uploadPet`, formData, { headers })
  //       .subscribe((response: any) => {
  //         try {
  //           // this.authService.openSnackBar('Image successfully uploaded!', '✅');
  //         } catch (e) {

  //         }
  //       });
  //   }
  // }

  // postPet(
  //   petName: any,
  //   petRace: any,
  //   petSpecies: any,
  //   petSex: any,
  //   status: any,
  //   petLastLocation: any,
  //   petFileName: any
  // ) {
  //   const token = localStorage.getItem('token');
  //   const headers = new HttpHeaders().set('authorization', `${token}`);

  //   this.http
  //     .post(
  //       `${this.urlApi}/publication`,
  //       {
  //         petName,
  //         petRace,
  //         petSpecies,
  //         petSex,
  //         status,
  //         petLastLocation,
  //         petFileName,
  //       },
  //       { headers }
  //     )
  //     .subscribe({
  //       next: (res: any) => {
  //         if (res) {
  //           this.router.navigate(['home']);
  //         }
  //       },
  //       error: (e) => {
  //       },
  //     });
  // }

  async onSubmit() {
    if (this.selectedFile && this.petForm.valid) {
      try {
        this.disableButton = true;
        const url: any = await lastValueFrom(this.petService.getSignature(this.selectedFile));
        await lastValueFrom(this.petService.uploadImageToCloudFlare(url.signedUrl, this.selectedFile));
        const urlImage = await lastValueFrom(this.petService.getImageLink(url.fileKey));


      } catch (error) {

      }finally{
        this.disableButton = false;
      }
    } else {

    }
  }
}
