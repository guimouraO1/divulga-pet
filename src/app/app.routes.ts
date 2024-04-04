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
        title: 'FindPet | Login',
        loadComponent: () =>
          import('./pages/login/login.component').then((p) => p.LoginComponent),
      },
      {
        path: 'register',
        title: 'FindPet | Register',
        loadComponent: () =>
          import('./pages/register/register.component').then((p) => p.RegisterComponent),
      },
      {
        path: 'findPet',
        title: 'FindPet | Find Pet',
        loadComponent: () =>
          import('./pages/find-pet/find-pet.component').then((p) => p.FindPetComponent),
      },
      {
        path: 'happyStories',
        title: 'FindPet | Happy Stories',
        loadComponent: () =>
          import('./pages/happy-stories/happy-stories.component').then((p) => p.HappyStoriesComponent),
      },
    ],
  },
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: 'chat',
        title: 'FindPet | Chat',
        loadComponent: () => import('./pages/chat/chat.component').then((p) => p.ChatComponent),
          children: [{
            path: ':userId',
            component: ConversationMessagesComponent
          }]
      },
      {
        path: 'findPet',
        title: 'FindPet | Find Pet',
        loadComponent: () =>
          import('./pages/find-pet/find-pet.component').then((p) => p.FindPetComponent),
      },
      {
        path: 'postPet',
        title: 'FindPet | Post Pet',
        loadComponent: () =>
          import('./pages/post-pet/post-pet.component').then(
            (p) => p.PostPetComponent
          ),
      },
      {
        path: 'profile',
        title: 'FindPet | Profile',
        loadComponent: () =>
          import('./pages/profile/profile.component').then(
            (p) => p.ProfileComponent
          ),
      },
    ],
  },
  {
    path: '**',
    title: 'Sospet | 404',
    canActivate: [alwaysAllowAuthGuard],
    loadComponent: () =>
      import('./pages/not-found/not-found.component').then(
        (p) => p.NotFoundComponent
      ),
  },
];
