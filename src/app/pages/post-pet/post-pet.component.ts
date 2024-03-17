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
import { lastValueFrom, take } from 'rxjs';
import { PetService } from '../../services/pet.service';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { GoogleMap, MapMarker, MapGeocoder } from '@angular/google-maps';
import {MatStepperModule} from '@angular/material/stepper';

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
    ToastModule,
    GoogleMap,
    MapMarker,
    MatStepperModule
  ],
  templateUrl: './post-pet.component.html',
  styleUrl: './post-pet.component.scss',
  providers: [MessageService]
})
export class PostPetComponent implements OnInit {
  protected petForm: FormGroup;
  protected disableButton: boolean = false;
  protected selectedFile: File | null = null;
  protected location: string = '';
  protected locationInput: any;
  protected options?: google.maps.MapOptions;
  protected positionLatLng!: google.maps.LatLngLiteral;
  protected locationForm: FormGroup;
  protected options2 = {
    center: { lat: -28, lng: -70 },
    zoom: 2,
  };

  constructor(
    public dialog: MatDialog,
    private fb: FormBuilder,
    private petService: PetService,
    private messageService: MessageService,
    private geocoder: MapGeocoder
  ) {
    this.petForm = this.fb.group({
      name: ['Unknown', [Validators.required]],
      breed: ['Unknown', [Validators.required]],
      species: ['', [Validators.required]],
      sex: ['', [Validators.required]],
      status: ['', [Validators.required]]
    });

    this.locationForm = this.fb.group({
      last_location: ['Unknown', [Validators.required]],
    });
  }

  ngOnInit(): void {
  }

  handleFileInput(event: any): void {
    const files: FileList = event.target.files;
    if (files && files.length > 0) {
      this.selectedFile = files[0];
    }
  }

  async onSubmit() {
    if(!this.selectedFile){
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Select an image with the upload image button.' });
      return;
    }
    if (this.selectedFile && this.petForm.valid && this.locationForm.valid && this.positionLatLng) {
      try {
        this.disableButton = true;
        const url: any = await lastValueFrom(this.petService.getSignature(this.selectedFile));
        await lastValueFrom(this.petService.uploadImageToCloudFlare(url.signedUrl, this.selectedFile));
        const urlImage: any = await lastValueFrom(this.petService.getImageLink(url.fileKey));
        const petForm = Object.assign(this.petForm.value, this.locationForm.value);
        petForm.filename = urlImage.signedUrl;
        await lastValueFrom(this.petService.postPet(petForm));
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Pet posted!' });
      } catch (error) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'An error occurred when trying to post pet' });
      }finally{
        this.disableButton = false;
      }
    } else {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Fill in all the fields, and add an image.' });
    }
  }

  autocomplete(query: string) {
    if (query) {
      this.geocoder
        .geocode({ address: query, language: 'pt-BR' })
        .pipe(take(1))
        .subscribe(({ results }) => {
          this.location = results[0].formatted_address;
          this.locationInput = results[0].formatted_address;

          this.positionLatLng = { lat: results[0].geometry.location.lat(), lng: results[0].geometry.location.lng()};

          this.options = {
            center: this.positionLatLng,
            zoom: 16,
          };
        });
    } else {
    }
  }

  getUserLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((positionLatLng) => {
        this.positionLatLng = { lat: positionLatLng.coords.latitude, lng: positionLatLng.coords.longitude };
        this.geocoder
          .geocode({ location: this.positionLatLng })
          .pipe(take(1))
          .subscribe(({ results }) => {
            this.location = results[0].formatted_address;
            this.locationInput = results[0].formatted_address;

            this.options = {
              center: this.positionLatLng,
              zoom: 16,
            };
          });
      });
    } else {
    }
  }
}
