import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { MainComponent } from './pages/main/main.component';
import { UsersComponent } from './pages/users/users.component';
import { AuthGuard } from './guards/auth.guard';
import { LoggedInGuard } from './guards/logged-in.guard';

export const routes: Routes = [
  // Доступ к /login только для неавторизованных пользователей
  { path: 'login', component: LoginComponent, canActivate: [LoggedInGuard] },

  // Доступ к /register только для неавторизованных пользователей
  { path: 'register', component: RegisterComponent, canActivate: [LoggedInGuard] },

  // Доступ к /main только для авторизованных пользователей
  { path: 'main', component: MainComponent, canActivate: [AuthGuard] },

  // Доступ к /users только для авторизованных пользователей
  { path: 'users', component: UsersComponent, canActivate: [AuthGuard] },

  // Редирект на /login, если путь не указан
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  // Редирект на /login для неизвестных маршрутов
  { path: '**', redirectTo: '/login' },
];
