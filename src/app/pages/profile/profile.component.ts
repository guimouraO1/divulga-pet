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
import { Subject, lastValueFrom, takeUntil } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { PetService } from '../../services/pet.service';
import { UserService } from '../../services/user.service';

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
    ConfirmPopupModule
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  providers: [ConfirmationService, MessageService]
})
export class ProfileComponent implements OnInit, OnDestroy {
  userForm: FormGroup;
  user: any;
  petList?: any = [];
  paginaterdPets: any[] = [];
  pageSize: number = 3; 
  currentPage: number = 1;
  currentFilter: any;
  totalItems: number = 0;
  private destroy$ = new Subject<void>();
  protected selectedFile: File | null = null;

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private el: ElementRef,
    private confirmationService: ConfirmationService, 
    private messageService: MessageService,
    private petService: PetService,
    private userService: UserService
  ) {
    this.userForm = this.fb.group({
      firstName: ['', [Validators.maxLength(60)]],
      lastName: ['', [Validators.maxLength(60)]],
      telephone: ['', [Validators.maxLength(60)]],
      address: ['', [Validators.maxLength(60)]],
      cep: ['', [Validators.maxLength(60)]],
    });
  }

  ngOnInit(): void {
    this.subscribeToUserChanges();
  }

  private subscribeToUserChanges(): void {
    this.authService
      .User$()
      .pipe(takeUntil(this.destroy$))
      .subscribe((user: any) => {
        this.user =  user;
        this.userForm.patchValue({
          firstName: this.user.name,
          telephone: this.user.telephone,
          address: this.user.address,
          cep: this.user.cep,
        });
      });
  }

  onSubmit() {
    if (this.userForm.valid) {
      const firstName = this.userForm.get('firstName')!.value;
      const lastName = this.userForm.get('lastName')!.value;
      const telephone = this.userForm.get('telephone')!.value;
      const cep = this.userForm.get('cep')!.value;
      const address = this.userForm.get('address')!.value;
      // this.updateProfile(firstName, lastName, telephone, cep, address);
    }
  }

  handleFileInput(event: any): void {
    const files: FileList = event.target.files;
    if (files && files.length > 0) {
      this.selectedFile = files[0];
    }
    console.log(this.selectedFile);
  }

  pageChange(event: PageEvent) {
    this.currentPage = event.pageIndex + 1;
    this.updatepaginaterdPets();
  }

  updatepaginaterdPets() {
    let filteredList = this.petList;

    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;

    // Ajuste para garantir que a quantidade de animais por página seja consistente
    const remainingItems = filteredList.length - startIndex;
    this.paginaterdPets =
      remainingItems >= this.pageSize
        ? filteredList.slice(startIndex, endIndex)
        : filteredList.slice(startIndex);

    // Atualize o comprimento total da lista para a variável totalItems
    this.totalItems = filteredList.length;
  }

  scrollToContainer() {
    // Obtenha uma referência ao elemento com id 'container'
    const containerElement =
      this.el.nativeElement.querySelector('#container-posts');

    // Verifique se o elemento foi encontrado
    if (containerElement) {
      // Rola até o elemento
      containerElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

  confirm1(event: Event) {
    this.confirmationService.confirm({
        target: event.target as EventTarget,
        message: 'Are you sure you want to add this image as your profile picture?',
        icon: 'pi pi-exclamation-triangle',
        accept: async () => {
            if(this.selectedFile){
              await this.uploadImage();
              this.messageService.add({ severity: 'info', summary: 'Confirmed', detail: 'You have accepted', life: 3000 });
            }
            this.selectedFile = null;
        },
        reject: () => {
            this.selectedFile = null;
            this.messageService.add({ severity: 'error', summary: 'Rejected', detail: 'You have rejected', life: 3000 });
        }
    });
}

  async uploadImage(){
    const url: any = await lastValueFrom(this.petService.getSignature(this.selectedFile!));
    await lastValueFrom(this.petService.uploadImageToCloudFlare(url.signedUrl, this.selectedFile!));
    const filename: any = await lastValueFrom(this.petService.getImageLink(url.fileKey));
    this.user.profile_pic = filename.signedUrl;
    await lastValueFrom(this.userService.profilePic(filename));
  }
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
