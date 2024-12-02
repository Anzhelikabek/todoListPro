import { Component } from '@angular/core';
import {InputTextModule} from 'primeng/inputtext';
import {FormsModule} from '@angular/forms';
import {PasswordModule} from 'primeng/password';
import {CheckboxModule} from 'primeng/checkbox';
import {Button, ButtonDirective} from 'primeng/button';
import {Ripple} from 'primeng/ripple';
import {Router, RouterLink} from '@angular/router';
import {DividerModule} from 'primeng/divider';
import {AuthService} from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    InputTextModule,
    FormsModule,
    PasswordModule,
    CheckboxModule,
    ButtonDirective,
    Ripple,
    RouterLink,
    Button,
    DividerModule
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  email = '';
  password = '';

  constructor(private authService: AuthService, private router: Router) {}
  hidePassword: boolean = true; // Скрывать пароль по умолчанию

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword; // Переключаем состояние
  }
  onRegister(): void {
    if (!this.email || !this.password) {
      alert('Please fill in all required fields');
      return;
    }

    if (this.password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    this.authService.register(this.email, this.password)
      .then(() => {
        alert('Registration successful!');
        this.router.navigate(['/main']);
      })
      .catch(err => {
        alert('Registration failed: ' + err.message);
      });
  }


  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  clearInputs() {
    this.email = '';
    this.password = '';
  }

  // onGoogleSignIn() {
  //   this.authService.googleSignIn()
  //     .then(user => alert(`Welcome, ${user.displayName}!`))
  //     .catch(err => alert(`Google Sign-In Failed: ${err.message}`));
  // }
  protected readonly name = name;
}

