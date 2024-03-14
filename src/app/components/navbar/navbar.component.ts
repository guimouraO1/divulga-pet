import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatBadgeModule } from '@angular/material/badge';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { Subject, takeUntil } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [MatIconModule, MatMenuModule, MatBadgeModule, RouterLink, RouterLinkActive, MatButtonModule, MatIconModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent implements OnDestroy, OnInit {
  user!: User;  
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
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
      });
    }
  
  logout() {
    localStorage.clear();
    this.authService.changeUser(null);
    this.router.navigate(['']);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
