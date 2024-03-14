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

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    public dialog: MatDialog,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.petForm = this.fb.group({
      petName: ['Unknown', [Validators.required]],
      petRace: ['Unknown', [Validators.required]],
      petSpecies: ['', [Validators.required]],
      petSex: ['', [Validators.required]],
      status: ['', [Validators.required]],
      petLastLocation: ['Unknown', [Validators.required]],
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
  //           this.authService.openSnackBar('Pet posted  successful!', '✅');
  //         }
  //       },
  //       error: (e) => {
  //         this.authService.openSnackBar(e.error.msg, '❗');
  //       },
  //     });
  // }

  // onSubmit() {
  //   // Check if the form is valid before proceeding

  //   const petNameControl = this.petForm.get('petName');
  //   const petRaceControl = this.petForm.get('petRace');
  //   const petSpeciesControl = this.petForm.get('petSpecies');
  //   const petSexControl = this.petForm.get('petSex');
  //   const statusControl = this.petForm.get('status');
  //   const petLastLocationControl = this.petForm.get('petLastLocation');

  //   if (
  //     petNameControl &&
  //     petRaceControl &&
  //     petSpeciesControl &&
  //     petSexControl &&
  //     statusControl &&
  //     petLastLocationControl &&
  //     this.selectedFile &&
  //     this.petForm.valid
  //   ) {
  //     const petName = petNameControl.value;
  //     const petRace = petRaceControl.value;
  //     const petSpecies = petSpeciesControl.value;
  //     const petSex = petSexControl.value;
  //     const status = statusControl.value;
  //     const petLastLocation = petLastLocationControl.value;
  //     const petFileName = this.selectedFile.name;

  //     try {
  //       this.uploadImage();
  //       this.postPet(
  //         petName,
  //         petRace,
  //         petSpecies,
  //         petSex,
  //         status,
  //         petLastLocation,
  //         petFileName
  //       );
  //     } catch (error) {}
  //   } else {
  //     this.authService.openSnackBar('All fields must be filled', '❗');
  //   }
  // }
}
