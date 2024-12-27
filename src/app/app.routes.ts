import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { LoggedInGuard } from './guards/logged-in.guard';

export const routes: Routes = [
  // Доступ к /login только для неавторизованных пользователей
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
    canActivate: [LoggedInGuard],
  },

  // Доступ к /register только для неавторизованных пользователей
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent),
    canActivate: [LoggedInGuard],
  },

  // Доступ к /main только для авторизованных пользователей
  {
    path: 'main',
    loadComponent: () => import('./pages/main/main.component').then(m => m.MainComponent),
    canActivate: [AuthGuard],
  },

  // Редирект на /login, если путь не указан
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  // Редирект на /login для неизвестных маршрутов
  { path: '**', redirectTo: '/login' },
];
