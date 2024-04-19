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
        title: 'Divilga Pet | Login',
        loadComponent: () =>
          import('./pages/login/login.component').then((p) => p.LoginComponent),
      },
      {
        path: 'register',
        title: 'Divilga Pet | Cadastro',
        loadComponent: () =>
          import('./pages/register/register.component').then((p) => p.RegisterComponent),
      },
      {
        path: 'findPet',
        title: 'Divilga Pet | Achados/Perdidos',
        loadComponent: () =>
          import('./pages/find-pet/find-pet.component').then((p) => p.FindPetComponent),
      },
      {
        path: 'happyStories',
        title: 'Divilga Pet | Histórias Felizes',
        loadComponent: () =>
          import('./pages/happy-stories/happy-stories.component').then((p) => p.HappyStoriesComponent),
      },
      {
        path: 'home',
        title: 'Divilga Pet | Início',
        loadComponent: () =>
          import('./pages/home/home.component').then(
            (p) => p.HomeComponent
          ),
      },
    ],
  },
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: 'chat',
        title: 'Divilga Pet | Chat',
        loadComponent: () => import('./pages/chat/chat.component').then((p) => p.ChatComponent),
          children: [{
            path: ':userId',
            component: ConversationMessagesComponent
          }]
      },
      {
        path: 'postPet',
        title: 'Divilga Pet | Publicar Pet',
        loadComponent: () =>
          import('./pages/post-pet/post-pet.component').then(
            (p) => p.PostPetComponent
          ),
      },
      {
        path: 'profile',
        title: 'Divilga Pet  | Perfil',
        loadComponent: () =>
          import('./pages/profile/profile.component').then(
            (p) => p.ProfileComponent
          ),
      },
    ],
  },
  {
    path: '**',
    title: 'Divilga Pet | 404',
    canActivate: [alwaysAllowAuthGuard],
    loadComponent: () =>
      import('./pages/not-found/not-found.component').then(
        (p) => p.NotFoundComponent
      ),
  },
];
