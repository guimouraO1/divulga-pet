import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { SkeletonModule } from 'primeng/skeleton';
import { Subject, lastValueFrom, take, takeUntil } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { PetService } from '../../services/pet.service';
import { UserService } from '../../services/user.service';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { GoogleMap, MapGeocoder } from '@angular/google-maps';
import { Pet } from '../../models/pet.model';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    FormsModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatDividerModule,
    MatListModule,
    MatPaginatorModule,
    MatProgressBarModule,
    SkeletonModule,
    ToastModule,
    ConfirmPopupModule,
    NgxMaskDirective,
    GoogleMap,
    ClipboardModule,
    MatTooltipModule
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  providers: [ConfirmationService, MessageService, provideNgxMask()],
})
export class ProfileComponent implements OnInit, OnDestroy {
  protected userForm: FormGroup;
  protected user: any;
  protected petList?: any = [];
  private destroy$ = new Subject<void>();
  protected selectedFile: File | null = null;
  protected disableButton: boolean = false;

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private el: ElementRef,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private petService: PetService,
    private userService: UserService,
    private geocoder: MapGeocoder,
    private router: Router
  ) {
    this.userForm = this.fb.group({
      firstName: ['', [Validators.maxLength(40), Validators.minLength(3)]],
      lastName: ['', [Validators.maxLength(40)]],
      telephone: ['', [Validators.maxLength(40)]],
      address: ['', [Validators.maxLength(800)]],
      cep: ['', [Validators.maxLength(60)]],
    });
  }

  ngOnInit(): void {
    this.subscribeToUserChanges();
    this.getUserPublications();
  }

  async getUserPublications(){
    this.petList = await lastValueFrom(this.petService.getUserPublications());
  }

  private subscribeToUserChanges(): void {
    this.authService
      .User$()
      .pipe(takeUntil(this.destroy$))
      .subscribe((user: any) => {
        this.user = user;
        this.userForm.patchValue({
          firstName: this.user.name,
          lastName: this.user.lastName,
          telephone: this.user.telephone,
          address: this.user.address,
          cep: this.user.cep,
        });
      });
  }

  onSubmit() {
    if (this.userForm.valid) {
      lastValueFrom(this.userService.updateProfile(this.userForm.value));
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'You have updated your profile!',
        life: 3000,
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Canceled',
        detail: 'Fill in the fields correctly',
        life: 3000,
      });
      return;
    }
  }

  handleFileInput(event: any): void {
    const files: FileList = event.target.files;
    if (files && files.length > 0) {
      this.selectedFile = files[0];
    }
  }

  scrollToContainer() {
    if(this.petList.length <= 0){
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'You have no publications',
        life: 3000,
      });
      return;
    }
    const containerElement = this.el.nativeElement.querySelector('#container-posts');
    if (containerElement) {
      containerElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

  confirm1(event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message:
        'Are you sure you want to add this image as your profile picture?',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        if (this.selectedFile) {
          await this.uploadImage();
          this.messageService.add({
            severity: 'info',
            summary: 'Confirmed',
            detail: 'You have accepted',
            life: 3000,
          });
        }
        this.selectedFile = null;
      },
      reject: () => {
        this.selectedFile = null;
        this.messageService.add({
          severity: 'error',
          summary: 'Rejected',
          detail: 'You have rejected',
          life: 3000,
        });
      },
    });
  }

  confirm2(event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Are you sure you want to update your profile information?',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.onSubmit();
      },
      reject: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Canceled',
          detail: 'You canceled the action',
          life: 3000,
        });
      },
    });
  }
  
  confirm3(event: Event, id: string) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Are you sure you want to delete this post?',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        await this.deletePublications(id);
      },
      reject: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Canceled',
          detail: 'You canceled the action',
          life: 3000,
        });
      },
    });
  }

  async deletePublications(id: string){
    try {
      await lastValueFrom(this.petService.deletePublications(id));
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: `Publication id ${id} deleted`,
        life: 3000,
      });
      this.petList = this.petList.filter((pet: Pet) => pet.id !== id);
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Error, try again',
        life: 3000,
      });
    }
  }

  async uploadImage() {
    const url: any = await lastValueFrom(
      this.petService.getSignature(this.selectedFile!)
    );
    await lastValueFrom(
      this.petService.uploadImageToCloudFlare(url.signedUrl, this.selectedFile!)
    );
    const filename: any = await lastValueFrom(
      this.petService.getImageLink(url.fileKey)
    );
    this.user.profile_pic = filename.signedUrl;
    await lastValueFrom(this.userService.profilePic(filename));
  }

  autocomplete(query: string) {
    if (query) {
      this.geocoder
        .geocode({ address: query, language: 'pt-BR' })
        .pipe(take(1))
        .subscribe({
          next: (res: any) => {
            if(res.status == 'ZERO_RESULTS'){
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'This location dont exist',
              });
              return;
            }
            if (res.status == 'OK') {
              this.userForm.patchValue({
                address: res.results[0].formatted_address,
              });
            }
          },
          error: (err) => {
            console.log('Erro ao geocodificar:', err);
            console.log('Local não encontrado.');
          },
        });
    }
  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  seeHappyStorie(pet: Pet) {
    this.router.navigate(['/happyStories'], { queryParams: { id: pet.id } });
  }
}
