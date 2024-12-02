import { Component } from '@angular/core';
import {InputTextModule} from 'primeng/inputtext';
import {PasswordModule} from 'primeng/password';
import {ButtonDirective} from 'primeng/button';
import {DividerModule} from 'primeng/divider';
import {AuthService} from '../../services/auth.service';
import {Router, RouterLink} from '@angular/router';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    InputTextModule,
    PasswordModule,
    ButtonDirective,
    DividerModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  hidePassword: boolean = true; // Скрывать пароль по умолчанию

  constructor(private authService: AuthService, private router: Router) {
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword; // Переключаем состояние
  }
  onLogin() {
    if (!this.email || !this.password) {
      alert('Please fill in all required fields');
      return;
    }
    console.log('Logging in with:', this.email, this.password);
    this.authService.login(this.email, this.password)
      .then(() => {
        this.router.navigate(['/main']).then(() => {
          window.location.reload();
          this.clearInputs();
        });

      })
      .catch(err => {
        alert('Login failed: ' + err.message);
        this.clearInputs(); // Очистка инпутов в случае ошибки
      });
  }

  clearInputs() {
    this.email = '';
    this.password = '';
  }
}

