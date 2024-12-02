import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private auth: Auth, private router: Router) {}

  canActivate(): Observable<boolean> {
    return new Observable<boolean>((observer) => {
      this.auth.onAuthStateChanged((user) => {
        if (user) {
          // Пользователь авторизован — доступ разрешён
          observer.next(true);
          observer.complete();
        } else {
          // Неавторизованный пользователь — перенаправляем на /login
          this.router.navigate(['/login']);
          observer.next(false);
          observer.complete();
        }
      });
    });
  }
}
