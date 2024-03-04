import { Routes } from '@angular/router';
import { alwaysAllowAuthGuard, authGuard } from './guards/auth.guard';
import { ConversationMessagesComponent } from './pages/conversation-messages/conversation-messages.component';

export const routes: Routes = [
  {
    path: '',
    canActivate: [alwaysAllowAuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      },
      {
        path: 'login',
        title: 'PulseChat | Login',
        loadComponent: () =>
          import('./pages/login/login.component').then((p) => p.LoginComponent),
      },
    ],
  },
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: 'chat',
        title: 'PulseChat | Chat',
        loadComponent: () => import('./pages/chat/chat.component').then((p) => p.ChatComponent),
          children: [{
            path: ':userId',
            component: ConversationMessagesComponent
          }]
      },
      {
        path: 'profile',
        title: 'PulseChat | Profile',
        loadComponent: () => import('./pages/profile/profile.component').then((p) => p.ProfileComponent)
      },
    ],
  },
  {
    path: '**',
    title: 'PulseChat | 404',
    canActivate: [alwaysAllowAuthGuard],
    loadComponent: () =>
      import('./pages/not-found/not-found.component').then(
        (p) => p.NotFoundComponent
      ),
  },
];
