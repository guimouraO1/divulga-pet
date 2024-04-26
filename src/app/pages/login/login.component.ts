import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
    selector: 'app-login',
    standalone: true,
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss',
    providers: [MessageService],
    imports: [
        MatButtonModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
        MatTooltipModule,
        ToastModule
      ]
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  disableButton: boolean = false;
  listenDisableButton!: Subscription;
  hide = true;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService
  ) {
    this.listenDisableButton = this.authService
      .getEventEmitter()
      .subscribe((value) => (this.disableButton = value));
  }

  async ngOnInit() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.maxLength(30)]],
    });

    await this.isLogged();
  }

  async login() {
    const res: any = await this.authService.login(this.loginForm.value);
    if(res.error){
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: res.error.msg,
        life: 3000,
      });
    }
  }

  onSubmit(): void {
    if (!this.loginForm.valid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: `Por favor preencha todos os campos obrigatórios`,
        life: 3000,
      });
      return;
    }

    if (this.loginForm.valid) {
      this.login();
    }
    return;
  }

  goToRegister(){
    this.router.navigate(['register']);
  }

  async isLogged() {
    let result = await this.authService.asycUserAuthentication();
    if (result) {
      this.router.navigate(['findPet']);
    } else {
      this.router.navigate(['login']);
    }
  }
}
