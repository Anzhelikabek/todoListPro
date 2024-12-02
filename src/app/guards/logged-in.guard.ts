import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoggedInGuard implements CanActivate {
  constructor(private auth: Auth, private router: Router) {}

  canActivate(): Observable<boolean> {
    return new Observable<boolean>((observer) => {
      this.auth.onAuthStateChanged((user) => {
        if (user) {
          // Если пользователь авторизован, перенаправляем на /main
          this.router.navigate(['/main']);
          observer.next(false);
          observer.complete();
        } else {
          // Если пользователь не авторизован, разрешаем доступ
          observer.next(true);
          observer.complete();
        }
      });
    });
  }
}
